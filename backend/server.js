const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const multer   = require('multer');
const { v4: uuidv4 } = require('uuid');
const path     = require('path');
const fs       = require('fs');

const app        = express();
app.set('trust proxy', true);
const PORT       = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sasa_boutique_secret_2024';

/* ── Middleware ── */
app.use(cors({
  origin: (origin, cb) => {
    const allowed = [
      'http://localhost:3000','http://localhost:5173',
      'https://sasa-boutique.netlify.app',
      /\.vercel\.app$/,/\.onrender\.com$/,/\.railway\.app$/,/sasa-boutique\.netlify\.app$/
    ];
    if (!origin) return cb(null, true);
    cb(allowed.some(a => typeof a==='string'?a===origin:a.test(origin))?null:new Error('CORS'),true);
  },
  credentials: true
}));
app.use(express.json());
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
app.use('/uploads', express.static('uploads'));

/* ── Multer ── */
const storage = multer.diskStorage({
  destination: (_,__,cb) => cb(null,'uploads/'),
  filename:    (_,file,cb) => cb(null,`${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits:{ fileSize:5*1024*1024 }});

/* ══════════════════════════════════════════════════
   FILE-BASED DATABASE (persists across restarts)
   ══════════════════════════════════════════════════ */
const DB_FILE = path.join(
  process.env.RAILWAY_VOLUME_MOUNT_PATH || '/app/data',
  'db.json'
);

if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

const DEFAULT_DB = {
  users: [
    { id:'admin-001', name:'Admin', email:'sasa@sasaboutique.com',
      password: bcrypt.hashSync('sasab1992',10), role:'admin',
      avatar:null, createdAt: new Date().toISOString() }
  ],
  categories: [
    { id:'clothes',    nameEn:'Clothes',    nameAr:'الملابس',    image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80', types:['Dress','Blouse','Skirt','Abaya','Jacket','Pants','Top'], order:1 },
    { id:'shoes',      nameEn:'Shoes',      nameAr:'أحذية',      image:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80', types:['Heels','Sneakers','Flats','Boots','Sandals','Loafers'], order:2 },
    { id:'bags',       nameEn:'Bags',       nameAr:'الحقائب',    image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', types:['Crossbody','Tote','Clutch','Backpack','Shoulder Bag','Mini Bag'], order:3 },
    { id:'foundation', nameEn:'Beauty',     nameAr:'التجميل',    image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80', types:['Foundation','Blush','BB Cream','Concealer','Primer','Setting Powder'], order:4 },
    { id:'other',      nameEn:'Lifestyle',  nameAr:'الإكسسوارات',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', types:['Accessories','Electronics','Fragrance','Home','Sports'], order:5 },
  ],
  products: [],
  orders: [],
  pendingPayments: {},
};

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const saved = JSON.parse(raw);
      return { ...DEFAULT_DB, ...saved };
    }
  } catch (e) { console.error('Failed to load db:', e); }
  return { ...DEFAULT_DB };
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) { console.error('Failed to save db:', e); }
}

let db = loadDb();

const PUBLIC_URL = process.env.PUBLIC_URL || '';

const resolveImage = (image, req) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  const proto = (req?.headers['x-forwarded-proto'] || req?.protocol || 'http').split(',')[0].trim();
  const host  = req?.headers['x-forwarded-host']  || req?.get('host');
  return `${proto}://${host}${image}`;
};

/* ══════════════════════════════════════════════════
   AUTH MIDDLEWARE
   ══════════════════════════════════════════════════ */
const auth = (req,res,next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error:'No token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error:'Invalid token' }); }
};
const adminOnly = (req,res,next) =>
  req.user?.role==='admin' ? next() : res.status(403).json({ error:'Admin only' });

/* ══════════════════════════════════════════════════
   AUTH ROUTES
══════════════════════════════════════════════════ */
app.post('/api/auth/register', async (req,res) => {
  const { name, email, password } = req.body;
  if (!name||!email||!password) return res.status(400).json({ error:'All fields required' });
  if (db.users.find(u=>u.email===email)) return res.status(400).json({ error:'Email already exists' });
  const hashed = await bcrypt.hash(password,10);
  const user = { id:uuidv4(), name, email, password:hashed, role:'customer', avatar:null, createdAt:new Date().toISOString() };
  db.users.push(user);
  saveDb();
  const token = jwt.sign({ id:user.id, email, role:'customer', name }, JWT_SECRET, { expiresIn:'7d' });
  res.json({ token, user:{ id:user.id, name, email, role:'customer', avatar:null } });
});

app.post('/api/auth/login', async (req,res) => {
  const { email, password } = req.body;
  const user = db.users.find(u=>u.email===email);
  if (!user||!(await bcrypt.compare(password,user.password)))
    return res.status(400).json({ error:'Invalid credentials' });
  const token = jwt.sign({ id:user.id, email, role:user.role, name:user.name }, JWT_SECRET, { expiresIn:'7d' });
  res.json({ token, user:{ id:user.id, name:user.name, email, role:user.role, avatar:user.avatar } });
});

/* ── Update own profile ── */
app.put('/api/auth/profile', auth, upload.single('avatar'), async (req,res) => {
  const idx = db.users.findIndex(u=>u.id===req.user.id);
  if (idx===-1) return res.status(404).json({ error:'User not found' });
  const { name, currentPassword, newPassword } = req.body;
  if (currentPassword && newPassword) {
    if (!(await bcrypt.compare(currentPassword, db.users[idx].password)))
      return res.status(400).json({ error:'Wrong current password' });
    db.users[idx].password = await bcrypt.hash(newPassword,10);
  }
  if (name) db.users[idx].name = name;
  if (req.file) db.users[idx].avatar = `/uploads/${req.file.filename}`;
  const u = db.users[idx];
  const token = jwt.sign({ id:u.id, email:u.email, role:u.role, name:u.name }, JWT_SECRET, { expiresIn:'7d' });
  saveDb();
  res.json({ token, user:{ id:u.id, name:u.name, email:u.email, role:u.role, avatar:u.avatar } });
});

/* ══════════════════════════════════════════════════
   CATEGORY ROUTES  (dynamic — admin can CRUD)
══════════════════════════════════════════════════ */
app.get('/api/categories', (_,res) =>
  res.json(db.categories.sort((a,b)=>a.order-b.order))
);

app.post('/api/categories', auth, adminOnly, upload.single('image'), (req,res) => {
  const { nameEn, nameAr, types, order } = req.body;
  if (!nameEn) return res.status(400).json({ error:'nameEn required' });
  const id = nameEn.toLowerCase().replace(/\s+/g,'-');
  if (db.categories.find(c=>c.id===id)) return res.status(400).json({ error:'Category exists' });
  const cat = {
    id, nameEn, nameAr: nameAr||nameEn,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    types: types ? JSON.parse(types) : [],
    order: order ? Number(order) : db.categories.length+1,
  };
  db.categories.push(cat);
  saveDb();
  res.status(201).json(cat);
});

app.put('/api/categories/:id', auth, adminOnly, upload.single('image'), (req,res) => {
  const idx = db.categories.findIndex(c=>c.id===req.params.id);
  if (idx===-1) return res.status(404).json({ error:'Not found' });
  const { nameEn, nameAr, types, order } = req.body;
  if (nameEn) db.categories[idx].nameEn = nameEn;
  if (nameAr) db.categories[idx].nameAr = nameAr;
  if (types)  db.categories[idx].types  = JSON.parse(types);
  if (order)  db.categories[idx].order  = Number(order);
  if (req.file) db.categories[idx].image = `/uploads/${req.file.filename}`;
  saveDb();
  res.json(db.categories[idx]);
});

app.delete('/api/categories/:id', auth, adminOnly, (req,res) => {
  const idx = db.categories.findIndex(c=>c.id===req.params.id);
  if (idx===-1) return res.status(404).json({ error:'Not found' });
  db.categories.splice(idx,1);
  saveDb();
  res.json({ message:'Deleted' });
});

/* ══════════════════════════════════════════════════
   PRODUCT ROUTES
══════════════════════════════════════════════════ */
app.get('/api/products', (req,res) => {
  const { category, type, minPrice, maxPrice, search, featured, sort } = req.query;
  let products = [...db.products];
  if (category && category!=='all') products = products.filter(p=>p.category===category);
  if (type)     products = products.filter(p=>p.type.toLowerCase()===type.toLowerCase());
  if (minPrice) products = products.filter(p=>p.price>=Number(minPrice));
  if (maxPrice) products = products.filter(p=>p.price<=Number(maxPrice));
  if (search)   products = products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.description.toLowerCase().includes(search.toLowerCase()));
  if (featured==='true') products = products.filter(p=>p.featured);
  if (sort==='price_asc')  products.sort((a,b)=>a.price-b.price);
  else if (sort==='price_desc') products.sort((a,b)=>b.price-a.price);
  else if (sort==='newest') products.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  res.json(products.map(p => ({ ...p, image: resolveImage(p.image, req) })));
});

app.get('/api/products/:id', (req,res) => {
  const p = db.products.find(p=>p.id===req.params.id);
  if (!p) return res.status(404).json({ error:'Not found' });
  res.json({ ...p, image: resolveImage(p.image, req) });
});

app.post('/api/products', auth, adminOnly, upload.single('image'), (req,res) => {
  const { name, category, type, price, originalPrice, quantity, sizes, colors, description, featured } = req.body;
  const product = {
    id:uuidv4(), name, category, type,
    price:Number(price), originalPrice:originalPrice?Number(originalPrice):null,
    quantity:Number(quantity),
    sizes: sizes?JSON.parse(sizes):[],
    colors: colors?JSON.parse(colors):[],
    image: req.file?`/uploads/${req.file.filename}`:null,
    description, featured:featured==='true',
    createdAt:new Date().toISOString()
  };
  db.products.push(product);
  saveDb();
  res.status(201).json({ ...product, image: resolveImage(product.image, req) });
});

app.put('/api/products/:id', auth, adminOnly, upload.single('image'), (req,res) => {
  const idx = db.products.findIndex(p=>p.id===req.params.id);
  if (idx===-1) return res.status(404).json({ error:'Not found' });
  const { name, category, type, price, originalPrice, quantity, sizes, colors, description, featured } = req.body;
  const p = db.products[idx];
  db.products[idx] = {
    ...p,
    ...(name&&{name}), ...(category&&{category}), ...(type&&{type}),
    ...(price&&{price:Number(price)}),
    originalPrice: originalPrice?Number(originalPrice):null,
    ...(quantity&&{quantity:Number(quantity)}),
    ...(sizes&&{sizes:JSON.parse(sizes)}),
    ...(colors&&{colors:JSON.parse(colors)}),
    ...(description&&{description}),
    featured: featured==='true',
    ...(req.file&&{image:`/uploads/${req.file.filename}`}),
  };
  saveDb();
  res.json({ ...db.products[idx], image: resolveImage(db.products[idx].image, req) });
});

app.delete('/api/products/:id', auth, adminOnly, (req,res) => {
  const idx = db.products.findIndex(p=>p.id===req.params.id);
  if (idx===-1) return res.status(404).json({ error:'Not found' });
  db.products.splice(idx,1);
  saveDb();
  res.json({ message:'Deleted' });
});

/* ══════════════════════════════════════════════════
   ORDER ROUTES
   ══════════════════════════════════════════════════ */
app.get('/api/orders', auth, adminOnly, (_,res) =>
  res.json(db.orders.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)))
);
app.get('/api/orders/user', (req,res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error:'Email required' });
  res.json(db.orders.filter(o=>o.customer?.email===email).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));
});
app.get('/api/orders/:id', (req,res) => {
  const o = db.orders.find(o=>o.id===req.params.id);
  if (!o) return res.status(404).json({ error:'Not found' });
  res.json(o);
});
app.put('/api/orders/:id/status', auth, adminOnly, (req,res) => {
  const { status, paymentStatus } = req.body;
  const idx = db.orders.findIndex(o=>o.id===req.params.id);
  if (idx===-1) return res.status(404).json({ error:'Not found' });
  if (status) db.orders[idx].status = status;
  if (paymentStatus) db.orders[idx].paymentStatus = paymentStatus;
  db.orders[idx].updatedAt = new Date().toISOString();
  saveDb();
  res.json(db.orders[idx]);
});

/* Direct order creation (no payment) */
app.post('/api/orders/direct', async (req,res) => {
  const { items, customer, deliveryAddress } = req.body;
  if (!items?.length || !customer?.name || !customer?.phone)
    return res.status(400).json({ error:'Please provide items and contact details' });

  // Validate stock
  for (const item of items) {
    const p = db.products.find(p=>p.id===item.productId);
    if (!p) return res.status(400).json({ error:`Product not found: ${item.productId}` });
    if (p.quantity < item.quantity) return res.status(400).json({ error:`Not enough stock for ${p.name}` });
  }

  const total = items.reduce((s,i)=>{
    const p = db.products.find(pr=>pr.id===i.productId);
    return s + (p?.price||0) * i.quantity;
  }, 0);
  const deliveryFee = total >= 100000 ? 0 : 5000;
  const orderId = `ORD-${Date.now()}`;

  // Deduct stock
  for (const item of items) {
    const idx = db.products.findIndex(pr=>pr.id===item.productId);
    if (idx !== -1) db.products[idx].quantity -= item.quantity;
  }

  const order = {
    id: orderId,
    items,
    customer,
    deliveryAddress,
    total: total + deliveryFee,
    subtotal: total,
    deliveryFee,
    status: 'pending',
    paymentMethod: 'whatsapp',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.orders.push(order);
  saveDb();

  res.status(201).json({ ...order, whatsappUrl: buildWhatsAppUrl(customer.phone, order) });
});

function buildWhatsAppUrl(customerPhone, order) {
  const ADMIN_PHONE = '9647733440545';
  const lines = [
    `*طلب جديد: ${order.id}*`,
    `العميل: ${order.customer.name}`,
    `الهاتف: ${order.customer.phone}`,
    `البريد: ${order.customer.email || 'غير متوفر'}`,
    `العنوان: ${order.deliveryAddress}`,
    ``,
    `المنتجات:`,
    ...order.items.map((item,i) => {
      const p = db.products.find(pr=>pr.id===item.productId);
      return `${i+1}. ${item.name} ×${item.quantity} = ${((p?.price||0)*item.quantity).toLocaleString()} دينار`;
    }),
    ``,
    `المجموع الفرعي: ${order.subtotal?.toLocaleString()} دينار`,
    `رسوم التوصيل: ${order.deliveryFee===0 ? 'مجاني' : order.deliveryFee.toLocaleString()+' دينار'}`,
    `الإجمالي: ${order.total?.toLocaleString()} دينار`,
    ``,
    `يرجى تأكيد التوفر وموعد التوصيل.`,
  ];

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${ADMIN_PHONE}?text=${text}`;
}

/* ══════════════════════════════════════════════════
   CUSTOMERS & ADMIN STATS
══════════════════════════════════════════════════ */
app.get('/api/customers', auth, adminOnly, (_,res) => {
  const customers = db.users.filter(u=>u.role==='customer').map(u => {
    const userOrders = db.orders.filter(o=>o.customer?.email===u.email);
    return { id:u.id, name:u.name, email:u.email, avatar:u.avatar,
      orders:userOrders.length,
      totalSpent:userOrders.reduce((acc,o)=>acc+o.total,0),
      createdAt:u.createdAt };
  });
  res.json(customers);
});

app.get('/api/admin/stats', auth, adminOnly, (_,res) => {
  const totalRevenue = db.orders.reduce((acc,o)=>acc+o.total,0);
  const categoryStats = db.categories.map(cat => ({
    category:cat.id, label:cat.nameEn,
    count: db.products.filter(p=>p.category===cat.id).length,
    revenue: db.orders.reduce((acc,o)=>{
      const items = o.items.filter(i=>{ const p=db.products.find(pr=>pr.id===i.productId); return p?.category===cat.id; });
      return acc+items.reduce((s,i)=>s+i.price*i.quantity,0);
    },0)
  }));
  res.json({
    totalRevenue, totalOrders:db.orders.length,
    totalProducts:db.products.length,
    totalCustomers:db.users.filter(u=>u.role==='customer').length,
    recentOrders:db.orders.slice(-5).reverse(),
    categoryStats,
  });
});

app.get('/api/health', (_,res) => res.json({ status:'ok' }));

app.listen(PORT, () => console.log(`🌸 SASA Boutique API → port ${PORT}`));

app.get("/", (req, res) => {
  res.send("SASA API is working 🚀");
});