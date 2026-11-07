/* Atelier Nine — catalogue, content and helpers (no build step needed) */
const IMG = (id, w = 900, h = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

function buildVariants(prefix, options, config = {}) {
  const { price = 0, compareAt = null, outOfStock = [], lowStock = [], defaultStock = 6 } = config;
  const names = options.map(o => o.name);
  const combos = options.reduce((acc, opt) => acc.flatMap(c => opt.values.map(v => ({ ...c, [opt.name]: v }))), [{}]);
  return combos.map(combo => {
    const key = names.map(n => combo[n]).join(' / ');
    const stock = outOfStock.includes(key) ? 0 : (lowStock.includes(key) ? 2 : defaultStock);
    const sku = prefix + '-' + names.map(n => String(combo[n]).replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase()).join('-');
    const id = prefix + '-' + names.map(n => String(combo[n]).replace(/[^a-zA-Z0-9]+/g, '').toLowerCase()).join('-');
    return {
      id, options: combo, sku, stock,
      price: typeof price === 'function' ? price(combo) : price,
      compareAt: typeof compareAt === 'function' ? compareAt(combo) : compareAt
    };
  });
}
function product(cfg) {
  const { options = [], prefix = 'SKU', price = 0, compareAt = null, outOfStock = [], lowStock = [], defaultStock = 6, ...rest } = cfg;
  return { ...rest, options, variants: buildVariants(prefix, options, { price, compareAt, outOfStock, lowStock, defaultStock }) };
}

const SHOE_SIZES = ['EU 40','EU 41','EU 42','EU 43','EU 44','EU 45','EU 46'];
const TOP_SIZES  = ['XS','S','M','L','XL','XXL'];
const WAISTS     = ['28','30','32','34','36','38'];
const INSEAMS    = ['30','32','34'];
const SZ = (values) => ({ name: 'Size', kind: 'size', values });
const COL = (values) => ({ name: 'Colour', kind: 'color', values });
const B = 'Atelier Nine';

const PRODUCTS = [
  product({ id:'trail-runner-gtx', name:'Trail Runner GTX', brand:B, category:'sneakers', categoryLabel:'Sneakers', tags:['new','footwear'], rating:4.8, reviews:142, badge:'New',
    images:[IMG('photo-1542291026-7eec264c27ff'),IMG('photo-1600185365483-26d7a4cc7519'),IMG('photo-1521369909029-2afed882baee')],
    blurb:'A waterproof trail shoe that still looks right on the street.',
    description:'Built on a lugged rubber outsole with a waterproof membrane and a rock plate underfoot. The upper is recycled ripstop with a suede toe bumper — light enough for the commute, tough enough for a wet weekend.',
    details:['Waterproof, breathable membrane','Vibram® Megagrip outsole','Recycled ripstop upper','Runs true to size'],
    prefix:'TRG', options:[SZ(SHOE_SIZES),COL(['Slate','Forest','Sand'])],
    price:c=>['EU 45','EU 46'].includes(c.Size)?170:165, compareAt:195, outOfStock:['EU 40 / Sand','EU 46 / Slate'], lowStock:['EU 45 / Forest','EU 41 / Slate'] }),
  product({ id:'everyday-low-top', name:'Everyday Low-Top', brand:B, category:'sneakers', categoryLabel:'Sneakers', tags:['best','footwear'], rating:4.9, reviews:384, badge:'Bestseller',
    images:[IMG('photo-1595950653106-6c9ebd614d3a'),IMG('photo-1560769629-975ec94e6a86'),IMG('photo-1606107557195-0e29a4b5b4aa')],
    blurb:'The pair you reach for without thinking. Full-grain leather, cupsole.',
    description:'A clean, quiet silhouette in full-grain leather over a stitched cupsole. Padded collar, cork-blend footbed and a rubber outsole that grips in the wet. They look better scuffed.',
    details:['Full-grain leather upper','Stitched cupsole construction','Cork-blend footbed','Runs true to size'],
    prefix:'ELT', options:[SZ(SHOE_SIZES),COL(['White','Black','Ecru'])], price:98, compareAt:120, outOfStock:['EU 40 / White','EU 46 / Black'], lowStock:['EU 44 / Ecru'], defaultStock:7 }),
  product({ id:'canvas-court', name:'Canvas Court Sneaker', brand:B, category:'sneakers', categoryLabel:'Sneakers', tags:['footwear'], rating:4.6, reviews:128, badge:null,
    images:[IMG('photo-1560769629-975ec94e6a86'),IMG('photo-1595950653106-6c9ebd614d3a'),IMG('photo-1552346154-21d32810aba3')],
    blurb:'Heavyweight organic canvas on a vulcanised sole.',
    description:'A court-inspired shape in 14oz organic canvas, vulcanised to a gum sole. No logos, no noise — just a properly built summer shoe.',
    details:['14oz organic cotton canvas','Vulcanised rubber sole','Recycled laces','Runs true to size'],
    prefix:'CCS', options:[SZ(SHOE_SIZES),COL(['Ecru','Navy','Forest'])], price:78, outOfStock:['EU 40 / Navy','EU 46 / Ecru','EU 42 / Forest'], lowStock:['EU 44 / Navy'] }),
  product({ id:'chelsea-boot', name:'Chelsea Boot', brand:B, category:'boots', categoryLabel:'Boots', tags:['best','footwear'], rating:4.8, reviews:221, badge:'Bestseller',
    images:[IMG('photo-1520639888713-7851133b1ed0'),IMG('photo-1543163521-1bf539c55dd2'),IMG('photo-1608256246200-53e635b5b65f')],
    blurb:'Goodyear-welted leather Chelsea on a commando sole.',
    description:'A proper Chelsea: full-grain leather, elasticated gussets and a Goodyear welt that can be resoled again and again. The commando sole handles a wet pavement without looking like a work boot.',
    details:['Goodyear-welted construction','Full-grain leather upper','Commando rubber sole','Half sizes available on request'],
    prefix:'CHB', options:[SZ(SHOE_SIZES),COL(['Black','Tan'])], price:185, compareAt:220, outOfStock:['EU 40 / Tan','EU 46 / Black'], lowStock:['EU 44 / Tan'] }),
  product({ id:'service-boot', name:'Service Boot', brand:B, category:'boots', categoryLabel:'Boots', tags:['new','footwear'], rating:4.7, reviews:64, badge:'New',
    images:[IMG('photo-1543163521-1bf539c55dd2'),IMG('photo-1520639888713-7851133b1ed0'),IMG('photo-1608256246200-53e635b5b65f')],
    blurb:'A lace-up boot with a storm welt and a cork midsole.',
    description:'Chrome-free leather, a storm welt and a cork midsole that moulds to your foot over the first few weeks. Built to be resoled, not replaced.',
    details:['Chrome-free tanned leather','Storm welt, cork midsole','Rubber lug outsole','Size up half a size for thick socks'],
    prefix:'SVB', options:[SZ(SHOE_SIZES),COL(['Brown','Black'])], price:210, compareAt:null, outOfStock:['EU 40 / Black'], lowStock:['EU 43 / Brown'] }),
  product({ id:'leather-slide', name:'Leather Slide', brand:B, category:'sandals', categoryLabel:'Sandals', tags:['footwear'], rating:4.5, reviews:57, badge:null,
    images:[IMG('photo-1560343090-f0409e92791a'),IMG('photo-1552346154-21d32810aba3'),IMG('photo-1521369909029-2afed882baee')],
    blurb:'Vegetable-tanned leather on a moulded cork footbed.',
    description:'An easy slide with a wide strap and a contoured cork footbed. The leather darkens with wear; the sole is a soft natural rubber.',
    details:['Vegetable-tanned leather','Moulded cork footbed','Natural rubber sole','Runs true to size'],
    prefix:'LSL', options:[SZ(SHOE_SIZES),COL(['Tan','Black'])], price:72, compareAt:88, outOfStock:['EU 46 / Tan'], lowStock:['EU 41 / Black'] }),
  product({ id:'trail-sandal', name:'Trail Sandal', brand:B, category:'sandals', categoryLabel:'Sandals', tags:['new','footwear'], rating:4.6, reviews:39, badge:'New',
    images:[IMG('photo-1560343090-f0409e92791a'),IMG('photo-1600185365483-26d7a4cc7519'),IMG('photo-1552346154-21d32810aba3')],
    blurb:'Adjustable webbing straps and a grippy lugged sole.',
    description:'Three-point adjustable webbing, quick-dry lining and a Vibram sole. Made for river crossings and city streets alike.',
    details:['Recycled webbing straps','Quick-dry lining','Vibram® sole','Half sizes: size up'],
    prefix:'TSN', options:[SZ(SHOE_SIZES),COL(['Slate','Sand'])], price:88, outOfStock:['EU 40 / Slate'], lowStock:['EU 45 / Sand'] }),
  product({ id:'merino-crew', name:'Merino Crew Sweater', brand:B, category:'knitwear', categoryLabel:'Knitwear', tags:['best','apparel'], rating:4.9, reviews:312, badge:'Bestseller',
    images:[IMG('photo-1596755094514-f87e34085b2c'),IMG('photo-1592878904946-b3cd8ae243d0'),IMG('photo-1489987707025-afc232f7ea0f')],
    blurb:'Fine-gauge extra-fine merino. Warm, breathable, never itchy.',
    description:'Knitted in a small mill in northern Portugal from extra-fine merino, with a clean crew neck and a slightly relaxed body. It layers under a jacket and holds its shape after a wash.',
    details:['100% extra-fine merino wool','Knitted in Portugal','Machine wash cold, dry flat','Relaxed fit — size down for a closer cut'],
    prefix:'MCS', options:[SZ(TOP_SIZES),COL(['Forest','Oat','Navy'])], price:128, compareAt:158, outOfStock:['XS / Oat','XXL / Forest'], lowStock:['XL / Navy'], defaultStock:5 }),
  product({ id:'lambswool-cable', name:'Lambswool Cable Knit', brand:B, category:'knitwear', categoryLabel:'Knitwear', tags:['new','apparel'], rating:4.7, reviews:88, badge:'New',
    images:[IMG('photo-1592878904946-b3cd8ae243d0'),IMG('photo-1596755094514-f87e34085b2c'),IMG('photo-1489987707025-afc232f7ea0f')],
    blurb:'A chunky cable knit in Scottish lambswool.',
    description:'A traditional fisherman cable in soft, springy lambswool spun in the Scottish Borders. Heavy enough for a proper winter; roomy enough to layer.',
    details:['100% lambswool','Spun in Scotland, knitted in Portugal','Hand wash or wool cycle','Generous fit'],
    prefix:'LCK', options:[SZ(TOP_SIZES),COL(['Cream','Olive','Charcoal'])], price:148, compareAt:null, outOfStock:['XS / Olive'], lowStock:['M / Cream'], defaultStock:4 }),
  product({ id:'merino-turtleneck', name:'Merino Turtleneck', brand:B, category:'knitwear', categoryLabel:'Knitwear', tags:['apparel'], rating:4.8, reviews:101, badge:null,
    images:[IMG('photo-1489987707025-afc232f7ea0f'),IMG('photo-1596755094514-f87e34085b2c'),IMG('photo-1592878904946-b3cd8ae243d0')],
    blurb:'A slim, fine-gauge roll neck for under a jacket.',
    description:'A close-fitting roll neck knitted from the same extra-fine merino as our crew. Thin enough for layering, warm enough on its own.',
    details:['100% extra-fine merino','Fine 14-gauge knit','Machine wash cold','Slim fit'],
    prefix:'MTN', options:[SZ(TOP_SIZES),COL(['Black','Oat','Rust'])], price:118, compareAt:138, outOfStock:['XXL / Rust'], lowStock:['S / Black'] }),
  product({ id:'heavyweight-tee', name:'Heavyweight Tee', brand:B, category:'shirts', categoryLabel:'Shirts & Tees', tags:['best','apparel'], rating:4.8, reviews:402, badge:'Bestseller',
    images:[IMG('photo-1521572163474-6864f9cf17ab'),IMG('photo-1576566588028-4147f3842f27'),IMG('photo-1583743814966-8936f5b7be1a')],
    blurb:'240gsm organic cotton, boxy fit, ribbed collar.',
    description:'A proper heavyweight tee: 240gsm organic cotton, a boxy body and a ribbed collar that will not stretch out. Garment-dyed in small batches so the colour fades beautifully.',
    details:['240gsm organic cotton','Garment-dyed in small batches','Boxy fit','Pre-shrunk'],
    prefix:'HWT', options:[SZ(TOP_SIZES),COL(['White','Black','Sand','Forest'])], price:48, compareAt:58, outOfStock:['XS / Black','XXL / White'], lowStock:['L / Forest'], defaultStock:9 }),
  product({ id:'oxford-shirt', name:'Oxford Shirt', brand:B, category:'shirts', categoryLabel:'Shirts & Tees', tags:['apparel'], rating:4.7, reviews:96, badge:null,
    images:[IMG('photo-1576566588028-4147f3842f27'),IMG('photo-1521572163474-6864f9cf17ab'),IMG('photo-1583743814966-8936f5b7be1a')],
    blurb:'Washed organic-cotton oxford with a soft button-down collar.',
    description:'A relaxed oxford that gets softer every wash. Mother-of-pearl-effect buttons, a single chest pocket and a gently curved hem.',
    details:['Organic cotton oxford','Button-down collar','Garment-washed','Regular fit'],
    prefix:'OXS', options:[SZ(TOP_SIZES),COL(['Blue','White'])], price:84, compareAt:null, outOfStock:['XS / Blue'], lowStock:['XL / White'] }),
  product({ id:'waxed-jacket', name:'Waxed Field Jacket', brand:B, category:'outerwear', categoryLabel:'Outerwear', tags:['best','apparel'], rating:4.9, reviews:176, badge:'Bestseller',
    images:[IMG('photo-1551028719-00167b16eac5'),IMG('photo-1591047139829-d91aecb6caea'),IMG('photo-1544022613-e87ca75a784a')],
    blurb:'British waxed cotton, corduroy collar, four pockets.',
    description:'Waxed cotton from a Lancashire mill, cut as a classic field jacket with a corduroy collar and a storm flap. Re-wax it every couple of years and it will outlast you.',
    details:['Waxed cotton shell','Corduroy collar','Four patch pockets','Re-waxing tin sold separately'],
    prefix:'WXJ', options:[SZ(TOP_SIZES),COL(['Olive','Navy'])], price:238, compareAt:268, outOfStock:['XS / Navy'], lowStock:['XXL / Olive'], defaultStock:3 }),
  product({ id:'field-overshirt', name:'Field Overshirt', brand:B, category:'outerwear', categoryLabel:'Outerwear', tags:['new','apparel'], rating:4.6, reviews:52, badge:'New',
    images:[IMG('photo-1591047139829-d91aecb6caea'),IMG('photo-1551028719-00167b16eac5'),IMG('photo-1576566588028-4147f3842f27')],
    blurb:'A heavy cotton-twill overshirt that works as a light jacket.',
    description:'Brushed cotton twill with a boxy cut and two chest pockets. Wear it buttoned as a shirt or open over a tee.',
    details:['Brushed cotton twill','Two chest pockets','Shell buttons','Regular fit'],
    prefix:'FOV', options:[SZ(TOP_SIZES),COL(['Rust','Olive','Navy'])], price:112, compareAt:null, outOfStock:['XS / Rust'], lowStock:['L / Navy'] }),
  product({ id:'selvedge-denim', name:'Selvedge Denim', brand:B, category:'trousers', categoryLabel:'Denim & Trousers', tags:['best','apparel'], rating:4.8, reviews:264, badge:'Bestseller',
    images:[IMG('photo-1542272604-787c3835535d'),IMG('photo-1544022613-e87ca75a784a'),IMG('photo-1594633312681-425c7b97ccd1')],
    blurb:'14oz Japanese selvedge, straight leg, raw or rinse.',
    description:'Woven on shuttle looms in Okayama and cut straight through the leg with a mid rise. Raw will fade to your shape in a few months; rinse is already soft.',
    details:['14oz Japanese selvedge denim','Straight leg, mid rise','Chain-stitched hem','Raw or one-wash rinse'],
    prefix:'SEL', options:[{name:'Waist',kind:'size',values:WAISTS},{name:'Inseam',kind:'size',values:INSEAMS},COL(['Indigo','Rinse'])],
    price:c=>c.Inseam==='34'?150:145, outOfStock:['28 / 34 / Indigo','38 / 30 / Rinse','30 / 34 / Rinse'], lowStock:['32 / 32 / Indigo'], defaultStock:4 }),
  product({ id:'pleated-chino', name:'Pleated Chino', brand:B, category:'trousers', categoryLabel:'Denim & Trousers', tags:['new','apparel'], rating:4.6, reviews:73, badge:'New',
    images:[IMG('photo-1594633312681-425c7b97ccd1'),IMG('photo-1542272604-787c3835535d'),IMG('photo-1544022613-e87ca75a784a')],
    blurb:'A single-pleat chino in garment-washed cotton twill.',
    description:'A relaxed single-pleat chino with a tapered leg and side adjusters. Garment-washed, so there is no break-in period.',
    details:['Cotton twill','Single pleat, tapered leg','Side adjusters','Garment-washed'],
    prefix:'PLC', options:[{name:'Waist',kind:'size',values:WAISTS},{name:'Inseam',kind:'size',values:INSEAMS},COL(['Sand','Olive'])],
    price:96, compareAt:118, outOfStock:['28 / 34 / Sand'], lowStock:['34 / 32 / Olive'] }),
  product({ id:'leather-belt', name:'Leather Belt', brand:B, category:'accessories', categoryLabel:'Accessories', tags:['accessories'], rating:4.7, reviews:81, badge:null,
    images:[IMG('photo-1553062407-98eeb64c6a62'),IMG('photo-1548036328-c9fa89d128fa'),IMG('photo-1553062407-98eeb64c6a62')],
    blurb:'Full-grain bridle leather with a solid brass buckle.',
    description:'Cut from a single strip of bridle leather and finished with a solid brass buckle. The edges are burnished by hand.',
    details:['Full-grain bridle leather','Solid brass buckle','35mm width','Choose your usual waist size'],
    prefix:'LBT', options:[{name:'Size',kind:'size',values:['S (30-32)','M (34-36)','L (38-40)']},COL(['Black','Brown'])], price:58, outOfStock:['L (38-40) / Black'], lowStock:[] }),
  product({ id:'merino-beanie', name:'Merino Beanie', brand:B, category:'accessories', categoryLabel:'Accessories', tags:['accessories'], rating:4.8, reviews:140, badge:null,
    images:[IMG('photo-1576871337622-98d48d1cf531'),IMG('photo-1553062407-98eeb64c6a62'),IMG('photo-1596755094514-f87e34085b2c')],
    blurb:'A ribbed beanie in the same merino as our knitwear.',
    description:'A ribbed, double-layered beanie that stays put and stays soft. One size fits most.',
    details:['100% extra-fine merino','Double-layer rib','One size','Machine wash cold'],
    prefix:'MBN', options:[COL(['Forest','Oat','Black','Rust'])], price:34, compareAt:42, outOfStock:[], lowStock:['Rust'], defaultStock:12 }),
  product({ id:'canvas-tote', name:'Canvas Tote', brand:B, category:'accessories', categoryLabel:'Accessories', tags:['accessories','new'], rating:4.5, reviews:47, badge:'New',
    images:[IMG('photo-1544816155-12df9643f363'),IMG('photo-1553062407-98eeb64c6a62'),IMG('photo-1548036328-c9fa89d128fa')],
    blurb:'A sturdy 18oz canvas tote with leather handles.',
    description:'Heavy canvas with an inner zip pocket and leather handles that darken with use. Carries a laptop and a loaf of bread.',
    details:['18oz organic canvas','Leather handles','Inner zip pocket','38 × 40 × 12cm'],
    prefix:'CTT', options:[COL(['Ecru','Forest','Black'])], price:62, outOfStock:[], lowStock:['Black'], defaultStock:8 })
];

const CATEGORIES = [
  { id:'sneakers',    name:'Sneakers',         image: IMG('photo-1595950653106-6c9ebd614d3a',400,400) },
  { id:'boots',       name:'Boots',            image: IMG('photo-1520639888713-7851133b1ed0',400,400) },
  { id:'sandals',     name:'Sandals',          image: IMG('photo-1560343090-f0409e92791a',400,400) },
  { id:'knitwear',    name:'Knitwear',         image: IMG('photo-1596755094514-f87e34085b2c',400,400) },
  { id:'shirts',      name:'Shirts & Tees',    image: IMG('photo-1521572163474-6864f9cf17ab',400,400) },
  { id:'outerwear',   name:'Outerwear',        image: IMG('photo-1551028719-00167b16eac5',400,400) },
  { id:'trousers',    name:'Denim & Trousers', image: IMG('photo-1542272604-787c3835535d',400,400) },
  { id:'accessories', name:'Accessories',      image: IMG('photo-1553062407-98eeb64c6a62',400,400) }
].map(c => ({ ...c, count: PRODUCTS.filter(p => p.category === c.id).length }));

const SECTIONS = [
  { id:'best-sellers', tag:'best',        title:'Best sellers', desc:'The pieces our customers come back for.' },
  { id:'new-arrivals', tag:'new',         title:'New arrivals', desc:'Just landed — small runs, once they are gone they are gone.' },
  { id:'footwear',     tag:'footwear',    title:'Footwear',     desc:'Sneakers, boots and sandals built on real soles.' },
  { id:'apparel',      tag:'apparel',     title:'Apparel',      desc:'Layers and staples cut for everyday wear.' },
  { id:'accessories',  tag:'accessories', title:'Accessories',  desc:'The finishing details.' }
];

const HERO_SLIDES = [
  { eyebrow:'New season edit', title:'Built to be worn, not replaced.', body:'Considered footwear made in small runs, from materials that age well.',
    primary:{label:'Shop footwear',href:'shop.html?category=sneakers'}, secondary:{label:'Explore boots',href:'shop.html?category=boots'} },
  { eyebrow:'Winter layers', title:'Knitwear that earns its keep.', body:'Extra-fine merino and lambswool, knitted in a small mill in northern Portugal.',
    primary:{label:'Shop knitwear',href:'shop.html?category=knitwear'}, secondary:{label:'See new arrivals',href:'shop.html?tag=new'} },
  { eyebrow:'The denim room', title:'Selvedge denim, cut straight.', body:'14oz Japanese selvedge on shuttle looms, finished with a chain-stitched hem.',
    primary:{label:'Shop denim',href:'shop.html?category=trousers'}, secondary:{label:'Browse everything',href:'shop.html'} }
];
const HERO_PNGS = [
  'https://pngimg.com/uploads/running_shoes/running_shoes_PNG5816.png','https://pngimg.com/uploads/running_shoes/running_shoes_PNG5823.png',
  'https://pngimg.com/uploads/running_shoes/running_shoes_PNG5820.png','https://pngimg.com/uploads/running_shoes/running_shoes_PNG5815.png',
  'https://pngimg.com/uploads/running_shoes/running_shoes_PNG5821.png','https://pngimg.com/uploads/running_shoes/running_shoes_PNG5819.png'
];
const REVIEWS = [
  { name:'Amara Okafor', initials:'AO', meta:'Verified buyer · Portland', stars:5, quote:'The low-tops have done two years of daily wear and still look sharp — I bought a second pair in black.' },
  { name:'Daniel Reyes', initials:'DR', meta:'Verified buyer · Austin', stars:5, quote:'Sizing guide was spot on and the merino crew has not pilled once. The exchange I needed was free and arrived in three days.' },
  { name:'Priya Raman', initials:'PR', meta:'Verified buyer · Chicago', stars:4, quote:'The waxed jacket smells like a proper workshop and has handled a full winter. Worth every penny.' }
];
const JOURNAL = [
  { slug:'how-to-care-for-leather', title:'How to care for full-grain leather', date:'October 14, 2026', tag:'Care', read:'5 min', image:IMG('photo-1520639888713-7851133b1ed0',1200,800),
    excerpt:'Four habits that will keep boots and sneakers looking better with age.',
    body:['Good leather is meant to age. The goal of care is not to keep it looking new — it is to keep it supple, protected and looking like yours.','Brush it after wearing. A horsehair brush removes grit that would otherwise act like sandpaper in the creases. Thirty seconds is enough.','Condition twice a season. A small amount of neutral cream, worked in with a soft cloth, replaces the oils that dry out in cold weather. Less is more: too much clogs the pores.','Let it rest. Rotate pairs so each one dries fully for 24 hours, and use cedar shoe trees to hold the shape.','Resole instead of replace. Our Goodyear-welted boots can be resoled several times; contact us and we will point you to a cobbler near you.'] },
  { slug:'inside-the-portuguese-mill', title:'Inside the mill that knits our merino', date:'September 29, 2026', tag:'Makers', read:'6 min', image:IMG('photo-1596755094514-f87e34085b2c',1200,800),
    excerpt:'A day with the family-run mill in northern Portugal that has been knitting wool for three generations.',
    body:['The mill sits at the end of a narrow road outside Guimarães. It has 31 machines, three generations of the same family, and a waiting list of other brands.','We visited in the spring to watch our merino crew come off the machines. Each panel is knitted to shape, which means almost no offcuts — and a sweater that holds its form wash after wash.','The yarn is spun in Italy from extra-fine merino sourced from a certified farm group in Patagonia. We know the farms, the spinner and the knitters by name; you will find all of them on our Factories page.','We order small runs and re-order only what sells. It is slower than the industry standard, but it means almost nothing ends up on a clearance rack.'] },
  { slug:'a-capsule-wardrobe-in-nine-pieces', title:'A capsule wardrobe in nine pieces', date:'September 8, 2026', tag:'Style', read:'4 min', image:IMG('photo-1434389677669-e08b4cac3105',1200,800),
    excerpt:'Nine things that make thirty outfits — and why we named the studio after the number.',
    body:['Our name started as a joke about a nine-piece wardrobe, and it stuck. The idea is simple: fewer, better things that work together.','Start with footwear: one leather sneaker and one boot. Add a tee, an oxford and a merino crew. Then trousers — one denim, one chino — and one outer layer.','Choose a restrained palette: forest, oat, navy, black. Everything goes with everything, which is the whole point.','Nine pieces will not cover every occasion, but they cover most days. Add things only when you notice a gap.'] },
  { slug:'denim-break-in-guide', title:'The raw denim break-in guide', date:'August 19, 2026', tag:'Care', read:'3 min', image:IMG('photo-1542272604-787c3835535d',1200,800),
    excerpt:'Wash early, wash late, or never? An honest guide for your first pair.',
    body:['Raw denim is unwashed and unfinished, so it is stiff at first. That stiffness is what gives it character as it fades to your shape.','Our advice: wear them as much as you can for the first three months. Then give them a cold, inside-out wash and hang them dry.','If you hate the stiffness, buy the rinse. It is pre-softened and still has the same selvedge, just without the break-in.','Whatever you pick, avoid the tumble dryer. It is the one thing that will ruin a good pair of jeans.'] }
];
const FAQ = [
  ['How long does delivery take?','Orders are dispatched within 24 hours from Portland. Standard delivery takes 2–4 working days within the US; express takes 1–2.'],
  ['What is your returns policy?','Unworn items with tags attached can be returned within 60 days. Exchanges are always free.'],
  ['Do you ship internationally?','Not yet. We are US-only for now and working on Canada and the UK.'],
  ['How do I care for my knitwear?','Wash cold on a wool cycle and dry flat. Avoid hanging wet knitwear, which stretches the shoulders.'],
  ['Can my boots be resoled?','Yes — our welted boots are built to be resoled. Contact us for recommended cobblers.']
];
