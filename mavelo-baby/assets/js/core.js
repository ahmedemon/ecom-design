/* MaveloBaby core — shared by the storefront and the admin panel.
   State lives in localStorage ("bb-*" keys) until the Laravel API exists (Phase 2). */
(function () {
  'use strict';
  const B = window.BB;
  const ROOT = document.body.dataset.root || '';           // '' for root pages, '../' for /admin
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '৳' + Number(n || 0).toLocaleString('en-BD');
  const read = (k, d) => { try { const v = localStorage.getItem('bb-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem('bb-' + k, JSON.stringify(v)); } catch (e) { /* storage full/blocked */ } };
  const clone = o => JSON.parse(JSON.stringify(o));

  /* ---------- seed orders ---------- */
  function seedOrders() {
    const now = Date.now();
    return B.seedOrders.map(([id, ci, ago, items, status, payment, district]) => {
      const c = B.customers[ci];
      const lines = items.map(([pid, q]) => { const p = B.products.find(x => x.id === pid); return { id: pid, name: p.name, price: p.price, qty: q, vkey: '', variant: '' }; });
      const sub = lines.reduce((s, l) => s + l.price * l.qty, 0);
      const delivery = district === 'Dhaka' ? 80 : 150;
      return { id, name: c.name, email: c.email, phone: c.phone, address: 'Sample address', city: district === 'Dhaka' ? 'Dhaka' : 'Chattogram', district, notes: '',
        payment, paid: status === 'Delivered' || (payment !== 'Cash on Delivery' && status !== 'Pending'), status,
        created: new Date(now - ago * 864e5).toISOString().slice(0, 10), items: lines, subtotal: sub, discount: 0, delivery, total: sub + delivery };
    });
  }

  /* ---------- state ---------- */
  if (read('ver', null) !== '3') { ['products', 'cart', 'orders', 'attributes'].forEach(k => localStorage.removeItem('bb-' + k)); save('ver', '3'); }
  const savedSettings = read('settings', {});
  const S = {
    products: read('products', clone(B.products)),
    attributes: read('attributes', clone(B.attributes)),
    categories: read('categories', clone(B.categories)),
    brands: read('brands', clone(B.brands)),
    settings: { ...B.settings, ...savedSettings, pay: { ...B.settings.pay, ...(savedSettings.pay || {}) } },
    coupons: read('coupons', clone(B.coupons)),
    customers: read('customers', clone(B.customers)),
    reviews: read('reviews', clone(B.reviews)),
    staff: read('staff', clone(B.staff)),
    orders: read('orders', null),
    cart: read('cart', []),
    wish: read('wish', []),
    coupon: read('coupon', ''),
    user: read('user', null)
  };
  if (!S.orders) { S.orders = seedOrders(); save('orders', S.orders); }
  const persist = (...keys) => keys.forEach(k => save(k, S[k]));

  /* ---------- product options & variants ----------
     p.options  = { attributeId: [selected values] }
     p.variants = [{ key, opts, sku, price, old, stock }]  (one per option combination, each with its own price)
     p.price / p.old / p.stock are derived: lowest variant price and total stock. */
  const attrOf = id => S.attributes.find(a => a.id === id);
  const vkeyOf = opts => S.attributes.filter(a => opts[a.id]).map(a => a.id + '=' + opts[a.id]).join('|');
  function combos(options) {
    let list = [{}];
    S.attributes.forEach(a => { const vals = (options || {})[a.id]; if (vals && vals.length) list = list.flatMap(o => vals.map(v => ({ ...o, [a.id]: v }))); });
    return list.length === 1 && !Object.keys(list[0]).length ? [] : list;
  }
  function buildVariants(p, existing = [], defs = []) {
    return combos(p.options).map((opts, i) => {
      const key = vkeyOf(opts), ex = existing.find(v => v.key === key); if (ex) return ex;
      const d = defs.find(x => Object.entries(x.match).every(([k, v]) => opts[k] === v)) || {};
      return { key, opts, sku: 'BB-' + String(p.id).padStart(4, '0') + '-' + String(i + 1).padStart(2, '0'), price: d.price ?? p.price, old: d.old ?? p.old, stock: d.stock ?? p.stock };
    });
  }
  function syncProduct(p) {
    if (p.variants && p.variants.length) {
      const m = p.variants.reduce((a, v) => (v.price < a.price ? v : a), p.variants[0]);
      p.price = m.price; p.old = Math.max(m.old, m.price); p.stock = p.variants.reduce((s, v) => s + v.stock, 0);
    }
  }
  S.products.forEach(p => {
    if (p.options && Object.keys(p.options).length && !p.variants) p.variants = buildVariants(p, [], p.vdefs || []);
    delete p.vdefs; syncProduct(p);
  });
  persist('products');
  const hasOptions = p => !!(p && p.variants && p.variants.length);
  const variantOf = (p, vkey) => (p.variants || []).find(v => v.key === vkey);
  const unitPrice = (p, vkey) => (hasOptions(p) ? (variantOf(p, vkey) || { price: p.price }).price : p.price);
  const stockOf = (p, vkey) => (hasOptions(p) ? (variantOf(p, vkey) || { stock: 0 }).stock : p.stock);
  const vlabel = (p, vkey) => { const v = variantOf(p, vkey); return v ? S.attributes.filter(a => v.opts[a.id]).map(a => a.name + ': ' + v.opts[a.id]).join(', ') : ''; };
  const priceRange = p => { if (!hasOptions(p)) return [p.price, p.price]; const ps = p.variants.map(v => v.price); return [Math.min(...ps), Math.max(...ps)]; };
  function adjustStock(id, vkey, delta) {
    const p = prod(id); if (!p) return;
    if (hasOptions(p)) { const v = variantOf(p, vkey); if (v) v.stock = Math.max(0, v.stock + delta); syncProduct(p); } else p.stock = Math.max(0, p.stock + delta);
  }
  S.cart = S.cart.filter(c => { const p = S.products.find(x => x.id === c.id); return p && (!hasOptions(p) || variantOf(p, c.vkey || '')); });
  S.wish = S.wish.filter(id => S.products.some(p => p.id === id));

  /* ---------- helpers ---------- */
  const icon = n => `<i data-lucide="${n}"></i>`;
  const icons = () => { if (window.lucide) window.lucide.createIcons(); };
  const prod = id => S.products.find(p => p.id === Number(id));
  const img = (p, view = 1) => ROOT + 'assets/img/p' + (p.img || 1) + (view > 1 ? '-' + view : '') + '.webp';
  const art = (p, cls = '', view = 1) => `<img class="art ${cls}" src="${img(p, view)}" alt="${esc(p.name)}" width="512" height="512" loading="lazy" decoding="async">`;
  const stars = p => { const n = Math.max(0, Math.min(5, Math.round(p.rating || 5))); return `<span class="stars" aria-label="Rated ${p.rating || 5} out of 5">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>`; };
  const fmtDate = iso => { const d = new Date(String(iso).length === 10 ? iso + 'T00:00:00' : iso); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
  const statusClass = s => ({ Pending: 'warn', Processing: 'info', Shipped: 'info', Cancelled: 'bad', Inactive: 'mute', Hidden: 'mute', Rejected: 'bad', Unpaid: 'warn' }[s] || '');
  const badge = s => `<span class="badge ${statusClass(s)}">${esc(s)}</span>`;
  const go = url => { location.href = url; };
  const param = k => new URLSearchParams(location.search).get(k);
  const safeNext = n => (/^[a-z0-9-]+\.html$/i.test(n || '') ? n : '');

  let tt;
  function toast(t) {
    const el = $('#toast'); if (!el) return;
    el.textContent = t; el.style.display = 'block';
    clearTimeout(tt); tt = setTimeout(() => { el.style.display = 'none'; }, 3200);
  }
  function modal(html) {
    const d = $('#modal'); if (!d) return;
    d.innerHTML = `<button class="modalclose" data-action="close" aria-label="Close dialog">${icon('x')}</button><div class="modalbody" tabindex="-1" autofocus>` + html + '</div>';
    if (!d.open) d.showModal();
    icons();
  }
  const closeModal = () => { const d = $('#modal'); if (d && d.open) d.close(); };

  /* ---------- catalogue helpers ---------- */
  const visibleCategories = () => S.categories.filter(c => c.status !== 'Hidden');
  const activeBrands = () => S.brands.filter(b => b.status !== 'Inactive');
  const sold = p => p.stock <= 0;

  function priceHTML(p) {
    const [lo, hi] = priceRange(p), v = hasOptions(p) ? p.variants.find(x => x.price === lo) : p;
    return (lo !== hi ? '<span class="from"></span>' : '') + money(lo) + (v.old > lo ? ` <del>${money(v.old)}</del>` : '');
  }
  function dots(p) {
    const a = attrOf('color'), vals = p.options && p.options.color;
    if (!a || !vals || !vals.length) return '';
    return `<span class="dots" aria-label="Available in ${vals.length} colors">${vals.slice(0, 5).map(l => { const x = a.values.find(v => v.label === l); return x ? `<span class="dot" style="background:${esc(x.hex)}" title="${esc(l)}"></span>` : ''; }).join('')}</span>`;
  }
  function card(p) {
    const href = ROOT + 'product-details.html?id=' + p.id;
    const liked = S.wish.includes(p.id);
    return `<article class="card"><div class="photo"><a href="${href}" aria-label="${esc(p.name)}">${art(p)}</a>
      <span class="tag ${sold(p) ? 'out' : ''}">${esc(sold(p) ? 'Sold out' : p.tag || '')}</span>
      <button class="heart ${liked ? 'active' : ''}" data-action="wish:${p.id}" aria-pressed="${liked}" aria-label="Save ${esc(p.name)} to wishlist">${icon('heart')}</button>
      <button class="btn light small quick" data-action="quick:${p.id}">Quick view</button></div>
      <div class="meta">${esc(p.brand)} · ${esc(p.category)}</div>
      <h3><a href="${href}">${esc(p.name)}</a></h3>
      <div class="stars">${stars(p)} <span class="muted">(${p.reviews || 0})</span>${dots(p)}</div>
      <div class="cardfoot"><span class="price">${priceHTML(p)}</span>
      <button class="add" data-action="add:${p.id}" ${sold(p) ? 'disabled' : ''} aria-label="${hasOptions(p) ? 'Choose options for ' : 'Add '}${esc(p.name)}${hasOptions(p) ? '' : ' to bag'}">${icon('plus')}</button></div></article>`;
  }

  /* ---------- cart / wishlist / totals ---------- */
  const cartQty = (id, vkey) => S.cart.filter(c => c.id === id && (vkey === undefined || (c.vkey || '') === vkey)).reduce((s, c) => s + c.qty, 0);
  function addToCart(id, n = 1, vkey = '') {
    const p = prod(id); if (!p) return false;
    if (hasOptions(p) && !variantOf(p, vkey)) { toast('Please choose your options first.'); return false; }
    const st = stockOf(p, vkey);
    if (st <= 0) { toast('Sorry, this option is sold out.'); return false; }
    if (cartQty(id, vkey) + n > st) { toast(`Only ${st} available for this option.`); return false; }
    const line = S.cart.find(c => c.id === id && (c.vkey || '') === vkey);
    if (line) line.qty += n; else S.cart.push({ id, qty: n, vkey });
    persist('cart'); refreshCounts(); toast('A little happiness added to your bag.');
    if (App.onCart) App.onCart();
    return true;
  }
  function findCoupon(code) {
    return S.coupons.find(c => c.status === 'Active' && c.code.toUpperCase() === String(code || '').trim().toUpperCase()) || null;
  }
  function totals(district = 'Dhaka') {
    const sub = S.cart.reduce((s, c) => { const p = prod(c.id); return s + (p ? unitPrice(p, c.vkey || '') * c.qty : 0); }, 0);
    const c = S.coupon ? findCoupon(S.coupon) : null;
    let discount = 0, couponNote = '';
    if (c) {
      if (sub >= (c.min || 0)) discount = c.type === 'percent' ? Math.round(sub * c.value / 100) : Math.min(c.value, sub);
      else couponNote = `${c.code} needs a minimum of ${money(c.min)}.`;
    }
    const delivery = sub ? (district === 'Outside' ? S.settings.outside : S.settings.dhaka) : 0;
    return { sub, discount, delivery, total: sub - discount + delivery, coupon: c, couponNote };
  }
  function refreshCounts() {
    const c = S.cart.reduce((s, x) => s + x.qty, 0);
    $$('[data-cart-count]').forEach(e => { e.textContent = c || ''; });
    $$('[data-wish-count]').forEach(e => { e.textContent = S.wish.length || ''; });
  }

  /* ---------- action + form registries ---------- */
  const actions = {}, forms = {};
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]'); if (!el) return;
    const [name, ...args] = el.dataset.action.split(':');
    const fn = actions[name]; if (!fn) return;
    if (el.tagName === 'BUTTON' || el.tagName === 'A') e.preventDefault();
    fn(args, el, e);
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('form[data-form]'); if (!f) return;
    e.preventDefault();
    if (!f.reportValidity()) return;
    const fn = forms[f.dataset.form];
    if (fn) fn(Object.fromEntries(new FormData(f)), f);
  });

  actions.close = closeModal;
  const mq = window.matchMedia('(max-width: 680px)');
  function setNav(open) {
    const nav = $('#mainnav'); if (!nav) return;
    const toggle = $('[data-action="mobile"]');
    const scrim = $('.navscrim');
    nav.classList.toggle('open', open);
    if (scrim) scrim.classList.toggle('show', open);
    document.body.classList.toggle('navlock', open);
    if (toggle) { toggle.setAttribute('aria-expanded', open); toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); }
    if (open) { const c = $('.navclose', nav); if (c) setTimeout(() => c.focus({ preventScroll: true }), 50); }
    else if (toggle && document.activeElement && nav.contains(document.activeElement)) toggle.focus({ preventScroll: true });
  }
  actions.mobile = () => { const nav = $('#mainnav'); if (nav) setNav(!nav.classList.contains('open')); };
  actions.closenav = () => setNav(false);
  actions.wish = ([id]) => {
    id = Number(id);
    S.wish = S.wish.includes(id) ? S.wish.filter(x => x !== id) : [...S.wish, id];
    persist('wish'); refreshCounts();
    $$(`[data-action="wish:${id}"]`).forEach(b => { const on = S.wish.includes(id); b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
    toast(S.wish.includes(id) ? 'Saved to your wishlist' : 'Removed from your wishlist');
    if (App.onWish) App.onWish();
  };
  actions.add = ([id]) => { const p = prod(id); if (hasOptions(p)) { if (actions.quick) actions.quick([id]); } else addToCart(Number(id)); };
  actions.logout = () => { S.user = null; persist('user'); go(ROOT + 'login.html'); };

  /* ---------- shared forms ---------- */
  forms.newsletter = (d, f) => { toast('Thank you! You are on the list.'); f.reset(); };
  forms.contact = (d, f) => { f.reset(); toast('Thanks — your message is noted. (Email sending arrives with the Laravel phase.)'); };
  forms.login = d => {
    const email = d.email.trim().toLowerCase();
    const known = S.customers.find(c => c.email.toLowerCase() === email);
    S.user = { name: known ? known.name : email.split('@')[0], email, phone: known ? known.phone : '' };
    persist('user'); go(ROOT + (safeNext(param('next')) || 'account.html'));
  };
  forms.register = d => {
    const email = d.email.trim().toLowerCase();
    if (!S.customers.some(c => c.email.toLowerCase() === email)) { S.customers.push({ name: d.name.trim(), email, phone: d.phone || '', status: 'Active' }); persist('customers'); }
    S.user = { name: d.name.trim(), email, phone: d.phone || '' };
    persist('user'); go(ROOT + 'account.html');
  };
  forms.forgot = (d, f) => {
    f.insertAdjacentHTML('beforebegin', '<div class="success" role="status">If that email has an account, a reset link will be sent. (Email delivery connects in the Laravel phase.)</div>');
    f.reset();
  };
  forms.coupon = (d) => {
    const c = findCoupon(d.coupon);
    if (!c) { toast('That coupon code is not valid.'); return; }
    S.coupon = c.code; persist('coupon');
    const t = totals(); if (t.couponNote) toast(t.couponNote); else toast(`${c.code} applied`);
    if (App.onCart) App.onCart();
  };
  actions.removecoupon = () => { S.coupon = ''; persist('coupon'); if (App.onCart) App.onCart(); };

  /* ---------- header / footer hydration ---------- */
  function hydrateChrome() {
    const catMenu = $('[data-menu="categories"]');
    if (catMenu) catMenu.innerHTML = `<a href="${ROOT}shop.html">All little things</a>` + visibleCategories().map(c => `<a href="${ROOT}shop.html?category=${encodeURIComponent(c.name)}">${esc(c.name)}</a>`).join('');
    const brMenu = $('[data-menu="brands"]');
    if (brMenu) brMenu.innerHTML = activeBrands().map(b => `<a href="${ROOT}shop.html?brand=${encodeURIComponent(b.name)}">${esc(b.name)}</a>`).join('');
    refreshCounts();
    // mobile drawer: header, scrim, accordion, close behaviours
    const nav = $('#mainnav');
    if (nav) {
      const head = document.createElement('div');
      head.className = 'navhead';
      head.innerHTML = `<a href="${ROOT}index.html" class="logo" aria-label="MaveloBaby home">mavelo <span>baby</span></a><button type="button" class="navclose" data-action="closenav" aria-label="Close navigation"><i data-lucide="x"></i></button>`;
      nav.insertBefore(head, nav.firstChild);
      const scrim = document.createElement('div');
      scrim.className = 'navscrim';
      scrim.addEventListener('click', () => setNav(false));
      (nav.parentNode || document.body).appendChild(scrim);
      $$('.dd > a', nav).forEach(a => a.setAttribute('aria-expanded', 'false'));
      nav.addEventListener('click', e => {
        const dd = e.target.closest('.dd > a');
        if (dd && mq.matches) {
          e.preventDefault();
          const box = dd.parentElement, willOpen = !box.classList.contains('open');
          $$('.dd.open', nav).forEach(o => { o.classList.remove('open'); o.firstElementChild.setAttribute('aria-expanded', 'false'); });
          box.classList.toggle('open', willOpen);
          dd.setAttribute('aria-expanded', willOpen);
          return;
        }
        if (e.target.closest('a') && nav.classList.contains('open')) setNav(false);
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) setNav(false); });
      const onMq = () => { if (!mq.matches) setNav(false); };
      mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);
    }
    const dlg = $('#modal');
    if (dlg) dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    const sh = $('#sitehead');
    if (sh) { let on = false; const f = () => { const y = window.scrollY; const n = on ? y > 10 : y > 70; if (n !== on) { on = n; sh.classList.toggle('scrolled', on); } }; f(); window.addEventListener('scroll', f, { passive: true }); }
    const y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
    heroSlides();
  }

  /* ---------- hero slideshow (crossfade every 3s) ---------- */
  function heroSlides() {
    const first = $('.hero img.heroart'); if (!first) return;
    const list = [
      [first.getAttribute('src'), first.alt],
      [ROOT + 'assets/img/p2.webp', 'Soft pink muslin romper with flutter sleeves'],
      [ROOT + 'assets/img/p3.webp', 'Sage green silicone bib, bowl and spoon set'],
      [ROOT + 'assets/img/p5.webp', 'Stacking rainbow rings toy'],
      [ROOT + 'assets/img/p4.webp', 'Hand-knit cream baby booties'],
      [ROOT + 'assets/img/p6.webp', 'Soft blue hooded baby towel']
    ];
    const stage = document.createElement('div');
    stage.className = 'heroslides';
    first.parentNode.insertBefore(stage, first);
    first.className = 'slide active';
    stage.appendChild(first);
    const imgs = [first];
    list.slice(1).forEach(([src, alt]) => {
      const im = new Image();
      im.className = 'slide'; im.src = src; im.alt = alt; im.width = 512; im.height = 512; im.decoding = 'async';
      im.setAttribute('aria-hidden', 'true');
      stage.appendChild(im); imgs.push(im);
    });
    const dots = document.createElement('div');
    dots.className = 'herodots'; dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = imgs.map((_, i) => `<span class="${i ? '' : 'on'}"></span>`).join('');
    stage.appendChild(dots);
    let cur = 0, timer = null;
    const show = n => {
      imgs[cur].classList.remove('active'); imgs[cur].setAttribute('aria-hidden', 'true');
      dots.children[cur].classList.remove('on');
      cur = n;
      imgs[cur].classList.add('active'); imgs[cur].removeAttribute('aria-hidden');
      dots.children[cur].classList.add('on');
    };
    const start = () => { stop(); timer = setInterval(() => show((cur + 1) % imgs.length), 3000); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    start();
  }

  const App = window.BBApp = { ROOT, $, $$, esc, money, read, save, clone, S, persist, icon, icons, prod, img, art, stars, card, fmtDate, badge, statusClass,
    toast, modal, closeModal, go, param, safeNext, visibleCategories, activeBrands, sold, addToCart, cartQty, findCoupon, attrOf, vkeyOf, combos, buildVariants, syncProduct, hasOptions, variantOf, unitPrice, stockOf, vlabel, priceRange, priceHTML, adjustStock, totals, refreshCounts,
    actions, forms, pages: {}, onCart: null, onWish: null };

  document.addEventListener('DOMContentLoaded', () => {
    hydrateChrome();
    const page = document.body.dataset.page;
    if (page && App.pages[page]) App.pages[page]();
    icons();
  });
})();
