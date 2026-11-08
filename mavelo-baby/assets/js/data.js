/* MaveloBaby seed data.
   Everything here is placeholder content. On first load it is copied to the
   browser's localStorage; the admin panel edits that copy.
   In Phase 2 (Laravel + MySQL) this file is replaced by real API calls. */
window.BB = {
  categories: [
    { name: 'Clothing',    icon: 'shirt',      status: 'Visible' },
    { name: 'Feeding',     icon: 'utensils',   status: 'Visible' },
    { name: 'Toys & Play', icon: 'blocks',     status: 'Visible' },
    { name: 'Bath & Care', icon: 'bath',       status: 'Visible' },
    { name: 'Nursery',     icon: 'moon-star',  status: 'Visible' },
    { name: 'Accessories', icon: 'baby',       status: 'Visible' }
  ],
  brands: [
    { name: 'MaveloBaby',     status: 'Active' },
    { name: 'Little Sprout', status: 'Active' },
    { name: 'Mini & Me',     status: 'Active' },
    { name: 'Bloom Play',    status: 'Active' }
  ],
  // Attribute library — managed in Admin → Attributes. type: text | color | unit
  attributes: [
    { id: 'size', name: 'Size', type: 'text', unit: '', values: ['0–3 months', '3–6 months', '6–12 months', '12–24 months', 'Small', 'Large', 'One size'].map(l => ({ label: l })) },
    { id: 'color', name: 'Color', type: 'color', unit: '', values: [['Rose', '#F2A7B5'], ['Cream', '#F3E6D0'], ['Mint', '#A8E6CF'], ['Blush', '#FFD3DD'], ['Sky', '#A9D6F5'], ['Lavender', '#CDB4DB']].map(([label, hex]) => ({ label, hex })) },
    { id: 'weight', name: 'Weight', type: 'unit', unit: 'g', values: ['250 g', '500 g', '1000 g'].map(l => ({ label: l })) },
    { id: 'material', name: 'Material', type: 'text', unit: '', values: ['Cotton', 'Muslin', 'Wood', 'Silicone'].map(l => ({ label: l })) }
  ],
  // img = which sample photo (1-6) the product uses: assets/img/p{img}.webp
  products: [
    { id: 1, name: 'Little cuddle gift set',     category: 'Nursery',     brand: 'MaveloBaby',     price: 1890, old: 2200, img: 1, stock: 24, tag: 'Bestseller',  rating: 4.9, reviews: 24,
      desc: 'A coordinated teddy, muslin blanket and wooden rainbow — a ready-to-gift set for a newborn.' },
    { id: 2, name: 'Rosy days cotton romper',    category: 'Clothing',    brand: 'Little Sprout', price: 890,  old: 1090, img: 2, stock: 18, tag: 'New arrival', rating: 4.8, reviews: 18,
      desc: 'Soft cotton romper with button fastening and gentle ruffle details.',
      options: { size: ['0–3 months', '3–6 months', '6–12 months'], color: ['Rose', 'Cream'] },
      vdefs: [{ match: { size: '0–3 months' }, price: 890, old: 1090, stock: 3 }, { match: { size: '3–6 months' }, price: 990, old: 1190, stock: 3 }, { match: { size: '6–12 months' }, price: 1090, old: 1290, stock: 3 }] },
    { id: 3, name: 'Tiny tastes feeding set',    category: 'Feeding',     brand: 'Mini & Me',     price: 1250, old: 1490, img: 3, stock: 12, tag: 'Bestseller',  rating: 4.7, reviews: 31,
      desc: 'Coordinated bowl, bib and spoon for first meals.',
      options: { color: ['Mint', 'Blush'] }, vdefs: [{ match: { color: 'Mint' }, price: 1250, old: 1490, stock: 6 }, { match: { color: 'Blush' }, price: 1250, old: 1490, stock: 6 }] },
    { id: 4, name: 'Cloud-soft knitted booties', category: 'Accessories', brand: 'Little Sprout', price: 650,  old: 790,  img: 4, stock: 4,  tag: 'Almost gone', rating: 4.9, reviews: 12,
      desc: 'Knitted booties in warm cream with a tie fastening.',
      options: { size: ['3–6 months', '6–12 months'] }, vdefs: [{ match: { size: '3–6 months' }, price: 650, old: 790, stock: 2 }, { match: { size: '6–12 months' }, price: 690, old: 830, stock: 2 }] },
    { id: 5, name: 'Rainbow wooden stacker',     category: 'Toys & Play', brand: 'Bloom Play',    price: 1190, old: 1390, img: 5, stock: 32, tag: 'Bestseller',  rating: 4.8, reviews: 27,
      desc: 'Pastel wooden stacking rings on a natural wood base.' },
    { id: 6, name: 'After-bath cuddle towel',    category: 'Bath & Care', brand: 'Mini & Me',     price: 990,  old: 1190, img: 6, stock: 20, tag: 'New arrival', rating: 4.8, reviews: 15,
      desc: 'Hooded towel in a soft powder blue.',
      options: { size: ['Small', 'Large'] }, vdefs: [{ match: { size: 'Small' }, price: 990, old: 1190, stock: 10 }, { match: { size: 'Large' }, price: 1290, old: 1490, stock: 10 }] }
  ],
  settings: {
    store: 'MaveloBaby', tagline: 'Little Things, Big Happiness!',
    dhaka: 80, outside: 150, lowStock: 5,
    pay: { cod: true, bkash: true, nagad: true }
  },
  coupons: [
    { code: 'BLOOM10',    type: 'percent', value: 10,  min: 0,    status: 'Active' },
    { code: 'WELCOME100', type: 'fixed',   value: 100, min: 1000, status: 'Active' }
  ],
  customers: [
    { name: 'Nadia Rahman',  email: 'nadia@example.com',   phone: '01711000001', status: 'Active' },
    { name: 'Farhana Ahmed', email: 'farhana@example.com', phone: '01811000002', status: 'Active' },
    { name: 'Sadia Khan',    email: 'sadia@example.com',   phone: '01911000003', status: 'Active' },
    { name: 'Mim Chowdhury', email: 'mim@example.com',     phone: '01611000004', status: 'Active' }
  ],
  reviews: [
    { product: 'Little cuddle gift set',  author: 'Nadia',   stars: 5, text: 'Lovely gift, beautifully packed.', status: 'Approved' },
    { product: 'Rosy days cotton romper', author: 'Farhana', stars: 4, text: 'Soft and lovely.',                 status: 'Pending' },
    { product: 'Tiny tastes feeding set', author: 'Sadia',   stars: 5, text: 'Mealtimes are so much easier.',    status: 'Approved' }
  ],
  staff: [
    { name: 'Store Admin',   email: 'admin@MaveloBaby.example',   role: 'Super Admin',      status: 'Active' },
    { name: 'Support Agent', email: 'support@MaveloBaby.example', role: 'Customer Support', status: 'Active' }
  ],
  // [id, customerIndex, daysAgo, [[productId, qty], ...], status, payment, district]
  seedOrders: [
    ['BB-1013', 0, 150, [[2, 2]],          'Delivered', 'Cash on Delivery', 'Dhaka'],
    ['BB-1014', 1, 128, [[3, 1], [4, 1]],  'Delivered', 'bKash',            'Outside'],
    ['BB-1015', 2, 104, [[1, 1]],          'Delivered', 'Nagad',            'Dhaka'],
    ['BB-1016', 3, 92,  [[5, 1], [6, 1]],  'Delivered', 'Cash on Delivery', 'Dhaka'],
    ['BB-1017', 0, 75,  [[1, 2]],          'Delivered', 'bKash',            'Dhaka'],
    ['BB-1018', 1, 60,  [[6, 2]],          'Delivered', 'Cash on Delivery', 'Outside'],
    ['BB-1019', 2, 44,  [[2, 1], [3, 1]],  'Delivered', 'bKash',            'Dhaka'],
    ['BB-1020', 3, 31,  [[5, 2]],          'Delivered', 'Nagad',            'Dhaka'],
    ['BB-1021', 0, 18,  [[4, 2], [2, 1]],  'Shipped',   'bKash',            'Dhaka'],
    ['BB-1022', 2, 9,   [[3, 1]],          'Pending',   'Nagad',            'Dhaka'],
    ['BB-1023', 1, 4,   [[2, 1]],          'Delivered', 'bKash',            'Outside'],
    ['BB-1024', 0, 1,   [[1, 1], [6, 1]],  'Processing','Cash on Delivery', 'Dhaka']
  ]
};
