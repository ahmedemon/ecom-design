/* Atelier Nine — shared state (cart, wishlist, orders, user) + helpers. Persists in localStorage. */
const Store = (() => {
  const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem('an:' + k)); return v ?? d; } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem('an:' + k, JSON.stringify(v)); } catch {} };
  const state = { cart: read('cart', []), wishlist: read('wishlist', []), orders: read('orders', []), user: read('user', null), promo: read('promo', null) };
  const emit = () => document.dispatchEvent(new CustomEvent('store:change'));
  const save = (k) => { write(k, state[k]); emit(); };

  const PROMOS = { WELCOME10: { pct: 10, label: '10% off' }, KNIT15: { pct: 15, label: '15% off' } };
  const FREE_SHIP = 100, SHIP = 6.9, EXPRESS = 14;

  const money = n => '$' + Number(n || 0).toFixed(2);
  const find = id => PRODUCTS.find(p => p.id === id);
  const priceFrom = p => { const s = p.variants.filter(v => v.stock > 0).map(v => v.price); return Math.min(...(s.length ? s : p.variants.map(v => v.price))); };
  const hasRange = p => new Set(p.variants.map(v => v.price)).size > 1;
  const cardCompare = p => { const v = p.variants.find(v => v.compareAt && v.stock > 0); return v ? v.compareAt : null; };
  const variantLabel = (p, v) => p.options.map(o => v.options[o.name]).join(' · ');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const swatch = v => ({ Slate:'#475569',Forest:'#1F3D2B',Sand:'#D8C3A5',White:'#F8FAFC',Black:'#111827',Ecru:'#EFE9DC',Navy:'#1E293B',Charcoal:'#374151',Tan:'#B08968',Brown:'#6B4F3A',Olive:'#556B2F',Oat:'#E4D9C6',Cream:'#F5F0E6',Rust:'#B45309',Blue:'#5B82A8',Rinse:'#3B4A5C',Indigo:'#2E4A62' }[v] || '#E5E7EB');

  const cart = {
    count: () => state.cart.reduce((s, l) => s + l.qty, 0),
    lines: () => state.cart.map(l => { const p = find(l.productId); const v = p && p.variants.find(v => v.id === l.variantId); return p && v ? { ...l, product: p, variant: v } : null; }).filter(Boolean),
    add(productId, variantId, qty = 1) {
      const p = find(productId); const v = p && p.variants.find(v => v.id === variantId);
      if (!v || v.stock <= 0) return false;
      const key = productId + '::' + variantId; const ex = state.cart.find(l => l.key === key);
      if (ex) ex.qty = Math.min(ex.qty + qty, v.stock); else state.cart.push({ key, productId, variantId, qty: Math.min(qty, v.stock) });
      save('cart'); toast(`${p.name} added to basket`); return true;
    },
    quickAdd(productId) { const p = find(productId); if (!p) return; if (!p.variants.some(v => v.stock > 0)) return toast('That one is out of stock'); if (!p.options.length) { const v = p.variants.find(v => v.stock > 0); if (cart.add(productId, v.id, 1)) document.dispatchEvent(new Event('cart:added')); return; } picker.open(productId); },
    setQty(key, qty) { const l = state.cart.find(l => l.key === key); if (!l) return; const p = find(l.productId); const v = p.variants.find(v => v.id === l.variantId); l.qty = Math.max(1, Math.min(qty, v.stock)); save('cart'); },
    remove(key) { state.cart = state.cart.filter(l => l.key !== key); save('cart'); },
    clear() { state.cart = []; state.promo = null; write('promo', null); save('cart'); },
    subtotal: () => cart.lines().reduce((s, l) => s + l.variant.price * l.qty, 0),
    discount() { const pr = state.promo && PROMOS[state.promo]; return pr ? +(cart.subtotal() * pr.pct / 100).toFixed(2) : 0; },
    shipping(method = 'standard') { const sub = cart.subtotal() - cart.discount(); if (!sub) return 0; if (method === 'express') return EXPRESS; return sub >= FREE_SHIP ? 0 : SHIP; },
    total(method) { return +(cart.subtotal() - cart.discount() + cart.shipping(method)).toFixed(2); },
    applyPromo(code) { code = (code || '').trim().toUpperCase(); if (!PROMOS[code]) return false; state.promo = code; save('promo'); return true; },
    removePromo() { state.promo = null; save('promo'); }
  };

  // option picker modal — opened by "Add to cart" on product cards so size / colour is chosen first
  const picker = (() => {
    let el, p, sel, qty, lastFocus;
    const av = () => p.variants.find(v => p.options.every(o => v.options[o.name] === sel[o.name])) || null;
    const optOk = (n, val) => p.variants.some(v => v.options[n] === val && v.stock > 0 && p.options.every(o => o.name === n || sel[o.name] == null || v.options[o.name] === sel[o.name]));
    function ensure() {
      if (el) return;
      el = document.createElement('div'); el.id = 'option-picker'; el.hidden = true;
      el.className = 'fixed inset-0 z-[60] flex items-end justify-center sm:items-center';
      el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Choose options');
      el.addEventListener('click', e => {
        if (e.target.dataset.pkClose !== undefined || e.target.closest('[data-pk-close]')) return close();
        const o = e.target.closest('[data-pk-opt]');
        if (o && !o.disabled) { sel = { ...sel, [o.dataset.pkOpt]: o.dataset.pkVal }; fixSel(o.dataset.pkOpt); qty = 1; render(); return; }
        const q = e.target.closest('[data-pk-q]');
        if (q && !q.disabled) { qty += +q.dataset.pkQ; render(); return; }
        if (e.target.closest('[data-pk-add]')) {
          const v = av(); if (!v || v.stock <= 0) return;
          if (cart.add(p.id, v.id, qty)) { close(); document.dispatchEvent(new Event('cart:added')); }
        }
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && el && !el.hidden) close(); });
      document.body.appendChild(el);
    }
    // after changing one option, if the combo is unavailable, switch the other options to a valid in-stock combo
    function fixSel(changed) {
      const v = av(); if (!v || v.stock > 0) return;
      const match = p.variants.find(x => x.stock > 0 && x.options[changed] === sel[changed]);
      if (match) sel = { ...match.options };
    }
    function render() {
      const v = av(), ok = v && v.stock > 0, maxQ = v ? Math.max(1, v.stock) : 1; qty = Math.max(1, Math.min(qty, maxQ));
      const unset = p.options.filter(o => sel[o.name] == null).map(o => o.name.toLowerCase());
      el.innerHTML = `<div class="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px]" data-pk-close></div>
      <div class="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6">
        <div class="flex gap-4">
          <img src="${p.images[0]}" alt="" class="h-20 w-20 shrink-0 rounded-xl bg-gray-50 object-cover" onerror="this.style.opacity=0"/>
          <div class="min-w-0 flex-1">
            <p class="text-[10.5px] font-semibold uppercase tracking-wider text-gray-400">${esc(p.categoryLabel)}</p>
            <h2 class="mt-0.5 text-[15px] font-bold leading-snug text-gray-900">${esc(p.name)}</h2>
            <p class="mt-1 flex flex-wrap items-baseline gap-x-2"><span class="text-[15px] font-bold text-gray-900">${v ? money(v.price) : money(priceFrom(p))}</span>${v && v.compareAt ? `<span class="text-[12px] text-gray-400 line-through">${money(v.compareAt)}</span>` : ''}</p>
          </div>
          <button type="button" data-pk-close class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Close">✕</button>
        </div>
        ${p.options.map(o => `<div class="mt-5"><div class="flex items-baseline justify-between"><p class="text-[12px] font-semibold">${esc(o.name)}</p><p class="text-[12px] font-medium text-gray-500">${sel[o.name] != null ? esc(sel[o.name]) : 'Select ' + esc(o.name.toLowerCase())}</p></div>
          <div class="mt-2 flex flex-wrap gap-2">${o.values.map(val => { const a = optOk(o.name, val), s = sel[o.name] === val;
            return `<button type="button" data-pk-opt="${esc(o.name)}" data-pk-val="${esc(val)}" ${a ? '' : 'disabled'} aria-pressed="${s}" class="flex items-center gap-2 rounded-xl border px-${o.kind === 'color' ? 3 : 4} py-2 text-[13px] font-medium transition ${s ? 'border-brand-600 bg-brand-50 text-brand-800 ring-1 ring-brand-600' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'} ${a ? '' : 'cursor-not-allowed opacity-40 line-through'}">${o.kind === 'color' ? `<span class="h-4 w-4 rounded-full border border-black/10" style="background:${swatch(val)}"></span>` : ''}${esc(val)}</button>`; }).join('')}</div></div>`).join('')}
        <p class="mt-4 text-[12.5px] ${ok ? 'font-medium text-brand-700' : 'text-gray-500'}">${ok ? (v.stock <= 3 ? `● Only ${v.stock} left` : '● In stock') : (unset.length ? 'Please select your ' + unset.join(' and ') : 'Unavailable in this combination')}</p>
        <div class="mt-4 flex items-center gap-2.5">
          <div class="inline-flex items-center rounded-xl border border-gray-200"><button type="button" data-pk-q="-1" ${qty <= 1 ? 'disabled' : ''} class="grid h-11 w-10 place-items-center text-gray-600 hover:bg-gray-50 disabled:opacity-30" aria-label="Decrease quantity">−</button><span class="w-9 text-center text-sm font-bold" aria-live="polite">${qty}</span><button type="button" data-pk-q="1" ${(!ok || qty >= maxQ) ? 'disabled' : ''} class="grid h-11 w-10 place-items-center text-gray-600 hover:bg-gray-50 disabled:opacity-30" aria-label="Increase quantity">+</button></div>
          <button type="button" data-pk-add ${ok ? '' : 'disabled'} class="flex-1 rounded-xl bg-brand-700 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40">Add to cart${ok ? ' · ' + money(v.price * qty) : ''}</button>
        </div>
        <a href="product.html?id=${p.id}" class="mt-4 block text-center text-[12.5px] font-semibold text-brand-700 hover:underline">View full details</a>
      </div>`;
    }
    function open(id) {
      ensure(); p = find(id); if (!p) return;
      sel = {}; p.options.forEach(o => { sel[o.name] = null; }); qty = 1;
      // preselect nothing when an option has several choices; auto-select options that only have one value
      p.options.forEach(o => { if (o.values.length === 1) sel[o.name] = o.values[0]; });
      lastFocus = document.activeElement;
      render(); el.hidden = false; document.body.classList.add('scroll-locked');
      const f = el.querySelector('[data-pk-opt]:not([disabled])') || el.querySelector('[data-pk-close]'); if (f) f.focus();
    }
    function close() {
      if (!el || el.hidden) return; el.hidden = true;
      const d = document.getElementById('cart-drawer'), m = document.getElementById('menu-drawer');
      if ((!d || d.hidden) && (!m || m.hidden)) document.body.classList.remove('scroll-locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    return { open, close };
  })();
  const wish = {
    has: id => state.wishlist.includes(id),
    toggle(id) { if (wish.has(id)) { state.wishlist = state.wishlist.filter(x => x !== id); toast('Removed from wishlist'); } else { state.wishlist.push(id); toast('Saved to wishlist'); } save('wishlist'); },
    items: () => state.wishlist.map(find).filter(Boolean)
  };
  const orders = {
    all: () => state.orders,
    get: id => state.orders.find(o => o.id.toLowerCase() === String(id).trim().toLowerCase()),
    create(data) {
      const id = 'AN-' + Math.floor(100000 + Math.random() * 900000);
      const order = { id, createdAt: new Date().toISOString(), ...data };
      state.orders.unshift(order); save('orders'); return order;
    }
  };
  const user = {
    get: () => state.user,
    signIn(u) { state.user = u; save('user'); },
    signOut() { state.user = null; save('user'); }
  };

  function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
      el.className = 'pointer-events-none fixed bottom-6 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 transition duration-300 opacity-0 translate-y-3'; document.body.appendChild(el); }
    el.innerHTML = `<div class="flex items-center gap-3 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white shadow-2xl"><svg class="h-4 w-4 shrink-0 text-brand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${esc(msg)}</span></div>`;
    el.classList.remove('opacity-0', 'translate-y-3');
    clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.add('opacity-0', 'translate-y-3'), 2600);
  }

  const star = (fill = 'currentColor', cls = 'h-3.5 w-3.5') => `<svg class="${cls}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="1.3"><path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8Z"/></svg>`;
  const heart = (on) => `<svg class="h-4 w-4 ${on ? 'fill-rose-500 stroke-rose-500' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z" stroke-linejoin="round"/></svg>`;

  function productCard(p) {
    const cmp = cardCompare(p); const on = wish.has(p.id);
    return `<article class="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:border-gray-300 hover:shadow-card">
      <div class="relative aspect-square overflow-hidden bg-gray-50">
        <a href="product.html?id=${p.id}" class="block h-full" aria-label="${esc(p.name)}"><img src="${p.images[0]}" alt="${esc(p.name)}" loading="lazy" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" onerror="this.style.opacity=0"/></a>
        ${p.badge ? `<span class="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-gray-900 shadow-sm backdrop-blur">${esc(p.badge)}</span>` : ''}
        <button type="button" data-wish="${p.id}" aria-pressed="${on}" aria-label="${on ? 'Remove' : 'Save'} ${esc(p.name)} ${on ? 'from' : 'to'} wishlist" class="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white">${heart(on)}</button>
      </div>
      <div class="flex flex-1 flex-col p-3.5">
        <p class="text-[10.5px] font-semibold uppercase tracking-wider text-gray-400">${esc(p.categoryLabel)}</p>
        <h3 class="mt-1 line-clamp-2 text-[14px] font-semibold leading-snug text-gray-900"><a href="product.html?id=${p.id}" class="transition hover:text-brand-700">${esc(p.name)}</a></h3>
        <div class="mt-1.5 flex items-center gap-1 text-[11.5px] text-gray-500"><span class="text-amber-500">${star()}</span><span class="font-semibold text-gray-700">${p.rating.toFixed(1)}</span><span class="text-gray-300">·</span><span>${p.reviews}</span></div>
        <div class="mt-auto pt-3">
          <div class="flex flex-wrap items-baseline gap-x-2"><span class="text-[15px] font-bold text-gray-900">${hasRange(p) ? '<span class="text-[11px] font-medium text-gray-400">from </span>' : ''}${money(priceFrom(p))}</span>${cmp ? `<span class="text-[12px] text-gray-400 line-through">${money(cmp)}</span>` : ''}</div>
          <button type="button" data-quickadd="${p.id}" class="mt-2.5 w-full rounded-xl bg-brand-700 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-800 active:scale-[.99]">Add to cart</button>
        </div>
      </div>
    </article>`;
  }

  // global delegated handlers for product cards
  document.addEventListener('click', e => {
    const w = e.target.closest('[data-wish]'); if (w) { e.preventDefault(); wish.toggle(w.dataset.wish); return; }
    const q = e.target.closest('[data-quickadd]'); if (q) { e.preventDefault(); cart.quickAdd(q.dataset.quickadd); }
  });
  document.addEventListener('store:change', () => {
    document.querySelectorAll('[data-wish]').forEach(b => { const on = wish.has(b.dataset.wish); b.setAttribute('aria-pressed', on); const svg = b.querySelector('svg'); if (svg) svg.classList.toggle('fill-rose-500', on), svg.classList.toggle('stroke-rose-500', on); });
  });

  return { state, cart, picker, wish, orders, user, PROMOS, FREE_SHIP, SHIP, EXPRESS, money, find, priceFrom, hasRange, cardCompare, variantLabel, esc, swatch, toast, star, heart, productCard };
})();
window.toast = Store.toast;
