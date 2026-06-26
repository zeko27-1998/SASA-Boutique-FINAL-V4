const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const multer   = require('multer');
const { v4: uuidv4 } = require('uuid');
const path     = require('path');
const fs       = require('fs');

const app        = express();
const PORT       = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sasa_boutique_secret_2024';

/* ── Middleware ── */
app.use(cors({
  origin: (origin, cb) => {
    const allowed = [
      'http://localhost:3000','http://localhost:5173',
      /\.vercel\.app$/,/\.onrender\.com$/
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
   IN-MEMORY DATABASE
══════════════════════════════════════════════════ */
let db = {
  users: [
    { id:'admin-001', name:'Admin', email:'admin@sasaboutique.com',
      password: bcrypt.hashSync('admin123',10), role:'admin',
      avatar:null, createdAt: new Date().toISOString() }
  ],

  /* Dynamic categories — admin can add/edit/delete */
  categories: [
    { id:'clothes',    nameEn:'Clothes',    nameAr:'الملابس',    image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80', types:['Dress','Blouse','Skirt','Abaya','Jacket','Pants','Top'], order:1 },
    { id:'shoes',      nameEn:'Shoes',      nameAr:'الأحذية',    image:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80', types:['Heels','Sneakers','Flats','Boots','Sandals','Loafers'], order:2 },
    { id:'bags',       nameEn:'Bags',       nameAr:'الحقائب',    image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', types:['Crossbody','Tote','Clutch','Backpack','Shoulder Bag','Mini Bag'], order:3 },
    { id:'foundation', nameEn:'Beauty',     nameAr:'التجميل',    image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80', types:['Foundation','Blush','BB Cream','Concealer','Primer','Setting Powder'], order:4 },
    { id:'other',      nameEn:'Lifestyle',  nameAr:'الإكسسوارات',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', types:['Accessories','Electronics','Fragrance','Home','Sports'], order:5 },
  ],

  products: [
    { id:uuidv4(), name:'Elegant Rose Dress',    category:'clothes',    type:'Dress',       price:75000,  originalPrice:90000,  quantity:15, sizes:['XS','S','M','L','XL'],         colors:['Pink','White'],        image:null, description:'A beautiful flowing rose-colored dress.', featured:true,  createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Baby Blue Blouse',       category:'clothes',    type:'Blouse',      price:35000,  originalPrice:null,   quantity:20, sizes:['S','M','L'],                   colors:['Baby Blue'],           image:null, description:'Soft and stylish baby blue blouse.',       featured:true,  createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Classic White Abaya',    category:'clothes',    type:'Abaya',       price:120000, originalPrice:null,   quantity:8,  sizes:['S','M','L','XL'],              colors:['White','Ivory'],       image:null, description:'Elegant white abaya with delicate embroidery.', featured:true, createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Floral Maxi Skirt',      category:'clothes',    type:'Skirt',       price:45000,  originalPrice:55000,  quantity:10, sizes:['XS','S','M','L','XL','XXL'],   colors:['Pink','Floral'],       image:null, description:'Gorgeous floral maxi skirt.',              featured:false, createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Pink Heeled Sandals',    category:'shoes',      type:'Heels',       price:65000,  originalPrice:80000,  quantity:12, sizes:['36','37','38','39','40','41'],  colors:['Pink'],                image:null, description:'Stunning pink heeled sandals.',            featured:true,  createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'White Sneakers',         category:'shoes',      type:'Sneakers',    price:55000,  originalPrice:null,   quantity:25, sizes:['36','37','38','39','40','41','42'], colors:['White'],           image:null, description:'Comfortable and trendy white sneakers.',   featured:false, createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Ballet Flats Rose',      category:'shoes',      type:'Flats',       price:40000,  originalPrice:50000,  quantity:18, sizes:['35','36','37','38','39','40'],  colors:['Rose','Nude'],         image:null, description:'Comfortable ballet flats.',                featured:true,  createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Mini Pink Crossbody',    category:'bags',       type:'Crossbody',   price:85000,  originalPrice:null,   quantity:7,  sizes:[],                              colors:['Pink','Dusty Pink'],   image:null, description:'Chic mini crossbody bag with gold accents.', featured:true, createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Large Tote Bag',         category:'bags',       type:'Tote',        price:95000,  originalPrice:115000, quantity:10, sizes:[],                              colors:['White','Beige'],       image:null, description:'Spacious tote bag for everyday use.',      featured:false, createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Evening Clutch',         category:'bags',       type:'Clutch',      price:60000,  originalPrice:null,   quantity:5,  sizes:[],                              colors:['Silver','Gold','Pink'], image:null, description:'Elegant evening clutch.',                 featured:true,  createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Glow Foundation SPF 30', category:'foundation', type:'Foundation',  price:45000,  originalPrice:null,   quantity:30, sizes:[],                              colors:['Ivory','Beige','Sand','Medium'], image:null, description:'Full-coverage foundation with SPF 30.', featured:true, createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Rose Blush Palette',     category:'foundation', type:'Blush',       price:30000,  originalPrice:38000,  quantity:20, sizes:[],                              colors:['Rose','Peach'],        image:null, description:'Gorgeous blush palette with 6 shades.',    featured:true,  createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Hydrating BB Cream',     category:'foundation', type:'BB Cream',    price:28000,  originalPrice:null,   quantity:25, sizes:[],                              colors:['Light','Medium','Dark'], image:null, description:'Lightweight BB cream with hydrating formula.', featured:false, createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Rose Gold Water Bottle', category:'other',      type:'Accessories', price:22000,  originalPrice:null,   quantity:40, sizes:[],                              colors:['Rose Gold'],           image:null, description:'Stylish insulated water bottle.',          featured:false, createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Wireless Earbuds Pink',  category:'other',      type:'Electronics', price:85000,  originalPrice:100000, quantity:15, sizes:[],                              colors:['Pink','White'],        image:null, description:'Premium wireless earbuds.',                featured:true,  createdAt:new Date().toISOString() },
    { id:uuidv4(), name:'Perfume - Bloom',        category:'other',      type:'Fragrance',   price:55000,  originalPrice:null,   quantity:12, sizes:['30ml','50ml','100ml'],         colors:[],                      image:null, description:'Feminine floral fragrance.',               featured:true,  createdAt:new Date().toISOString() },
  ],
  orders: [],
  pendingPayments: {},   // orderId -> { order, expiresAt }
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
  res.json(db.categories[idx]);
});

app.delete('/api/categories/:id', auth, adminOnly, (req,res) => {
  const idx = db.categories.findIndex(c=>c.id===req.params.id);
  if (idx===-1) return res.status(404).json({ error:'Not found' });
  db.categories.splice(idx,1);
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
  res.json(products);
});

app.get('/api/products/:id', (req,res) => {
  const p = db.products.find(p=>p.id===req.params.id);
  if (!p) return res.status(404).json({ error:'Not found' });
  res.json(p);
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
  res.status(201).json(product);
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
  res.json(db.products[idx]);
});

app.delete('/api/products/:id', auth, adminOnly, (req,res) => {
  const idx = db.products.findIndex(p=>p.id===req.params.id);
  if (idx===-1) return res.status(404).json({ error:'Not found' });
  db.products.splice(idx,1);
  res.json({ message:'Deleted' });
});

/* ══════════════════════════════════════════════════
   PAYMENT ROUTES  — real ZainCash flow simulation
   For live: POST to https://api.zaincash.iq/transaction/init with JWT
══════════════════════════════════════════════════ */

/* Step 1: Init payment — creates pending order, returns redirect/instructions */
app.post('/api/payment/init', async (req,res) => {
  const { method, amount, items, customer, deliveryAddress } = req.body;
  if (!method||!amount||!items||!customer)
    return res.status(400).json({ error:'Missing fields' });

  // Validate stock first
  for (const item of items) {
    const p = db.products.find(p=>p.id===item.productId);
    if (!p) return res.status(400).json({ error:`Product not found: ${item.productId}` });
    if (p.quantity < item.quantity) return res.status(400).json({ error:`Not enough stock for ${p.name}` });
  }

  const pendingId = `PAY-${uuidv4().slice(0,8).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 15*60*1000).toISOString(); // 15 min

  db.pendingPayments[pendingId] = {
    method, amount, items, customer, deliveryAddress,
    status: 'pending',
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  // Return method-specific instructions
  if (method === 'zain_cash') {
    /* LIVE integration:
       1. POST https://api.zaincash.iq/transaction/init with JWT payload
       2. Get back redirectUrl -> send to frontend -> user pays
       3. ZainCash POSTs to your webhook URL on success
       Credentials needed from ZainCash business team:
       ZAINCASH_MERCHANT_ID, ZAINCASH_SECRET, ZAINCASH_MSISDN
    */
    return res.json({
      pendingId,
      method,
      expiresAt,
      // In test mode — in production this would be the real ZainCash redirect URL
      redirectUrl: null,
      walletInstructions: {
        merchantName: 'SASA Boutique',
        amount,
        referenceId: pendingId,
        phone: process.env.ZAINCASH_MERCHANT_PHONE || '07835077893',
        steps_ar: [
          'افتح تطبيق زين كاش',
          'اختر تحويل مبلغ',
          `أدخل رقم المحفظة: ${process.env.ZAINCASH_MERCHANT_PHONE || '07835077893'}`,
          `أدخل المبلغ: ${amount.toLocaleString()} دينار`,
          `اكتب رقم الطلب في الملاحظات: ${pendingId}`,
          'أرسل الحوالة وانتظر التأكيد',
        ],
        steps_en: [
          'Open ZainCash app',
          'Choose Transfer',
          `Enter wallet number: ${process.env.ZAINCASH_MERCHANT_PHONE || '07835077893'}`,
          `Enter amount: ${amount.toLocaleString()} IQD`,
          `Write order reference in notes: ${pendingId}`,
          'Send and wait for confirmation',
        ],
      },
    });
  }

  if (method === 'qi_card') {
    return res.json({
      pendingId, method, expiresAt, redirectUrl: null,
      cardInstructions: {
        merchantName: 'SASA Boutique',
        amount, referenceId: pendingId,
        note_ar: 'قم بالدفع من خلال جهاز QiCard أو التطبيق باستخدام رقم المرجع أعلاه.',
        note_en: 'Pay via QiCard device or app using the reference number above.',
      },
    });
  }

  if (method === 'mastercard') {
    return res.json({
      pendingId, method, expiresAt, redirectUrl: null,
      note: 'Card payment — verify card details then confirm.',
    });
  }

  if (method === 'delivery') {
    // Cash on delivery — no payment needed, create order directly
    const order = await createOrderFromPending(pendingId, 'cod_confirmed');
    return res.json({ pendingId, method, orderId: order.id, status:'confirmed' });
  }

  res.json({ pendingId, method, expiresAt });
});

/* Step 2: Confirm payment — user submits proof/card details */
app.post('/api/payment/confirm', async (req,res) => {
  const { pendingId, cardDetails, transferRef } = req.body;
  const pending = db.pendingPayments[pendingId];
  if (!pending) return res.status(404).json({ error:'Payment session not found or expired' });
  if (new Date() > new Date(pending.expiresAt))
    return res.status(400).json({ error:'Payment session expired. Please restart checkout.' });
  if (pending.status !== 'pending')
    return res.status(400).json({ error:'Payment already processed' });

  // Validate based on method
  if (pending.method === 'mastercard' || pending.method === 'qi_card') {
    if (!cardDetails?.number || cardDetails.number.replace(/\s/g,'').length < 12)
      return res.status(400).json({ error:'Invalid card number' });
    if (!cardDetails?.expiry) return res.status(400).json({ error:'Expiry required' });
    if (!cardDetails?.cvv)    return res.status(400).json({ error:'CVV required' });
  }
  if (pending.method === 'zain_cash') {
    if (!transferRef || transferRef.trim().length < 3)
      return res.status(400).json({ error:'Transfer reference number required' });
  }

  // Simulate 1.5s processing delay
  await new Promise(r => setTimeout(r, 1500));

  // Mark as paid and create order
  pending.status = 'paid';
  pending.confirmedAt = new Date().toISOString();
  pending.transferRef = transferRef;

  try {
    const order = await createOrderFromPending(pendingId, 'confirmed');
    res.json({ success:true, orderId:order.id, transactionId:`TXN-${Date.now()}` });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

/* Helper — build real order once payment confirmed */
async function createOrderFromPending(pendingId, paymentStatus) {
  const p = db.pendingPayments[pendingId];
  if (!p) throw new Error('Pending payment not found');

  // Deduct stock
  for (const item of p.items) {
    const idx = db.products.findIndex(pr=>pr.id===item.productId);
    if (idx !== -1) db.products[idx].quantity -= item.quantity;
  }

  const order = {
    id: `ORD-${Date.now()}`,
    items: p.items,
    customer: p.customer,
    paymentMethod: p.method,
    paymentStatus,
    deliveryAddress: p.deliveryAddress,
    total: p.amount,
    status: 'processing',
    pendingId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.orders.push(order);
  delete db.pendingPayments[pendingId];
  return order;
}

/* ZainCash webhook (for live integration) */
app.post('/api/payment/webhook/zaincash', (req,res) => {
  const { pendingId, status, transactionId } = req.body;
  if (status === 'success' && pendingId && db.pendingPayments[pendingId]) {
    createOrderFromPending(pendingId, 'paid').catch(console.error);
  }
  res.json({ received: true });
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
  res.json(db.orders[idx]);
});

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