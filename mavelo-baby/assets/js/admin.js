/* MaveloBaby admin panel (Phase 1: data is stored in this browser only) */
(function () {
  'use strict';
  const A = window.BBApp, { $, $$, esc, money, S, icon, icons, toast, closeModal, badge } = A;
  const modal = (html, wide) => { A.modal(html); $('#modal').classList.toggle('wide', !!wide); };
  const view = () => $('#view');
  const put = html => { view().innerHTML = html; icons(); };
  const UNITS = o => o.status !== 'Cancelled';
  const ICONS = ['shirt', 'utensils', 'blocks', 'bath', 'moon-star', 'baby', 'tag', 'gift', 'heart', 'sparkles', 'footprints', 'bed-double'];

  /* ---------- generic UI helpers ---------- */
  const head = (title, sub, addLabel, addAction) => `<div class="toolbar"><div><h1>${title}</h1><p>${sub}</p></div>${addLabel ? `<button class="btn pink" data-action="${addAction}">+ ${addLabel}</button>` : ''}</div>`;
  const table = (cols, rows, rowClass) => `<div class="tablewrap"><table><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr class="${rowClass ? rowClass(r) : ''}">${r.cells.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') : `<tr><td class="empty-row" colspan="${cols.length}">No matching records.</td></tr>`}</tbody></table></div>`;
  const btn = (label, action, cls = 'btn light small') => `<button class="${cls}" data-action="${action}">${label}</button>`;
  const acts = (...b) => `<div class="actions">${b.join('')}</div>`;
  const fld = (f, v) => {
    const val = v?.[f.n] ?? f.def ?? '';
    const req = f.req === false ? '' : 'required';
    if (f.t === 'select') return `<label class="field"><span>${f.l}</span><select name="${f.n}">${f.opts.map(o => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}" ${String(ov) === String(val) ? 'selected' : ''}>${esc(ol)}</option>`; }).join('')}</select></label>`;
    if (f.t === 'textarea') return `<label class="field"><span>${f.l}</span><textarea name="${f.n}" ${f.req === false ? '' : 'required'}>${esc(val)}</textarea></label>`;
    return `<label class="field"><span>${f.l}</span><input name="${f.n}" type="${f.t || 'text'}" value="${esc(val)}" ${req} ${f.x || ''}></label>`;
  };
  let pending = null;
  const formModal = (title, fields, values, onSave, extra = '') => {
    pending = onSave;
    modal(`<h2>${title}</h2><form data-form="adminform"><div class="formgrid">${fields.map(f => f.t === 'textarea' ? '' : fld(f, values)).join('')}</div>${fields.filter(f => f.t === 'textarea').map(f => fld(f, values)).join('')}<div class="actions"><button class="btn pink">Save</button><button type="button" class="btn light" data-action="close">Cancel</button>${extra}</div></form>`);
  };
  A.forms.adminform = d => { if (pending && pending(d) !== false) { closeModal(); pending = null; } };
  const confirmBox = (title, text, action) => modal(`<h2>${title}</h2><p>${text}</p><div class="actions"><button class="btn pink" data-action="${action}">Yes, continue</button><button class="btn light" data-action="close">Cancel</button></div>`);

  /* searchable list page */
  function listPage({ title, sub, add, addAction, cols, rows, filters = '', search = true, rowClass, intro = '' }) {
    let q = '';
    const draw = () => { const r = rows().filter(x => !q || x.text.toLowerCase().includes(q)); $('#tbl').innerHTML = table(cols, r, rowClass); icons(); };
    put(head(title, sub, add, addAction) + intro + `<div class="filters-row">${search ? `<form class="search" role="search" onsubmit="return false">${icon('search')}<input id="q" placeholder="Search ${title.toLowerCase()}" aria-label="Search ${title}" autocomplete="off"></form>` : ''}${filters}</div><div class="panel" id="tbl"></div>`);
    draw();
    const qi = $('#q'); if (qi) qi.addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); draw(); });
    A.redraw = draw;
    return draw;
  }
  const row = (text, cells) => ({ text: String(text), cells });

  /* ---------- analytics helpers ---------- */
  function monthly(n = 6) {
    const now = new Date(), out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1), key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      const os = S.orders.filter(o => UNITS(o) && o.created.startsWith(key));
      out.push({ label: d.toLocaleDateString('en-GB', { month: 'short' }), revenue: os.reduce((s, o) => s + o.total, 0), orders: os.length });
    }
    return out;
  }
  const chart = m => { const max = Math.max(1, ...m.map(x => x.revenue)); return `<div class="chart" role="img" aria-label="Monthly revenue">${m.map(x => `<div class="bar" style="height:${Math.max(4, Math.round(x.revenue / max * 100))}%" title="${money(x.revenue)}"><span>${x.label}</span></div>`).join('')}</div><div style="height:28px"></div>`; };
  const topProducts = () => { const m = {}; S.orders.filter(UNITS).forEach(o => o.items.forEach(i => { m[i.name] = (m[i.name] || 0) + i.qty; })); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const stockRows = () => S.products.flatMap(p => A.hasOptions(p)
    ? p.variants.map((v, i) => ({ p, i, label: p.name + ' — ' + A.vlabel(p, v.key), sku: v.sku, stock: v.stock }))
    : [{ p, i: -1, label: p.name, sku: 'BB-' + String(p.id).padStart(4, '0'), stock: p.stock }]);
  const low = () => stockRows().filter(r => r.stock <= S.settings.lowStock);
  const orderRow = o => row(o.id + o.name + o.status, [o.id, esc(o.name), A.fmtDate(o.created), money(o.total), esc(o.payment), badge(o.status), btn('View', 'vieworder:' + o.id)]);
  const orderCols = ['Order', 'Customer', 'Date', 'Amount', 'Payment', 'Status', ''];

  /* ---------- DASHBOARD ---------- */
  A.pages['admin-dashboard'] = () => {
    const live = S.orders.filter(UNITS), rev = live.reduce((s, o) => s + o.total, 0), m = monthly();
    const awaiting = S.orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length;
    put(`<div class="toolbar"><div><h1>A lovely day to grow.</h1><p>Here’s what’s blooming in your store.</p></div></div>
      <div class="stats">${[['Revenue', money(rev), `${live.length} orders (excl. cancelled)`], ['Orders', S.orders.length, `${awaiting} awaiting dispatch`], ['Customers', S.customers.length, 'registered'], ['Products', S.products.length, `${low().length} low-stock items`]].map(([k, v, t]) => `<div class="stat"><label>${k}</label><strong>${v}</strong><small>${t}</small></div>`).join('')}</div>
      <div class="twocol"><section class="panel"><div class="toolbar"><h2>Sales overview</h2><span class="muted">Last 6 months · BDT</span></div>${chart(m)}</section>
      <section class="panel"><h2>Little bestsellers</h2>${topProducts().slice(0, 4).map(([n, q]) => { const p = S.products.find(x => x.name === n); return `<div class="mini">${p ? A.art(p, 'tableart') : ''}<div class="grow"><b>${esc(n)}</b><p class="muted" style="margin:2px 0 0">${q} units sold</p></div></div>`; }).join('') || '<p class="muted">No orders yet.</p>'}</section></div>
      <section class="panel" style="margin-top:24px"><div class="toolbar"><h2>Recent orders</h2><a href="orders.html">View all orders →</a></div>${table(orderCols, S.orders.slice(0, 5).map(orderRow))}</section>
      ${low().length ? `<div class="notice" style="margin-top:20px">Low stock: ${low().slice(0, 6).map(r => `${esc(r.label)} (${r.stock})`).join(', ')}. <a href="inventory.html"><u>Review inventory →</u></a></div>` : ''}`);
  };

  /* ---------- PRODUCTS ---------- */
  const IMG_OPTS = [[1, 'Teddy & rainbow set'], [2, 'Pink romper'], [3, 'Mint feeding set'], [4, 'Knitted booties'], [5, 'Wooden stacker'], [6, 'Blue towel']];
  A.pages['admin-products'] = () => listPage({
    title: 'Products', sub: 'Manage your catalogue, options and prices.', add: 'Add product', addAction: 'newproduct', cols: ['Product', 'Category', 'Price', 'Stock', 'Variants', 'Actions'],
    rows: () => S.products.map(p => { const [lo, hi] = A.priceRange(p); return row(p.name + p.category + p.brand, [A.art(p, 'tableart') + esc(p.name), esc(p.category), lo === hi ? money(lo) : money(lo) + ' – ' + money(hi),
      p.stock <= 0 ? badge('Sold out') : p.stock, A.hasOptions(p) ? `<span class="badge info">${p.variants.length} variants</span>` : '<span class="badge mute">Simple</span>',
      acts(btn('Edit', 'editproduct:' + p.id), btn('Delete', 'delproduct:' + p.id, 'btn light small danger'))]); })
  });
  function productModal(p) {
    const rec = p ? A.clone(p) : { name: '', price: 890, old: 1090, stock: 10, category: (S.categories[0] || {}).name, brand: (S.brands[0] || {}).name, tag: 'New arrival', img: 1, desc: '', options: {}, variants: [] };
    const cur = { options: A.clone(rec.options || {}), variants: A.clone(rec.variants || []) };
    const basics = [{ n: 'name', l: 'Product name' }, { n: 'category', l: 'Category', t: 'select', opts: S.categories.map(c => c.name) }, { n: 'brand', l: 'Brand', t: 'select', opts: S.brands.map(b => b.name) },
      { n: 'tag', l: 'Badge (e.g. New arrival)', def: 'New arrival' }, { n: 'img', l: 'Sample photo', t: 'select', opts: IMG_OPTS }];
    const base = [{ n: 'price', l: 'Selling price (BDT)', t: 'number', x: 'min="1"' }, { n: 'old', l: 'Regular price (BDT)', t: 'number', x: 'min="1"' }, { n: 'stock', l: 'Stock', t: 'number', x: 'min="0" step="1"' }];
    const optSets = S.attributes.map(a => `<fieldset class="optset"><legend>${esc(a.name)}${a.type === 'unit' && a.unit ? ' (' + esc(a.unit) + ')' : ''}</legend>${a.values.length ? a.values.map(v => `<label class="chip"><input type="checkbox" data-opt="${a.id}" value="${esc(v.label)}" ${(cur.options[a.id] || []).includes(v.label) ? 'checked' : ''}>${a.type === 'color' ? `<span class="dot" style="background:${esc(v.hex)}"></span>` : ''}${esc(v.label)}</label>`).join('') : '<span class="muted">No values yet — add some under Attributes.</span>'}</fieldset>`).join('');
    pending = d => {
      cur.variants.forEach((v, i) => { v.sku = d['vsku_' + i] || v.sku; v.price = Number(d['vprice_' + i]); v.old = Number(d['vold_' + i]); v.stock = Number(d['vstock_' + i]); });
      if (cur.variants.some(v => v.old < v.price)) { toast('Regular price must be at least the selling price for every variant.'); return false; }
      if (!cur.variants.length && Number(d.old) < Number(d.price)) { toast('Regular price must be at least the selling price.'); return false; }
      const options = Object.fromEntries(Object.entries(cur.options).filter(([, v]) => v.length));
      const out = { name: d.name.trim(), category: d.category, brand: d.brand, tag: d.tag, img: Number(d.img), desc: d.desc || '', options, variants: cur.variants };
      if (!cur.variants.length) Object.assign(out, { price: Number(d.price), old: Number(d.old), stock: Number(d.stock) });
      let target = p ? A.prod(p.id) : null;
      if (target) Object.assign(target, out); else { target = { id: Math.max(0, ...S.products.map(x => x.id)) + 1, rating: 4.8, reviews: 0, price: 0, old: 0, stock: 0, ...out }; S.products.push(target); }
      A.syncProduct(target); A.persist('products'); toast('Product saved'); A.pages['admin-products']();
    };
    modal(`<h2>${p ? 'Edit' : 'Add'} product</h2><form data-form="adminform"><div class="formgrid">${basics.map(f => fld(f, rec)).join('')}</div>
      <label class="field"><span>Description</span><textarea name="desc">${esc(rec.desc)}</textarea></label>
      <div id="basefields"><h3>Price &amp; stock</h3><div class="formgrid">${base.map(f => fld(f, rec)).join('')}</div></div>
      <h3>Options</h3><p class="muted sectionnote">Tick the values customers can choose (size, color, weight…). Define more in Attributes. Each combination becomes a variant with its own price.</p>${optSets}
      <div id="variants"></div><div class="actions"><button class="btn pink">Save product</button><button type="button" class="btn light" data-action="close">Cancel</button></div></form>`, true);
    const form = $('#modal form');
    const renderVariants = () => {
      // keep edits typed so far
      cur.variants.forEach((v, i) => { const g = n => form.elements[n + i]; if (g('vprice_')) { v.sku = g('vsku_').value; v.price = Number(g('vprice_').value); v.old = Number(g('vold_').value); v.stock = Number(g('vstock_').value); } });
      const baseVals = { price: Number(form.elements.price.value) || rec.price, old: Number(form.elements.old.value) || rec.old, stock: Number(form.elements.stock.value) || 0 };
      cur.variants = A.buildVariants({ id: p ? p.id : Math.max(0, ...S.products.map(x => x.id)) + 1, options: cur.options, ...baseVals }, cur.variants);
      const has = cur.variants.length;
      $('#basefields').hidden = !!has; ['price', 'old', 'stock'].forEach(n => { form.elements[n].disabled = !!has; });
      $('#variants').innerHTML = has ? `<h3>Variants &amp; prices (${has})</h3><div class="tablewrap"><table class="vtable"><thead><tr><th>Variant</th><th>SKU</th><th>Price (৳)</th><th>Regular (৳)</th><th>Stock</th></tr></thead><tbody>${cur.variants.map((v, i) => `<tr><td>${esc(S.attributes.filter(a => v.opts[a.id]).map(a => a.name + ': ' + v.opts[a.id]).join(', '))}</td><td><input class="sku" name="vsku_${i}" value="${esc(v.sku)}" required></td><td><input name="vprice_${i}" type="number" min="1" value="${v.price}" required></td><td><input name="vold_${i}" type="number" min="1" value="${v.old}" required></td><td><input name="vstock_${i}" type="number" min="0" step="1" value="${v.stock}" required></td></tr>`).join('')}</tbody></table></div>` : '';
    };
    $('#modal').onchange = e => {
      if (!e.target.dataset.opt || !$('#variants')) return;
      cur.options = {};
      $$('input[data-opt]:checked', form).forEach(c => { (cur.options[c.dataset.opt] = cur.options[c.dataset.opt] || []).push(c.value); });
      renderVariants();
    };
    renderVariants();
  }
  A.actions.newproduct = () => productModal(null);
  A.actions.editproduct = ([id]) => productModal(A.prod(id));
  A.actions.delproduct = ([id]) => confirmBox('Delete this product?', 'It will also be removed from carts and wishlists in this browser.', 'confirmdelproduct:' + id);
  A.actions.confirmdelproduct = ([id]) => {
    id = Number(id); S.products = S.products.filter(p => p.id !== id); S.cart = S.cart.filter(c => c.id !== id); S.wish = S.wish.filter(w => w !== id);
    A.persist('products', 'cart', 'wish'); closeModal(); toast('Product deleted'); A.pages['admin-products']();
  };

  /* ---------- ATTRIBUTES (size, color, weight, units …) ---------- */
  const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const usedValues = id => { const set = new Set(); S.products.forEach(p => (p.options && p.options[id] || []).forEach(v => set.add(v))); return set; };
  const valuesToText = a => a.values.map(v => a.type === 'color' ? v.label + '=' + v.hex : a.type === 'unit' ? v.label.replace(new RegExp('\\s*' + a.unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), '') : v.label).join(', ');
  function parseValues(type, unit, raw) {
    const out = [], seen = new Set();
    for (let item of raw.split(/[\n,]+/).map(x => x.trim()).filter(Boolean)) {
      let v;
      if (type === 'color') { const [l, h] = item.split('='); const hex = (h || '').trim(); v = { label: l.trim(), hex: /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#cccccc' }; }
      else if (type === 'unit') v = { label: /^[\d.]+$/.test(item) && unit ? item + ' ' + unit : item };
      else v = { label: item };
      v.label = v.label.replace(/[|=]/g, '').trim();
      if (v.label && !seen.has(v.label.toLowerCase())) { seen.add(v.label.toLowerCase()); out.push(v); }
    }
    return out;
  }
  A.pages['admin-attributes'] = () => listPage({
    title: 'Attributes', sub: 'Define the options customers choose from: size, color, weight, material and any other unit.', add: 'Add attribute', addAction: 'newattr', cols: ['Attribute', 'Type', 'Values', 'Used by', 'Actions'],
    rows: () => S.attributes.map((a, i) => row(a.name + a.type + a.values.map(v => v.label).join(' '), [`<b>${esc(a.name)}</b>`, a.type === 'color' ? 'Color swatch' : a.type === 'unit' ? 'Number + unit (' + esc(a.unit) + ')' : 'Text',
      `<div class="valuechips">${a.values.map(v => `<span>${a.type === 'color' ? `<i class="dot" style="background:${esc(v.hex)}"></i>` : ''}${esc(v.label)}</span>`).join('')}</div>`,
      S.products.filter(p => p.options && p.options[a.id] && p.options[a.id].length).length + ' products', acts(btn('Edit', 'editattr:' + i), btn('Delete', 'delattr:' + i, 'btn light small danger'))]))
  });
  const attrFields = () => [{ n: 'name', l: 'Attribute name (e.g. Size, Weight, Volume)' }, { n: 'type', l: 'Type', t: 'select', opts: [['text', 'Text (sizes, materials…)'], ['color', 'Color swatch'], ['unit', 'Number + unit (weight, volume, length…)']] },
    { n: 'unit', l: 'Unit (for “Number + unit”, e.g. g, kg, ml, cm)', req: false }, { n: 'values', l: 'Values — separate with commas. Colors: Rose=#F2A7B5. Units: 250, 500, 1000', t: 'textarea' }];
  const saveAttr = idx => d => {
    const name = d.name.trim(), id = idx === null ? slug(name) : S.attributes[idx].id, unit = (d.unit || '').trim();
    if (!id) { toast('Please enter a name.'); return false; }
    if (S.attributes.some((a, i) => i !== idx && (a.id === id || a.name.toLowerCase() === name.toLowerCase()))) { toast('An attribute with that name already exists.'); return false; }
    if (d.type === 'unit' && !unit) { toast('Please enter a unit such as g, kg or ml.'); return false; }
    const values = parseValues(d.type, unit, d.values);
    if (!values.length) { toast('Add at least one value.'); return false; }
    if (idx !== null) { const gone = [...usedValues(id)].filter(u => !values.some(v => v.label === u)); if (gone.length) { toast('Still used by products: ' + gone.join(', ') + '. Remove it from those products first.'); return false; } }
    const rec = { id, name, type: d.type, unit: d.type === 'unit' ? unit : '', values };
    if (idx === null) S.attributes.push(rec); else S.attributes[idx] = rec;
    A.persist('attributes'); toast('Attribute saved'); A.pages['admin-attributes']();
  };
  A.actions.newattr = () => formModal('Add attribute', attrFields(), { type: 'text' }, saveAttr(null));
  A.actions.editattr = ([i]) => { const a = S.attributes[Number(i)]; formModal('Edit attribute', attrFields(), { ...a, values: valuesToText(a) }, saveAttr(Number(i))); };
  A.actions.delattr = ([i]) => {
    const a = S.attributes[Number(i)];
    if (S.products.some(p => p.options && p.options[a.id] && p.options[a.id].length)) return toast('This attribute is used by products. Remove it from them first.');
    confirmBox('Delete “' + esc(a.name) + '”?', 'This cannot be undone.', 'confirmdelattr:' + i);
  };
  A.actions.confirmdelattr = ([i]) => { S.attributes.splice(Number(i), 1); A.persist('attributes'); closeModal(); toast('Attribute deleted'); A.pages['admin-attributes'](); };

  /* ---------- CATEGORIES & BRANDS ---------- */
  const STATUS = { categories: ['Visible', 'Hidden'], brands: ['Active', 'Inactive'] };
  function simpleList(key, label, one, extraFields) {
    const field = key === 'categories' ? 'category' : 'brand', page = 'admin-' + key;
    A.pages[page] = () => listPage({
      title: label, sub: `Organise your ${label.toLowerCase()}.`, add: 'Add ' + one, addAction: 'new' + key,
      cols: [one[0].toUpperCase() + one.slice(1), 'Products', 'Status', 'Actions'],
      rows: () => S[key].map((r, i) => row(r.name, [esc(r.name), S.products.filter(p => p[field] === r.name).length, badge(r.status), acts(btn('Edit', `edit${key}:${i}`), btn('Delete', `del${key}:${i}`, 'btn light small danger'))]))
    });
    const fields = () => [{ n: 'name', l: 'Name' }, ...extraFields, { n: 'status', l: 'Status', t: 'select', opts: STATUS[key] }];
    const save = idx => d => {
      const name = d.name.trim();
      if (S[key].some((r, i) => i !== idx && r.name.toLowerCase() === name.toLowerCase())) { toast('That name already exists.'); return false; }
      if (idx !== null && S[key][idx].name !== name) S.products.forEach(p => { if (p[field] === S[key][idx].name) p[field] = name; });
      const rec = { ...d, name }; if (idx === null) S[key].push(rec); else S[key][idx] = rec;
      A.persist(key, 'products'); toast('Saved'); A.pages[page]();
    };
    A.actions['new' + key] = () => formModal('Add ' + one, fields(), { status: STATUS[key][0] }, save(null));
    A.actions['edit' + key] = ([i]) => formModal('Edit', fields(), S[key][Number(i)], save(Number(i)));
    A.actions['del' + key] = ([i]) => {
      const r = S[key][Number(i)];
      if (S.products.some(p => p[field] === r.name)) return toast('Move or delete the products in this group first.');
      confirmBox('Delete “' + esc(r.name) + '”?', 'This cannot be undone.', `confirmdel${key}:${i}`);
    };
    A.actions['confirmdel' + key] = ([i]) => { S[key].splice(Number(i), 1); A.persist(key); closeModal(); toast('Deleted'); A.pages[page](); };
  }
  simpleList('categories', 'Categories', 'category', [{ n: 'icon', l: 'Icon', t: 'select', opts: ICONS }]);
  simpleList('brands', 'Brands', 'brand', []);

  /* ---------- ORDERS ---------- */
  A.pages['admin-orders'] = () => {
    let st = '';
    const draw = listPage({
      title: 'Orders', sub: 'Review and update customer orders.', cols: orderCols,
      filters: `<select id="ost" aria-label="Filter by status"><option value="">All statuses</option>${['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => `<option>${s}</option>`).join('')}</select>`,
      rows: () => S.orders.filter(o => !st || o.status === st).map(orderRow)
    });
    $('#ost').addEventListener('change', e => { st = e.target.value; draw(); });
  };
  A.actions.vieworder = ([id]) => {
    const o = S.orders.find(x => x.id === id);
    pending = d => {
      const was = o.status; o.status = d.status; o.paid = d.paid === 'on';
      if (was !== 'Cancelled' && o.status === 'Cancelled' && !o.restocked) { o.items.forEach(i => A.adjustStock(i.id, i.vkey || '', i.qty)); o.restocked = true; }
      if (was === 'Cancelled' && o.status !== 'Cancelled' && o.restocked) { o.items.forEach(i => A.adjustStock(i.id, i.vkey || '', -i.qty)); o.restocked = false; }
      A.persist('orders', 'products'); toast('Order updated'); (A.pages[document.body.dataset.page] || (() => { }))();
    };
    modal(`<h2>Order ${o.id}</h2><p>${esc(o.name)} · ${esc(o.phone)} · ${esc(o.email)}<br>${esc(o.address)}, ${esc(o.city)} (${o.district === 'Dhaka' ? 'Inside' : 'Outside'} Dhaka)${o.notes ? '<br><i>Note: ' + esc(o.notes) + '</i>' : ''}</p>
      ${o.items.map(i => `<p style="margin:6px 0">${esc(i.name)}${i.variant ? ` <span class="muted">(${esc(i.variant)})</span>` : ''} × ${i.qty} — ${money(i.price * i.qty)}</p>`).join('')}
      <p class="muted">Subtotal ${money(o.subtotal)} · Discount −${money(o.discount)} · Delivery ${money(o.delivery)} · <b>Total ${money(o.total)}</b> · ${esc(o.payment)}</p>
      <form data-form="adminform"><div class="formgrid"><label class="field"><span>Order status</span><select name="status">${['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => `<option ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
      <label class="checkline"><input type="checkbox" name="paid" ${o.paid ? 'checked' : ''}> Payment received</label></div><div class="actions"><button class="btn pink">Update order</button><button type="button" class="btn light" onclick="window.print()">Print</button></div></form>`);
  };

  /* ---------- CUSTOMERS ---------- */
  const custFields = () => [{ n: 'name', l: 'Full name' }, { n: 'email', l: 'Email', t: 'email' }, { n: 'phone', l: 'Phone', req: false }, { n: 'status', l: 'Status', t: 'select', opts: ['Active', 'Inactive'] }];
  A.pages['admin-customers'] = () => listPage({
    title: 'Customers', sub: 'People who shop with you.', add: 'Add customer', addAction: 'newcustomer', cols: ['Customer', 'Email', 'Phone', 'Orders', 'Spent', 'Status', 'Actions'],
    rows: () => S.customers.map((c, i) => { const os = S.orders.filter(o => o.email === c.email.toLowerCase() && UNITS(o)); return row(c.name + c.email + c.phone, [esc(c.name), esc(c.email), esc(c.phone || '—'), os.length, money(os.reduce((s, o) => s + o.total, 0)), badge(c.status), acts(btn('Edit', 'editcustomer:' + i), btn('Delete', 'delcustomer:' + i, 'btn light small danger'))]); })
  });
  const saveCust = idx => d => { const r = { ...d, email: d.email.trim().toLowerCase() }; if (idx === null) S.customers.push(r); else S.customers[idx] = r; A.persist('customers'); toast('Customer saved'); A.pages['admin-customers'](); };
  A.actions.newcustomer = () => formModal('Add customer', custFields(), { status: 'Active' }, saveCust(null));
  A.actions.editcustomer = ([i]) => formModal('Edit customer', custFields(), S.customers[Number(i)], saveCust(Number(i)));
  A.actions.delcustomer = ([i]) => confirmBox('Delete this customer?', 'Their past orders stay in the order list.', 'confirmdelcustomer:' + i);
  A.actions.confirmdelcustomer = ([i]) => { S.customers.splice(Number(i), 1); A.persist('customers'); closeModal(); toast('Customer deleted'); A.pages['admin-customers'](); };

  /* ---------- INVENTORY ---------- */
  A.pages['admin-inventory'] = () => listPage({
    title: 'Inventory', sub: `Variants with ${S.settings.lowStock} or fewer units are flagged as low stock.`, cols: ['Product / variant', 'SKU', 'Available', 'Stock health', 'Action'],
    rowClass: r => r.low ? 'lowrow' : '',
    rows: () => stockRows().map(r => ({ ...row(r.label + r.sku, [esc(r.label), r.sku, r.stock, r.stock <= 0 ? badge('Out of stock') : r.stock <= S.settings.lowStock ? '<span class="badge warn">Low stock</span>' : badge('In stock'), btn('Adjust', 'stock:' + r.p.id + ':' + r.i)]), low: r.stock <= S.settings.lowStock }))
  });
  A.actions.stock = ([id, vi]) => {
    const p = A.prod(id), i = Number(vi), v = i >= 0 ? p.variants[i] : null;
    formModal('Adjust stock — ' + p.name + (v ? ' (' + A.vlabel(p, v.key) + ')' : ''), [{ n: 'stock', l: 'New available quantity', t: 'number', x: 'min="0" step="1"' }, { n: 'reason', l: 'Reason (e.g. new delivery, damaged)' }], { stock: v ? v.stock : p.stock },
      d => { if (v) { v.stock = Number(d.stock); A.syncProduct(p); } else p.stock = Number(d.stock); A.persist('products'); toast('Stock updated'); A.pages['admin-inventory'](); });
  };

  /* ---------- COUPONS ---------- */
  const couponFields = () => [{ n: 'code', l: 'Coupon code', x: 'pattern="[A-Za-z0-9]{3,20}" title="Letters and numbers only"' }, { n: 'type', l: 'Type', t: 'select', opts: [['percent', 'Percent off'], ['fixed', 'Fixed amount (BDT)']] }, { n: 'value', l: 'Value', t: 'number', x: 'min="1"' }, { n: 'min', l: 'Minimum order (BDT)', t: 'number', x: 'min="0"', def: 0 }, { n: 'status', l: 'Status', t: 'select', opts: ['Active', 'Inactive'] }];
  A.pages['admin-coupons'] = () => listPage({
    title: 'Coupons', sub: 'Active coupons work instantly in the storefront cart.', add: 'Add coupon', addAction: 'newcoupon', cols: ['Code', 'Discount', 'Minimum order', 'Status', 'Actions'],
    rows: () => S.coupons.map((c, i) => row(c.code, [`<b>${esc(c.code)}</b>`, c.type === 'percent' ? c.value + '% off' : money(c.value) + ' off', c.min ? money(c.min) : 'None', badge(c.status), acts(btn('Edit', 'editcoupon:' + i), btn('Delete', 'delcoupon:' + i, 'btn light small danger'))]))
  });
  const saveCoupon = idx => d => {
    const code = d.code.trim().toUpperCase(), value = Number(d.value);
    if (S.coupons.some((c, i) => i !== idx && c.code === code)) { toast('That code already exists.'); return false; }
    if (d.type === 'percent' && value > 100) { toast('Percent cannot exceed 100.'); return false; }
    const r = { code, type: d.type, value, min: Number(d.min) || 0, status: d.status }; if (idx === null) S.coupons.push(r); else S.coupons[idx] = r;
    A.persist('coupons'); toast('Coupon saved'); A.pages['admin-coupons']();
  };
  A.actions.newcoupon = () => formModal('Add coupon', couponFields(), { type: 'percent', status: 'Active' }, saveCoupon(null));
  A.actions.editcoupon = ([i]) => formModal('Edit coupon', couponFields(), S.coupons[Number(i)], saveCoupon(Number(i)));
  A.actions.delcoupon = ([i]) => { S.coupons.splice(Number(i), 1); A.persist('coupons'); toast('Coupon deleted'); A.pages['admin-coupons'](); };

  /* ---------- REVIEWS ---------- */
  A.pages['admin-reviews'] = () => listPage({
    title: 'Reviews', sub: 'Approve or reject customer feedback.', cols: ['Product', 'Reviewer', 'Rating', 'Comment', 'Status', 'Actions'],
    rows: () => S.reviews.map((r, i) => row(r.product + r.author + r.text, [esc(r.product), esc(r.author), '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars), esc(r.text), badge(r.status), acts(btn('Approve', 'review:' + i + ':Approved'), btn('Reject', 'review:' + i + ':Rejected'), btn('Delete', 'review:' + i + ':del', 'btn light small danger'))]))
  });
  A.actions.review = ([i, v]) => { if (v === 'del') S.reviews.splice(Number(i), 1); else S.reviews[Number(i)].status = v; A.persist('reviews'); A.pages['admin-reviews'](); };

  /* ---------- PAYMENTS ---------- */
  A.pages['admin-payments'] = () => listPage({
    title: 'Payments', sub: 'Track payment status for each order.', cols: ['Payment', 'Order', 'Method', 'Amount', 'Status', 'Action'],
    rows: () => S.orders.map(o => row(o.id + o.payment + o.name, ['PAY-' + o.id.slice(3), o.id + ' · ' + esc(o.name), esc(o.payment), money(o.total), o.paid ? badge('Paid') : badge('Unpaid'), btn(o.paid ? 'Mark unpaid' : 'Mark paid', 'pay:' + o.id)]))
  });
  A.actions.pay = ([id]) => { const o = S.orders.find(x => x.id === id); o.paid = !o.paid; A.persist('orders'); A.pages['admin-payments'](); };

  /* ---------- REPORTS ---------- */
  A.pages['admin-reports'] = () => {
    const live = S.orders.filter(UNITS), gross = live.reduce((s, o) => s + o.subtotal, 0), disc = live.reduce((s, o) => s + o.discount, 0), m = monthly();
    put(`<div class="toolbar"><div><h1>Reports</h1><p>Sales performance from your orders.</p></div><button class="btn light" data-action="export">Export CSV</button></div>
      <div class="stats">${[['Gross sales', money(gross)], ['Discounts', money(disc)], ['Net sales', money(gross - disc)], ['Orders', live.length]].map(([k, v]) => `<div class="stat"><label>${k}</label><strong>${v}</strong></div>`).join('')}</div>
      <div class="twocol"><section class="panel"><h2>Revenue by month</h2>${chart(m)}${table(['Month', 'Revenue', 'Orders'], m.map(x => row('', [x.label, money(x.revenue), x.orders])))}</section>
      <section class="panel"><h2>Top products</h2>${table(['Product', 'Units'], topProducts().map(([n, q]) => row('', [esc(n), q])))}</section></div>`);
  };
  A.actions.export = () => {
    const csv = ['Order,Date,Customer,Status,Payment,Total BDT', ...S.orders.map(o => [o.id, o.created, '"' + o.name.replace(/"/g, '""') + '"', o.status, o.payment, o.total].join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'MaveloBaby-orders.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  /* ---------- STAFF ---------- */
  const staffFields = () => [{ n: 'name', l: 'Full name' }, { n: 'email', l: 'Email', t: 'email' }, { n: 'role', l: 'Role', t: 'select', opts: ['Super Admin', 'Manager', 'Customer Support', 'Content Editor'] }, { n: 'status', l: 'Status', t: 'select', opts: ['Active', 'Inactive'] }];
  A.pages['admin-staff'] = () => listPage({
    title: 'Staff', sub: 'Team members and their roles.', add: 'Add staff', addAction: 'newstaff', cols: ['Name', 'Email', 'Role', 'Status', 'Actions'],
    rows: () => S.staff.map((s, i) => row(s.name + s.email + s.role, [esc(s.name), esc(s.email), esc(s.role), badge(s.status), acts(btn('Edit', 'editstaff:' + i), btn('Delete', 'delstaff:' + i, 'btn light small danger'))]))
  });
  const saveStaff = idx => d => { if (idx === null) S.staff.push(d); else S.staff[idx] = d; A.persist('staff'); toast('Staff member saved'); A.pages['admin-staff'](); };
  A.actions.newstaff = () => formModal('Add staff member', staffFields(), { role: 'Manager', status: 'Active' }, saveStaff(null));
  A.actions.editstaff = ([i]) => formModal('Edit staff member', staffFields(), S.staff[Number(i)], saveStaff(Number(i)));
  A.actions.delstaff = ([i]) => {
    if (S.staff.filter(s => s.role === 'Super Admin').length === 1 && S.staff[Number(i)].role === 'Super Admin') return toast('Keep at least one Super Admin.');
    S.staff.splice(Number(i), 1); A.persist('staff'); toast('Staff member removed'); A.pages['admin-staff']();
  };

  /* ---------- SETTINGS ---------- */
  A.pages['admin-settings'] = () => {
    const s = S.settings;
    put(`<div class="toolbar"><div><h1>Settings</h1><p>Store details, delivery fees and payment methods.</p></div></div>
      <form data-form="settings" class="panel" style="max-width:720px"><h2>Store information</h2><div class="formgrid">
      <label class="field"><span>Store name</span><input name="store" value="${esc(s.store)}" required></label><label class="field"><span>Tagline</span><input name="tagline" value="${esc(s.tagline)}" required></label>
      <label class="field"><span>Currency</span><input value="BDT (৳)" readonly></label><label class="field"><span>Timezone</span><input value="Asia/Dhaka" readonly></label>
      <label class="field"><span>Inside Dhaka delivery fee</span><input name="dhaka" type="number" min="0" value="${s.dhaka}" required></label><label class="field"><span>Outside Dhaka delivery fee</span><input name="outside" type="number" min="0" value="${s.outside}" required></label>
      <label class="field"><span>Low-stock threshold (units)</span><input name="lowStock" type="number" min="0" value="${s.lowStock}" required></label></div>
      <h2>Payment methods at checkout</h2><div class="checks">${[['cod', 'Cash on Delivery'], ['bkash', 'bKash'], ['nagad', 'Nagad']].map(([k, l]) => `<label class="checkline"><input type="checkbox" name="${k}" ${s.pay[k] ? 'checked' : ''}> ${l}</label>`).join('')}</div>
      <div class="actions"><button class="btn pink">Save settings</button><button type="button" class="btn light danger" data-action="resetdata">Reset demo data</button></div></form>`);
  };
  A.forms.settings = d => {
    S.settings = { ...S.settings, store: d.store, tagline: d.tagline, dhaka: Number(d.dhaka), outside: Number(d.outside), lowStock: Number(d.lowStock), pay: { cod: !!d.cod, bkash: !!d.bkash, nagad: !!d.nagad } };
    A.persist('settings'); toast('Settings saved');
  };
  A.actions.resetdata = () => confirmBox('Reset all demo data?', 'This clears products, orders, carts and settings saved in this browser and restores the starter catalogue.', 'confirmreset');
  A.actions.confirmreset = () => { Object.keys(localStorage).filter(k => k.startsWith('bb-')).forEach(k => localStorage.removeItem(k)); location.reload(); };
})();
