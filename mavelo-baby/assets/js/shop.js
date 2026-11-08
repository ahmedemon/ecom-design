/* MaveloBaby storefront pages */
(function () {
  'use strict';
  const A = window.BBApp, { $, $$, esc, money, S, icon, icons, prod, art, card, toast, modal } = A;
  const view = () => $('#view');
  const put = html => { view().innerHTML = html; icons(); };
  const empty = (title, cta, to, ic = 'shopping-bag') => `<div class="empty">${icon(ic)}<h2>${title}</h2><p>There’s a little something lovely waiting for you.</p><a class="btn pink" href="${to}">${cta}</a></div>`;
  const field = (label, name, type = 'text', value = '', extra = '') => `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
  const CAT_COLORS = ['#ffe5ec', '#e4f3ed', '#fff2ca', '#e6f2fb', '#eee4f2', '#f5e9dc'];
  const sec = (title, sub, body, href = 'shop.html', cta = 'Explore all →') => `<section class="section"><div class="sectionhead"><div><h2>${title}</h2><p>${sub}</p></div><a href="${href}">${cta}</a></div>${body}</section>`;

  /* ---------------- HOME ---------------- */
  A.pages.home = () => {
    const cats = $('[data-mount="cats"]');
    if (cats) cats.innerHTML = A.visibleCategories().map((c, i) => `<a class="category" href="shop.html?category=${encodeURIComponent(c.name)}"><span class="bubble" style="background:${CAT_COLORS[i % 6]}">${icon(c.icon || 'tag')}</span><strong>${esc(c.name)}</strong></a>`).join('');
    const best = S.products.filter(p => p.tag === 'Bestseller');
    const loved = [...best, ...S.products.filter(p => p.tag !== 'Bestseller')].slice(0, 4);
    const rest = S.products.filter(p => !loved.includes(p));
    const l = $('[data-mount="loved"]'); if (l) l.innerHTML = loved.map(card).join('');
    const f = $('[data-mount="fresh"]');
    if (f) {
      if (!rest.length) f.closest('section').hidden = true;
      else f.innerHTML = rest.slice(0, 2).map(card).join('') + `<div class="gifttile"><span class="eyebrow">GIFTING MADE EASY</span><h2>Something soft for a brand-new arrival.</h2><p>Teddy, muslin and a wooden rainbow — wrapped and ready.</p><a class="btn" href="product-details.html?id=1">See the gift set →</a></div>`;
    }
    const b = $('[data-mount="brands"]'); if (b) b.innerHTML = A.activeBrands().map(x => `<a href="shop.html?brand=${encodeURIComponent(x.name)}">${esc(x.name)}</a>`).join('');
  };

  /* ---------------- SHOP ---------------- */
  const F = { q: '', category: '', brand: '', max: 3000, sort: 'featured', collection: '' };
  function readFilters() {
    const p = new URLSearchParams(location.search);
    F.q = p.get('q') || ''; F.category = p.get('category') || ''; F.brand = p.get('brand') || '';
    F.max = Number(p.get('max')) || 3000; F.sort = p.get('sort') || (p.has('new') ? 'new' : 'featured');
    F.collection = p.has('new') ? 'New arrival' : p.has('best') ? 'Bestseller' : '';
  }
  function writeFilters() {
    const p = new URLSearchParams();
    if (F.q) p.set('q', F.q); if (F.category) p.set('category', F.category); if (F.brand) p.set('brand', F.brand);
    if (F.max !== 3000) p.set('max', F.max); if (F.sort !== 'featured') p.set('sort', F.sort);
    if (F.collection === 'New arrival') p.set('new', 1); if (F.collection === 'Bestseller') p.set('best', 1);
    history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
  }
  function renderShop() {
    let ps = S.products.filter(p => (!F.collection || p.tag === F.collection) && (!F.category || p.category === F.category) && (!F.brand || p.brand === F.brand) && p.price <= F.max &&
      (!F.q || (p.name + ' ' + p.brand + ' ' + p.category).toLowerCase().includes(F.q.toLowerCase())));
    if (F.sort === 'low') ps.sort((a, b) => a.price - b.price);
    if (F.sort === 'high') ps.sort((a, b) => b.price - a.price);
    if (F.sort === 'new') ps.sort((a, b) => (b.tag === 'New arrival') - (a.tag === 'New arrival') || b.id - a.id);
    const title = F.category || F.brand || (F.collection === 'New arrival' ? 'New arrivals' : F.collection === 'Bestseller' ? 'Bestsellers' : 'Little essentials, endless love.');
    put(`<h1 class="pagetitle">${esc(title)}</h1><div class="shoplayout"><aside class="filters"><h3>Shop by category</h3><div class="filteroptions">${['', ...A.visibleCategories().map(c => c.name)].map(c => `<label><input type="radio" name="category" value="${esc(c)}" ${F.category === c ? 'checked' : ''}> ${c ? esc(c) : 'All little things'}</label>`).join('')}</div>
      <h3 style="margin-top:25px">Price range</h3><input type="range" id="maxprice" min="500" max="3000" step="50" value="${F.max}" aria-label="Maximum price"><p>Up to ${money(F.max)}</p>
      <h3>Brand</h3><select id="brandfilter" class="input"><option value="">All brands</option>${A.activeBrands().map(b => `<option ${F.brand === b.name ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select>
      <button class="btn light small" data-action="resetfilter" style="margin-top:20px">Reset filters</button></aside>
      <section><div class="toolbar"><span>${ps.length} lovely little ${ps.length === 1 ? 'find' : 'finds'}${F.q ? ' for “' + esc(F.q) + '”' : ''}</span><select id="sort" aria-label="Sort products">${[['featured', 'Our favorites'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['new', 'Newest arrivals']].map(([v, t]) => `<option value="${v}" ${F.sort === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="grid shopgrid">${ps.map(card).join('')}</div>${ps.length ? '' : '<div class="empty"><h2>No little finds yet</h2><p>Try another search or reset your filters.</p></div>'}</section></div>`);
  }
  A.pages.shop = () => {
    readFilters(); renderShop();
    document.addEventListener('change', e => {
      const t = e.target;
      if (t.name === 'category' && !t.closest('dialog')) { F.category = t.value; F.collection = ''; }
      else if (t.id === 'maxprice') F.max = Number(t.value);
      else if (t.id === 'sort') F.sort = t.value;
      else if (t.id === 'brandfilter') { F.brand = t.value; F.collection = ''; }
      else return;
      writeFilters(); renderShop();
    });
    A.actions.resetfilter = () => { Object.assign(F, { q: '', category: '', brand: '', max: 3000, sort: 'featured', collection: '' }); writeFilters(); renderShop(); };
  };

  /* ---------------- PRODUCT ---------------- */
  const qtyBox = n => `<div class="qty"><button data-action="qtyd:-1" aria-label="Decrease quantity" ${n <= 1 ? 'disabled' : ''}>−</button><span data-qtyval>${n}</span><button data-action="qtyd:1" aria-label="Increase quantity">+</button></div>`;
  const groupsOf = p => S.attributes.filter(a => p.options && p.options[a.id] && p.options[a.id].length).map(a => ({ a, vals: p.options[a.id] }));
  const optionGroupHTML = ({ a, vals }) => `<div class="optgroup" data-attr="${a.id}"><h4>${esc(a.name)}<span class="chosen" data-chosen></span></h4>` +
    (a.type === 'color'
      ? `<div class="swatches" role="group" aria-label="${esc(a.name)}">${vals.map(l => { const c = a.values.find(v => v.label === l); return `<button type="button" class="swatch" style="--c:${esc(c ? c.hex : '#ccc')}" data-action="opt:${a.id}" data-v="${esc(l)}" aria-label="${esc(l)}" title="${esc(l)}"></button>`; }).join('')}</div>`
      : `<div class="pills" role="group" aria-label="${esc(a.name)}">${vals.map(l => `<button type="button" data-action="opt:${a.id}" data-v="${esc(l)}">${esc(l)}</button>`).join('')}</div>`) + '</div>';

  function productHTML(p, quick) {
    const liked = S.wish.includes(p.id), groups = groupsOf(p);
    return `<div class="detail" data-id="${p.id}" data-qty="1" data-sel="{}">
      <div>
        <div id="galleryimage">${art(p, '', 1).replace('loading="lazy"', 'loading="eager"')}</div>
        <div class="thumbnails">${['Full view', 'Detail view', 'Close-up'].map((l, i) => `<button data-action="gallery:${i + 1}" class="${i ? '' : 'selected'}" aria-label="${l}">${art(p, '', i + 1)}</button>`).join('')}</div></div>
        <div>
          <span class="eyebrow">${esc(p.brand)} |</span>
          <span class="stars">${A.stars(p)} <span style="margin: auto;" class="muted">${p.rating} · ${p.reviews} reviews</span></span>
          <h1 style="margin: auto;">${esc(p.name)}</h1>
          <p class="price" style="font-size:25px; margin: auto;" data-pricebox></p>
          <p>${esc(p.desc || 'A thoughtfully chosen essential for your little one’s everyday moments.')}</p>
          <div class="stockline"><span class="badge" data-stockbadge></span><span class="skuline" data-sku></span></div>
          ${groups.map(optionGroupHTML).join('')}
          <div style="display:flex;gap:5px;margin:25px 0;flex-wrap:wrap" data-buyrow>
            ${qtyBox(1)}<button class="btn pink" data-action="detailadd">Add to bag ${icon('shopping-bag')}</button>
            <a href="javascript:void(0)" class="btn light" data-action="wish:${p.id}" aria-pressed="${liked}">${icon('heart')} Save for later</a>
            ${quick ? `<a href="product-details.html?id=${p.id}" class="btn light">${icon('chevron-right')} View full details</a>` : ''}
          </div>
        </div>
      </div>
      ${quick ? `` : `<div class="faq"><details open><summary>The little details</summary><p>${esc(p.desc || '')}</p></details><details><summary>Delivery &amp; returns</summary><p>${money(S.settings.dhaka)} inside Dhaka, ${money(S.settings.outside)} elsewhere in Bangladesh. <a href="shipping.html"><u>Read the shipping &amp; returns policy →</u></a></p></details></div>`}`
      ;
  }
  /* keeps price, stock, option states and buttons in sync with the current selection */
  function refresh(d) {
    const p = prod(d.dataset.id), sel = JSON.parse(d.dataset.sel || '{}'), groups = groupsOf(p), opt = A.hasOptions(p);
    const v = opt && groups.every(g => sel[g.a.id]) ? p.variants.find(x => x.key === A.vkeyOf(sel)) : null;
    groups.forEach(g => {
      const box = d.querySelector(`.optgroup[data-attr="${g.a.id}"]`);
      box.querySelector('[data-chosen]').textContent = sel[g.a.id] ? ': ' + sel[g.a.id] : '';
      box.querySelectorAll('[data-v]').forEach(b => {
        const val = b.dataset.v, on = sel[g.a.id] === val;
        const ok = p.variants.some(x => x.opts[g.a.id] === val && x.stock > 0 && groups.every(h => h.a.id === g.a.id || !sel[h.a.id] || x.opts[h.a.id] === sel[h.a.id]));
        b.classList.toggle('selected', on); b.classList.toggle('out', !ok); b.setAttribute('aria-pressed', on);
      });
    });
    const ref = v || p;
    d.querySelector('[data-pricebox]').innerHTML = v ? money(v.price) + (v.old > v.price ? ` <del>${money(v.old)}</del>` : '') : A.priceHTML(p);
    const stock = opt ? (v ? v.stock : null) : p.stock, badge = d.querySelector('[data-stockbadge]');
    badge.className = 'badge ' + (stock === null ? 'mute' : stock < 1 ? 'bad' : stock <= S.settings.lowStock ? 'warn' : '');
    badge.textContent = stock === null ? 'Choose your options' : stock < 1 ? 'Sold out' : stock <= S.settings.lowStock ? 'Only ' + stock + ' left' : 'In stock';
    d.querySelector('[data-sku]').textContent = v ? 'SKU ' + v.sku : '';
    const max = stock === null ? 99 : Math.max(1, stock), q = Math.min(Number(d.dataset.qty), max);
    d.dataset.qty = q; d.querySelector('.qty').outerHTML = qtyBox(q);
    d.querySelector('[data-action="detailadd"]').disabled = stock !== null && stock < 1;
  }
  const mountDetail = d => { icons(); refresh(d); };
  A.pages.product = () => {
    const p = prod(A.param('id'));
    if (!p) { put(empty('This product is unavailable', 'Browse our collection', 'shop.html')); return; }
    document.title = p.name + ' | MaveloBaby';
    const crumb = $('[data-crumb-last]'); if (crumb) crumb.textContent = p.name;
    put(productHTML(p, false) + sec('A few lovely companions', 'Complete their little collection.', `<div class="grid">${S.products.filter(x => x.id !== p.id).slice(0, 4).map(card).join('')}</div>`));
    mountDetail($('.detail'));
  };
  A.actions.quick = ([id]) => {
    const p = prod(id); if (!p) return;
    modal(productHTML(p, true)); mountDetail($('#modal .detail'));
    if (A.hasOptions(p)) toast('Choose your options, then add to bag.');
  };
  A.actions.gallery = ([i], el) => {
    const d = el.closest('.detail'), p = prod(d.dataset.id);
    d.querySelector('#galleryimage img').src = A.img(p, Number(i));
    $$('.thumbnails button', d).forEach(b => b.classList.toggle('selected', b === el));
  };
  A.actions.opt = ([attr], el) => {
    const d = el.closest('.detail'), p = prod(d.dataset.id), sel = JSON.parse(d.dataset.sel || '{}');
    sel[attr] = el.dataset.v;
    // drop other choices that can't be combined with this one
    groupsOf(p).forEach(g => { if (g.a.id !== attr && sel[g.a.id] && !p.variants.some(x => x.opts[attr] === sel[attr] && x.opts[g.a.id] === sel[g.a.id] && x.stock > 0)) delete sel[g.a.id]; });
    d.dataset.sel = JSON.stringify(sel);
    el.closest('.optgroup').classList.remove('need'); refresh(d);
  };
  A.actions.qtyd = ([n], el) => {
    const d = el.closest('.detail'), p = prod(d.dataset.id), sel = JSON.parse(d.dataset.sel || '{}');
    const v = A.hasOptions(p) ? p.variants.find(x => x.key === A.vkeyOf(sel)) : null;
    const max = A.hasOptions(p) ? (v ? Math.max(1, v.stock) : 99) : Math.max(1, p.stock);
    d.dataset.qty = Math.max(1, Math.min(max, Number(d.dataset.qty) + Number(n)));
    el.closest('.qty').outerHTML = qtyBox(Number(d.dataset.qty));
  };
  A.actions.detailadd = (a, el) => {
    const d = el.closest('.detail'), p = prod(d.dataset.id), sel = JSON.parse(d.dataset.sel || '{}'), groups = groupsOf(p);
    const missing = groups.filter(g => !sel[g.a.id]);
    if (missing.length) {
      missing.forEach(g => d.querySelector(`.optgroup[data-attr="${g.a.id}"]`).classList.add('need'));
      d.querySelector('.optgroup.need').scrollIntoView({ block: 'center', behavior: 'smooth' });
      return toast('Please choose: ' + missing.map(g => g.a.name).join(', '));
    }
    if (A.addToCart(p.id, Number(d.dataset.qty), groups.length ? A.vkeyOf(sel) : '') && el.closest('dialog')) A.closeModal();
  };

  /* ---------------- CART ---------------- */
  function summary(checkout, district) {
    const t = A.totals(district);
    return `<aside class="summary"><h3>Your little bag</h3>
      ${checkout ? S.cart.map(c => { const p = prod(c.id), vl = A.vlabel(p, c.vkey || ''); return `<div class="row"><span>${esc(p.name)} × ${c.qty}${vl ? `<br><small class="muted">${esc(vl)}</small>` : ''}</span><b>${money(A.unitPrice(p, c.vkey || '') * c.qty)}</b></div>`; }).join('') : ''}
      <div class="row"><span>Subtotal</span><b>${money(t.sub)}</b></div>
      <div class="row"><span>Discount ${t.coupon && !t.couponNote ? '(' + esc(t.coupon.code) + ')' : ''}</span><b>−${money(t.discount)}</b></div>
      <div class="row"><span>Delivery</span><b>${checkout ? money(t.delivery) : 'At checkout'}</b></div>
      ${S.coupon ? `<p class="muted">${t.couponNote ? esc(t.couponNote) : 'Coupon ' + esc(S.coupon) + ' applied'} · <button class="linkbtn" data-action="removecoupon">Remove Coupon</button></p>` : `<form data-form="coupon" style="display:flex;gap:8px"><input class="input" name="coupon" aria-label="Coupon code" placeholder="Coupon code" required><button class="btn light small">Apply</button></form>`}
      <div class="row total"><span>Total</span><span>${money(checkout ? t.total : t.sub - t.discount)}</span></div>
      ${checkout ? '' : '<a class="btn pink w-full" href="checkout.html">Continue to checkout →</a>'}</aside>`;
  }
  function renderCart() {
    put(`<h1 class="pagetitle">Your bag of happiness</h1>` + (!S.cart.length ? empty('Your bag is waiting for a little love', 'Explore the collection', 'shop.html') :
      `<div class="twocol">
        <section>
          ${S.cart.map((c, i) => {
            const p = prod(c.id), vl = A.vlabel(p, c.vkey || '');
            return `<div class="cartrow">
              <a href="product-details.html?id=${p.id}">${art(p)}</a>
              <div class="grow">
                <h3><a href="product-details.html?id=${p.id}">${esc(p.name)}</a></h3>
                ${vl ? `<p class="varline">${esc(vl)}</p>` : ''}
                <p class="muted">${money(A.unitPrice(p, c.vkey || ''))} each</p>
              </div>
              <div class="qty">
                <button data-action="cqty:${i}:-1" aria-label="Decrease quantity" ${c.qty <= 1 ? 'disabled' : ''}>−</button><span>${c.qty}</span><button data-action="cqty:${i}:1" aria-label="Increase quantity">+</button>
                <button class="iconbtn muted" data-action="remove:${i}">${icon('trash-2')}</button>
              </div>
              <b>${money(A.unitPrice(p, c.vkey || '') * c.qty)}</b>
            </div>`;
          }).join('')}
          <p><a href="shop.html">← A few more little things</a></p>
        </section>
        ${summary(false)}
      </div>`));
  }
  A.pages.cart = () => { A.onCart = renderCart; renderCart(); };
  A.actions.remove = ([i]) => { S.cart.splice(Number(i), 1); A.persist('cart'); A.refreshCounts(); renderCart(); };
  A.actions.cqty = ([i, d]) => {
    const c = S.cart[Number(i)], p = prod(c.id), st = A.stockOf(p, c.vkey || '');
    if (Number(d) > 0 && A.cartQty(c.id, c.vkey || '') >= st) return toast(`Only ${st} available for this option.`);
    c.qty = Math.max(1, c.qty + Number(d)); A.persist('cart'); A.refreshCounts(); renderCart();
  };

  /* ---------------- CHECKOUT ---------------- */
  const PAY = [['cod', 'Cash on Delivery'], ['bkash', 'bKash'], ['nagad', 'Nagad']];
  A.pages.checkout = () => {
    if (!S.cart.length) return put(empty('Your bag is empty', 'Explore the collection', 'shop.html'));
    const u = S.user || {}, pays = PAY.filter(([k]) => S.settings.pay[k]);
    const draw = district => { $('#summary').innerHTML = summary(true, district).replace(/^<aside class="summary">|<\/aside>$/g, ''); };
    put(`<h1 class="pagetitle">One step closer to little smiles.</h1><div class="twocol"><form data-form="checkout" class="panel"><h3>1. Your details</h3>
      <div class="formgrid">${field('Full name', 'name', 'text', u.name || '', 'required minlength="2" autocomplete="name"')}${field('Phone number', 'phone', 'tel', u.phone || '', 'required pattern="(?:\\+?88)?01[3-9][0-9]{8}" placeholder="01XXXXXXXXX" autocomplete="tel"')}${field('Email address', 'email', 'email', u.email || '', 'required autocomplete="email"')}</div>
      <h3>2. Where should we deliver?</h3>${field('Street address', 'address', 'text', A.read('address', ''), 'required minlength="8" autocomplete="street-address"')}
      <div class="formgrid"><label class="field"><span>Delivery area</span><select name="district" id="district"><option value="Dhaka">Inside Dhaka — ${money(S.settings.dhaka)}</option><option value="Outside">Outside Dhaka — ${money(S.settings.outside)}</option></select></label>${field('City / town', 'city', 'text', '', 'required')}</div>
      <label class="field"><span>Delivery instructions (optional)</span><textarea name="notes" placeholder="Anything that would help our delivery team?"></textarea></label>
      <h3>3. Payment method</h3>${pays.map(([k, l], i) => `<label class="checkline"><input type="radio" name="payment" value="${l}" ${i ? '' : 'checked'}> ${l}${k === 'cod' ? '' : ' <span class="muted">· paid after confirmation</span>'}</label>`).join('') || '<p class="notice">No payment methods are enabled right now.</p>'}
      <label class="checkline"><input type="checkbox" required> I agree to the <a href="terms.html"><u>terms and conditions</u></a>.</label>
      <button class="btn pink w-full" ${pays.length ? '' : 'disabled'}>Place my order →</button></form><aside class="summary" id="summary"></aside></div>`);
    draw('Dhaka');
    $('#district').addEventListener('change', e => draw(e.target.value));
    A.onCart = () => draw($('#district').value);
  };
  A.forms.checkout = d => {
    for (const c of S.cart) if (A.cartQty(c.id, c.vkey || '') > A.stockOf(prod(c.id), c.vkey || '')) return toast('Some items exceed available stock. Please update your bag.');
    const t = A.totals(d.district), id = 'BB-' + (Math.max(1000, ...S.orders.map(o => parseInt(String(o.id).slice(3), 10) || 0)) + 1);
    const order = {
      id, name: d.name.trim(), email: d.email.trim().toLowerCase(), phone: d.phone, address: d.address, city: d.city, district: d.district, notes: d.notes || '',
      payment: d.payment, paid: false, status: 'Pending', created: new Date().toISOString().slice(0, 10),
      items: S.cart.map(c => ({ id: c.id, name: prod(c.id).name, price: A.unitPrice(prod(c.id), c.vkey || ''), qty: c.qty, vkey: c.vkey || '', variant: A.vlabel(prod(c.id), c.vkey || '') })), subtotal: t.sub, discount: t.discount, delivery: t.delivery, total: t.total, coupon: t.discount ? S.coupon : ''
    };
    S.cart.forEach(c => A.adjustStock(c.id, c.vkey || '', -c.qty));
    S.orders.unshift(order); S.cart = []; S.coupon = ''; A.save('address', d.address);
    A.persist('orders', 'cart', 'coupon', 'products');
    A.go('order-tracking.html?id=' + id + '&placed=1');
  };

  /* ---------------- WISHLIST ---------------- */
  function renderWish() {
    const ps = S.products.filter(p => S.wish.includes(p.id));
    put('<h1 class="pagetitle">Saved with a little love.</h1>' + (ps.length ? `<div class="grid">${ps.map(card).join('')}</div>` : empty('Your wishlist is waiting', 'Explore the collection', 'shop.html', 'heart')));
  }
  A.pages.wishlist = () => { A.onWish = renderWish; renderWish(); };

  /* ---------------- ACCOUNT / ORDERS ---------------- */
  const accountNav = cur => `<nav class="accountnav"><a class="btn ${cur === 'account' ? '' : 'light'}" href="account.html">My profile</a><a class="btn ${cur === 'orders' ? '' : 'light'}" href="orders.html">My orders</a><a class="btn light" href="wishlist.html">Wishlist</a><button class="btn light" data-action="logout">Sign out</button></nav>`;
  const needUser = page => { if (S.user) return true; A.go('login.html?next=' + page + '.html'); return false; };
  A.pages.account = () => {
    if (!needUser('account')) return;
    put(`<h1 class="pagetitle">Hello, ${esc(S.user.name)}.</h1>${accountNav('account')}<div class="twocol"><form data-form="profile" class="panel"><h3>Personal information</h3>${field('Full name', 'name', 'text', S.user.name, 'required')}${field('Email address', 'email', 'email', S.user.email, 'required')}${field('Phone', 'phone', 'tel', S.user.phone || '', 'pattern="(?:\\+?88)?01[3-9][0-9]{8}" placeholder="01XXXXXXXXX"')}<button class="btn pink">Save profile</button></form>
      <form data-form="address" class="panel"><h3>Delivery address</h3>${field('Address', 'address', 'text', A.read('address', ''), 'required minlength="8"')}<button class="btn light">Save address</button></form></div>`);
  };
  A.forms.profile = d => { S.user = { name: d.name.trim(), email: d.email.trim().toLowerCase(), phone: d.phone || '' }; A.persist('user'); A.pages.account(); toast('Profile saved'); };
  A.forms.address = d => { A.save('address', d.address); toast('Address saved'); };
  A.pages.orders = () => {
    if (!needUser('orders')) return;
    const mine = S.orders.filter(o => o.email === S.user.email);
    put(`<h1 class="pagetitle">Your little deliveries</h1>${accountNav('orders')}<div class="panel">${mine.length ? `<div class="tablewrap"><table><thead><tr><th>Order</th><th>Placed</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead><tbody>${mine.map(o => `<tr><td>${o.id}</td><td>${A.fmtDate(o.created)}</td><td>${money(o.total)}</td><td>${esc(o.payment)}</td><td>${A.badge(o.status)}</td><td><a href="order-tracking.html?id=${o.id}"><u>Track →</u></a></td></tr>`).join('')}</tbody></table></div>` : `<p>No orders yet. <a href="shop.html"><u>Explore the collection</u></a> to place your first one.</p>`}</div>`);
  };

  /* ---------------- TRACKING ---------------- */
  function showTrack(id) {
    const box = $('#trackresult'); if (!box) return;
    const o = S.orders.find(x => x.id === String(id).trim().toUpperCase());
    if (!o) { box.innerHTML = '<div class="notice" style="margin-top:20px">We couldn’t find that order. Check the number and try again.</div>'; return; }
    const steps = [['Pending', 'Order received'], ['Processing', 'Preparing your little things'], ['Shipped', 'On its way'], ['Delivered', 'Delivered']];
    const at = steps.findIndex(s => s[0] === o.status);
    box.innerHTML = `<div class="panel" style="margin-top:25px"><h3>${o.id} · ${A.fmtDate(o.created)}</h3><p>${A.badge(o.status)} &nbsp; ${money(o.total)} · ${esc(o.payment)}${o.paid ? ' · Paid' : ''}</p>
      ${o.status === 'Cancelled' ? '<div class="notice">This order was cancelled.</div>' : `<div class="timeline">${steps.map((s, i) => `<div class="${i < at || (i === at && o.status === 'Delivered') ? 'done' : i === at ? 'now' : 'todo'}"><b>${s[1]}</b></div>`).join('')}</div>`}
      <h4>Items</h4>${o.items.map(i => `<p style="margin:6px 0">${esc(i.name)}${i.variant ? ` <span class="muted">(${esc(i.variant)})</span>` : ''} × ${i.qty} — ${money(i.price * i.qty)}</p>`).join('')}</div>`;
  }
  A.pages.tracking = () => {
    const id = A.param('id') || '';
    put(`<div class="narrow" style="max-width:600px"><span class="eyebrow">A LITTLE JOY IS ON ITS WAY</span><h1 style="font-size:35px">Track your little delivery</h1>
      ${A.param('placed') ? `<div class="success" role="status">Thank you! Your order <b>${esc(id)}</b> has been placed. Keep this number to track it.</div>` : ''}
      <p>Enter the order number from your confirmation (for example BB-1024).</p>
      <form data-form="tracking" class="search" style="max-width:none"><input name="order" required placeholder="BB-1024" aria-label="Order number" value="${esc(id)}"><button class="iconbtn" aria-label="Track order">${icon('arrow-right')}</button></form><div id="trackresult"></div></div>`);
    if (id) showTrack(id);
  };
  A.forms.tracking = d => showTrack(d.order);
})();
