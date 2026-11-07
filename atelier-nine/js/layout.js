/* Atelier Nine — shared header, footer, drawers. Pages include <div id="site-header"></div> and <div id="site-footer"></div>. */
(function () {
  const { money, esc } = Store;
  const page = document.body.dataset.page || '';
  const ic = (d, c = 'h-5 w-5', sw = 1.7) => `<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" aria-hidden="true">${d}</svg>`;
  const I = {
    menu: '<path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6" stroke-linecap="round"/>',
    user: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c.6-3.6 3.4-5.6 7-5.6s6.4 2 7 5.6" stroke-linecap="round"/>',
    heart: '<path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z" stroke-linejoin="round"/>',
    cart: '<path d="M4 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.55L21 8H7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/>',
    x: '<path d="M6 6l12 12M18 6 6 18" stroke-linecap="round"/>',
    chev: '<path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>',
    truck: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17.5" cy="18" r="1.5"/>'
  };
  const logo = (dark) => `<a href="index.html" class="flex shrink-0 items-center gap-2"><span class="grid h-9 w-9 place-items-center rounded-xl ${dark ? 'bg-white text-brand-800' : 'bg-brand-700 text-white'}"><svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 4 20 20H4L12 4Z" stroke-linejoin="round"/><path d="M8.5 14h7" stroke-linecap="round"/></svg></span><span class="font-display text-lg font-extrabold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}">Atelier<span class="${dark ? 'text-brand-300' : 'text-brand-600'}">Nine</span></span></a>`;
  const catLinks = (cls) => `<a href="shop.html" class="${cls}">All products</a>` + CATEGORIES.map(c => `<a href="shop.html?category=${c.id}" class="${cls}">${esc(c.name)}</a>`).join('');
  const params = new URLSearchParams(location.search);

  const header = `
  <div class="bg-brand-900 text-white"><div class="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-[11px] font-medium tracking-wide">${ic(I.truck, 'h-3.5 w-3.5 text-brand-300', 1.8)}<span>Free shipping on orders over $100</span><span class="mx-1 text-white/30">·</span><span class="hidden sm:inline">Free 60-day returns &amp; exchanges</span></div></div>
  <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur" id="main-header">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center gap-3 sm:h-[72px] sm:gap-5">
        <button type="button" id="open-menu" class="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-gray-700 transition hover:bg-gray-100 lg:hidden" aria-label="Open navigation">${ic(I.menu)}</button>
        ${logo(false)}
        <form role="search" action="shop.html" method="get" class="hidden flex-1 md:block"><div class="relative mx-auto max-w-xl">
          <label for="search-desktop" class="sr-only">Search products</label>
          <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">${ic(I.search, 'h-[18px] w-[18px]', 1.8)}</span>
          <input id="search-desktop" name="q" type="search" value="${esc(params.get('q') || '')}" autocomplete="off" placeholder="Search sneakers, knitwear, denim…" class="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15"/>
        </div></form>
        <div class="ml-auto flex items-center gap-1 sm:gap-1.5">
          <a href="shop.html?focus=search" class="grid h-10 w-10 place-items-center rounded-xl text-gray-700 hover:bg-gray-100 md:hidden" aria-label="Search">${ic(I.search)}</a>
          <a href="account.html" class="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 sm:flex">${ic(I.user, 'h-[18px] w-[18px]')}<span class="hidden lg:inline" id="account-label">Account</span></a>
          <a href="wishlist.html" class="relative grid h-10 w-10 place-items-center rounded-xl text-gray-700 transition hover:bg-gray-100" aria-label="Wishlist">${ic(I.heart, 'h-[19px] w-[19px]')}<span id="wish-badge" hidden class="absolute right-0.5 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white"></span></a>
          <button type="button" id="open-cart" class="relative flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-3 text-white transition hover:bg-black sm:px-4" aria-label="Open shopping cart">${ic(I.cart, 'h-[18px] w-[18px]')}<span class="text-sm font-semibold"><span class="hidden sm:inline">Cart · </span><span id="cart-count">0</span></span></button>
        </div>
      </div>
      <nav class="hidden items-center gap-6 border-t border-gray-100 py-2.5 lg:flex" aria-label="Product categories">
        ${catLinks('text-[13px] font-medium text-gray-600 transition hover:text-gray-900')}
        <a href="journal.html" class="text-[13px] font-medium text-gray-600 transition hover:text-gray-900">Journal</a>
        <a href="shop.html?tag=new" class="ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700"><span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span> New season · just landed</a>
      </nav>
    </div>
  </header>

  <div id="menu-drawer" hidden class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
    <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" data-close="menu"></div>
    <aside class="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl">
      <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4"><span class="font-display text-base font-extrabold text-gray-900">Atelier<span class="text-brand-600">Nine</span></span><button type="button" data-close="menu" class="grid h-9 w-9 place-items-center rounded-lg text-gray-600 hover:bg-gray-100" aria-label="Close menu">${ic(I.x, 'h-4 w-4', 2.2)}</button></div>
      <div class="flex-1 overflow-y-auto px-5 py-5">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Categories</p>
        <nav class="mt-2 flex flex-col">${catLinks('flex items-center justify-between border-b border-gray-100 py-3 text-[15px] font-medium text-gray-800').replace(/<\/a>/g, ic(I.chev, 'h-4 w-4 text-gray-400', 2) + '</a>')}</nav>
        <p class="mt-6 text-[11px] font-semibold uppercase tracking-wider text-gray-400">More</p>
        <nav class="mt-2 flex flex-col text-[15px] font-medium text-gray-800">
          <a class="border-b border-gray-100 py-3" href="journal.html">Journal</a><a class="border-b border-gray-100 py-3" href="about.html">Our story</a><a class="border-b border-gray-100 py-3" href="account.html">Account</a><a class="border-b border-gray-100 py-3" href="wishlist.html">Wishlist</a><a class="py-3" href="contact.html">Contact</a>
        </nav>
      </div>
    </aside>
  </div>

  <div id="cart-drawer" hidden class="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
    <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" data-close="cart"></div>
    <aside class="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
      <header class="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><h2 class="font-display text-lg font-extrabold text-gray-900">Your basket</h2><p class="text-[12px] text-gray-500" id="drawer-count"></p></div><button type="button" data-close="cart" class="grid h-9 w-9 place-items-center rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Close cart">${ic(I.x, 'h-4 w-4', 2.2)}</button></header>
      <div class="flex-1 overflow-y-auto px-5 py-4" id="drawer-lines"></div>
      <footer class="border-t border-gray-100 bg-gray-50 px-5 py-4" id="drawer-foot"></footer>
    </aside>
  </div>`;

  const f = (title, links) => `<div><h3 class="text-[11px] font-semibold uppercase tracking-wider text-gray-500">${title}</h3><ul class="mt-3 space-y-2.5 text-sm">${links.map(([l, h]) => `<li><a href="${h}" class="text-gray-400 transition hover:text-white">${l}</a></li>`).join('')}</ul></div>`;
  const footer = `<footer class="mt-16 bg-brand-900 text-gray-300"><div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div class="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
    <div>${logo(true)}<p class="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">Considered footwear and clothing, made in small runs with materials we can trace from mill to wardrobe.</p>
      <div class="mt-6 space-y-2 text-[13px] text-gray-400"><a href="mailto:hello@ateliernine.com" class="block hover:text-white">hello@ateliernine.com</a><a href="tel:+15550142388" class="block hover:text-white">+1 (555) 014-2388</a><p>14 Linen Lane, Portland</p></div></div>
    <div class="grid grid-cols-2 gap-8 sm:grid-cols-4">
      ${f('Shop', CATEGORIES.slice(0, 5).map(c => [c.name, 'shop.html?category=' + c.id]))}
      ${f('Company', [['Our story','about.html'],['Materials','materials.html'],['Factories','factories.html'],['Journal','journal.html']])}
      ${f('Support', [['Track order','track-order.html'],['Shipping & returns','shipping-returns.html'],['Size guide','size-guide.html'],['Contact','contact.html']])}
      ${f('Policies', [['Privacy','privacy.html'],['Terms','terms.html'],['Refunds','refunds.html']])}
    </div></div>
    <div class="mt-12 border-t border-white/10 pt-6"><p class="text-[12px] text-gray-500">© ${new Date().getFullYear()} Atelier Nine. A demonstration storefront — no real orders are placed.</p></div></div></footer>`;

  document.getElementById('site-header').innerHTML = header;
  document.getElementById('site-footer').innerHTML = footer;

  // drawers
  const $ = id => document.getElementById(id);
  const open = n => { $(n + '-drawer').hidden = false; document.body.classList.add('scroll-locked'); if (n === 'cart') renderDrawer(); };
  const close = n => { $(n + '-drawer').hidden = true; if ($('menu-drawer').hidden && $('cart-drawer').hidden) document.body.classList.remove('scroll-locked'); };
  $('open-menu').onclick = () => open('menu');
  $('open-cart').onclick = () => (page === 'cart' || page === 'checkout') ? null : open('cart');
  document.addEventListener('click', e => { const c = e.target.closest('[data-close]'); if (c) close(c.dataset.close); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { close('menu'); close('cart'); } });
  if (page === 'cart' || page === 'checkout') $('open-cart').onclick = () => (location.href = 'cart.html');
  window.openCartDrawer = () => open('cart');

  function renderDrawer() {
    const lines = Store.cart.lines(); const n = Store.cart.count();
    $('drawer-count').textContent = n + (n === 1 ? ' item' : ' items');
    $('drawer-lines').innerHTML = !lines.length
      ? `<div class="flex h-full flex-col items-center justify-center text-center"><div class="grid h-14 w-14 place-items-center rounded-full bg-gray-100 text-gray-400">${ic(I.cart, 'h-6 w-6', 1.6)}</div><p class="mt-4 font-display text-lg font-bold text-gray-900">Your basket is empty</p><p class="mt-1 max-w-[15rem] text-sm text-gray-500">Start with the Everyday Low-Top — it's where most people begin.</p><a href="shop.html" class="mt-5 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">Browse the collection</a></div>`
      : `<ul class="divide-y divide-gray-100">${lines.map(l => `<li class="flex gap-3 py-4"><a href="product.html?id=${l.product.id}" class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50"><img src="${l.product.images[0]}" alt="${esc(l.product.name)}" class="h-full w-full object-cover" onerror="this.style.opacity=0"/></a>
        <div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-2"><div class="min-w-0"><p class="truncate text-[14px] font-semibold text-gray-900">${esc(l.product.name)}</p><p class="mt-0.5 text-[11.5px] text-gray-500">${esc(Store.variantLabel(l.product, l.variant))}</p></div>
        <button data-rm="${l.key}" class="grid h-7 w-7 shrink-0 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-rose-600" aria-label="Remove ${esc(l.product.name)}">${ic(I.x, 'h-3.5 w-3.5', 2.2)}</button></div>
        <div class="mt-2.5 flex items-center justify-between"><div class="inline-flex items-center rounded-lg border border-gray-200"><button data-dec="${l.key}" ${l.qty <= 1 ? 'disabled' : ''} class="grid h-8 w-8 place-items-center text-gray-600 hover:bg-gray-50 disabled:opacity-30" aria-label="Decrease quantity">−</button><span class="w-8 text-center text-[13px] font-semibold">${l.qty}</span><button data-inc="${l.key}" ${l.qty >= l.variant.stock ? 'disabled' : ''} class="grid h-8 w-8 place-items-center text-gray-600 hover:bg-gray-50 disabled:opacity-30" aria-label="Increase quantity">+</button></div><p class="text-[13.5px] font-bold text-gray-900">${money(l.variant.price * l.qty)}</p></div></div></li>`).join('')}</ul>`;
    const empty = !lines.length;
    $('drawer-foot').innerHTML = `<dl class="space-y-1.5 text-[13px]"><div class="flex justify-between text-gray-600"><dt>Subtotal</dt><dd class="font-medium text-gray-900">${money(Store.cart.subtotal())}</dd></div>${Store.cart.discount() ? `<div class="flex justify-between text-brand-700"><dt>Discount</dt><dd>−${money(Store.cart.discount())}</dd></div>` : ''}<div class="flex justify-between text-gray-600"><dt>Shipping</dt><dd class="font-medium text-gray-900">${Store.cart.shipping() ? money(Store.cart.shipping()) : 'Free'}</dd></div><div class="flex justify-between border-t border-gray-200 pt-2 text-[15px] font-bold text-gray-900"><dt>Total</dt><dd>${money(Store.cart.total())}</dd></div></dl>
      <a href="${empty ? '#' : 'checkout.html'}" class="mt-4 block w-full rounded-xl bg-brand-700 py-3 text-center text-sm font-semibold text-white hover:bg-brand-800 ${empty ? 'pointer-events-none opacity-40' : ''}">Proceed to checkout</a>
      <a href="cart.html" class="mt-2 block text-center text-[13px] font-semibold text-gray-600 hover:text-gray-900">View full basket</a>`;
  }
  $('drawer-lines').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.rm) Store.cart.remove(b.dataset.rm);
    const l = k => Store.cart.lines().find(x => x.key === k);
    if (b.dataset.inc) Store.cart.setQty(b.dataset.inc, l(b.dataset.inc).qty + 1);
    if (b.dataset.dec) Store.cart.setQty(b.dataset.dec, l(b.dataset.dec).qty - 1);
  });

  function refresh() {
    $('cart-count').textContent = Store.cart.count();
    const w = Store.state.wishlist.length; const wb = $('wish-badge'); wb.hidden = !w; wb.textContent = w;
    const u = Store.user.get(); $('account-label').textContent = u ? u.name.split(' ')[0] : 'Account';
    if (!$('cart-drawer').hidden) renderDrawer();
  }
  document.addEventListener('store:change', refresh); refresh();

  // keep content pages above-the-fold when cart is added from product pages: open drawer after add if requested
  document.addEventListener('cart:added', () => open('cart'));
})();
