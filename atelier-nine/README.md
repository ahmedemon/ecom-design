# Atelier Nine — multi-page storefront

A static, build-free multi-page storefront split out of the original single-page `index8.html`.
Tailwind (CDN), vanilla JS, Swiper on the home hero. Cart, wishlist, orders and accounts persist in `localStorage` (demo only — no backend, no real payments).

## Run it
Open `index.html` directly, or serve the folder (recommended):

```bash
npx serve .          # or: python3 -m http.server 8000
```
Internet access is needed for the Tailwind/Swiper CDNs, Google Fonts and product images (Unsplash).

## Pages
| Page | File |
|---|---|
| Home (hero slider, categories, sections, reviews, journal, newsletter) | `index.html` |
| Shop / search / filters (`?category=`, `?tag=`, `?q=`, `?sort=`, `?max=`, `?stock=1`) | `shop.html` |
| Product detail (`?id=`) | `product.html` |
| Basket + promo codes (`WELCOME10`, `KNIT15`) | `cart.html` |
| Checkout → confirmation | `checkout.html`, `order-confirmation.html` |
| Track order | `track-order.html` |
| Wishlist, Account (sign in / create / order history) | `wishlist.html`, `account.html` |
| Journal + posts (`?slug=`) | `journal.html`, `journal-post.html` |
| Company | `about.html`, `materials.html`, `factories.html` |
| Support | `size-guide.html`, `shipping-returns.html`, `contact.html` |
| Policies | `privacy.html`, `terms.html`, `refunds.html` |
| Not found | `404.html` |

## Structure
```
js/data.js      products, categories, hero slides, reviews, journal, FAQ  ← edit content here
js/store.js     cart / wishlist / orders / user state + product card renderer
js/layout.js    shared header, mobile menu, cart drawer, footer
js/tailwind-config.js, css/styles.css, assets/
```

## Before going live
- Replace Unsplash/pngimg placeholder images with your own (`js/data.js`).
- Wire `checkout.html` to a real payment provider and backend; the demo auth in `account.html` stores passwords in plain text in the browser and must be replaced with a real service.
- Review the policy pages with a lawyer; connect the contact and newsletter forms.
