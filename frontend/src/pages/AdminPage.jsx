import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  Plus, Edit, Trash2, LogOut, Menu, X, TrendingUp,
  Check, Upload, Image, ArrowUpDown
} from 'lucide-react';
import {
  getStats, getOrders, getProducts, getCustomers,
  deleteProduct, updateOrderStatus, createProduct, updateProduct,
  getCategories, createCategory, updateCategory, deleteCategory
} from '../api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

/* ─── constants ─── */
const CATEGORY_TYPES = {
  clothes:['Dress','Blouse','Skirt','Abaya','Jacket','Pants','Top'],
  shoes:['Heels','Sneakers','Flats','Boots','Sandals','Loafers'],
  bags:['Crossbody','Tote','Clutch','Backpack','Shoulder Bag','Mini Bag'],
  foundation:['Foundation','Blush','BB Cream','Concealer','Primer','Setting Powder'],
  other:['Accessories','Electronics','Fragrance','Home','Sports'],
};
const CATEGORY_LABELS_AR = { clothes:'الملابس', shoes:'الأحذية', bags:'الحقائب', foundation:'التجميل', other:'الإكسسوارات' };
const TYPE_LABELS_AR = {
  Dress:'فستان', Blouse:'بلوزة', Skirt:'تنورة', Abaya:'عباءة', Jacket:'جاكيت', Pants:'بنطال', Top:'توب',
  Heels:'كعب', Sneakers:'رياضي', Flats:'باليرينا', Boots:'بوت', Sandals:'صندل', Loafers:'لوفر',
  Crossbody:'كروس بودي', Tote:'توت باج', Clutch:'كلتش', Backpack:'شنطة ظهر',
  'Shoulder Bag':'شنطة كتف', 'Mini Bag':'ميني باج',
  Foundation:'كريم أساس', Blush:'بلاشر', 'BB Cream':'بي بي كريم',
  Concealer:'كونسيلر', Primer:'برايمر', 'Setting Powder':'بودرة تثبيت',
  Accessories:'إكسسوارات', Electronics:'إلكترونيات', Fragrance:'عطور', Home:'منزل', Sports:'رياضة',
};

/* ══════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════ */
function Sidebar({ open, setOpen }) {
  const { logout, user } = useAuth();
  const { t, isRTL, lang, toggleLang } = useLang();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to:'/admin',            icon:LayoutDashboard, label:t('admin_dashboard'), exact:true },
    { to:'/admin/products',   icon:Package,         label:t('admin_products') },
    { to:'/admin/categories', icon:Tag,             label:isRTL?'إدارة الأقسام':'Categories' },
    { to:'/admin/orders',     icon:ShoppingBag,     label:t('admin_orders') },
    { to:'/admin/customers',  icon:Users,           label:t('admin_customers') },
  ];

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={()=>setOpen(false)}/>}
      <aside className={`fixed top-0 h-full w-64 bg-white z-50 flex flex-col
        transition-transform duration-300 shadow-xl
        ${isRTL ? 'right-0 border-l border-pink-100' : 'left-0 border-r border-pink-100'}
        ${open ? 'translate-x-0' : (isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}`}>

        {/* Logo */}
        <div className="p-5 border-b border-pink-100">
          <div className={`flex items-center gap-3 ${isRTL?'flex-row-reverse':''}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-black flex-shrink-0 border border-[#C9A84C]/30 shadow">
              <img src="/logo.png" alt="SASA" className="w-full h-full object-cover"/>
            </div>
            <div className={isRTL?'text-right':''}>
              <div className="font-display font-black text-sm tracking-wider uppercase text-gray-900">SASA</div>
              <div className="text-[9px] tracking-[0.3em] text-[#C9A84C] uppercase font-black">{t('admin_panel')}</div>
              <div className="text-xs text-gray-400 font-semibold mt-0.5">{user?.name}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon:Icon, label, exact }) => (
            <Link key={to} to={to} onClick={()=>setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200
                ${isRTL?'flex-row-reverse':''}
                ${isActive(to,exact)
                  ? 'bg-pink-50 text-pink-600 shadow-sm'
                  : 'text-gray-500 hover:bg-pink-50 hover:text-pink-500'}`}>
              <Icon className="w-5 h-5 flex-shrink-0"/>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-pink-100 space-y-1">
          <button onClick={toggleLang}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold
              text-gray-500 hover:bg-amber-50 hover:text-[#C9A84C] transition-all w-full
              ${isRTL?'flex-row-reverse':''}`}>
            <span className="text-base">{lang==='ar'?'🇬🇧':'🇮🇶'}</span>
            {lang==='ar'?'English':'العربية'}
          </button>
          <Link to="/profile"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold
              text-gray-500 hover:bg-pink-50 hover:text-pink-500 transition-all w-full
              ${isRTL?'flex-row-reverse':''}`}>
            <Users className="w-5 h-5"/>
            {isRTL?'ملفي الشخصي':'My Profile'}
          </Link>
          <button onClick={()=>{ logout(); navigate('/'); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold
              text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all w-full
              ${isRTL?'flex-row-reverse':''}`}>
            <LogOut className="w-5 h-5"/>
            {t('admin_signout')}
          </button>
          <Link to="/"
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs text-gray-400
              hover:text-pink-500 font-semibold ${isRTL?'flex-row-reverse':''}`}>
            {t('admin_back_store')}
          </Link>
        </div>
      </aside>
    </>
  );
}

/* ══════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════ */
function DashboardHome() {
  const [stats, setStats] = useState(null);
  const { t, isRTL } = useLang();
  useEffect(()=>{ getStats().then(r=>setStats(r.data)).catch(console.error); },[]);

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"/></div>;

  const statusColor = s => ({
    pending:'bg-amber-100 text-amber-700', processing:'bg-blue-100 text-blue-700',
    shipped:'bg-purple-100 text-purple-700', delivered:'bg-green-100 text-green-700',
    cancelled:'bg-red-100 text-red-700'
  }[s]||'bg-gray-100 text-gray-600');

  const cards = [
    { label:t('admin_revenue'),         value:`${stats.totalRevenue.toLocaleString()} IQD`, icon:TrendingUp, color:'text-green-600', bg:'bg-green-50' },
    { label:t('admin_total_orders'),    value:stats.totalOrders,    icon:ShoppingBag, color:'text-pink-600',   bg:'bg-pink-50' },
    { label:t('admin_total_products'),  value:stats.totalProducts,  icon:Package,     color:'text-blue-600',  bg:'bg-blue-50' },
    { label:t('admin_total_customers'), value:stats.totalCustomers, icon:Users,       color:'text-purple-600',bg:'bg-purple-50' },
  ];

  return (
    <div className="space-y-6" dir={isRTL?'rtl':'ltr'}>
      <div>
        <h1 className="font-display text-2xl font-black text-gray-900">{t('admin_dashboard')}</h1>
        <p className="text-gray-400 text-sm font-semibold mt-1">{t('admin_welcome')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon:Icon, color, bg })=>(
          <div key={label} className="card p-5 hover:scale-[1.02] transition-transform duration-200">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-3 shadow-sm`}>
              <Icon className={`w-5 h-5 ${color}`}/>
            </div>
            <div className="font-display text-2xl font-black text-gray-900 mb-1">{value}</div>
            <div className="text-xs text-gray-500 font-semibold">{label}</div>
          </div>
        ))}
      </div>

      {/* Category bars */}
      <div className="card p-5">
        <h2 className="font-display text-lg font-black mb-4">{t('admin_category_overview')}</h2>
        <div className="space-y-3">
          {stats.categoryStats.map(c=>(
            <div key={c.category} className={`flex items-center gap-4 ${isRTL?'flex-row-reverse':''}`}>
              <span className="text-sm text-gray-600 font-bold w-28 text-right">{isRTL?CATEGORY_LABELS_AR[c.category]||c.label:c.label}</span>
              <div className="flex-1 bg-pink-50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-pink-300 h-2.5 rounded-full transition-all duration-700"
                  style={{ width:`${stats.totalProducts?(c.count/stats.totalProducts)*100:0}%` }}/>
              </div>
              <span className="text-xs text-gray-400 font-bold w-12">{c.count} {t('admin_items')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card p-5">
        <div className={`flex items-center justify-between mb-4 ${isRTL?'flex-row-reverse':''}`}>
          <h2 className="font-display text-lg font-black">{t('admin_recent_orders')}</h2>
          <Link to="/admin/orders" className="text-sm text-pink-500 hover:underline font-bold">{t('admin_view_all')}</Link>
        </div>
        {stats.recentOrders.length===0
          ? <p className="text-gray-400 text-sm text-center py-6 font-semibold">{t('admin_no_orders')}</p>
          : <div className="space-y-3">
              {stats.recentOrders.map(o=>(
                <div key={o.id} className={`flex items-center justify-between py-2 border-b border-pink-50 last:border-0 ${isRTL?'flex-row-reverse':''}`}>
                  <div className={isRTL?'text-right':''}>
                    <p className="text-sm font-black text-gray-900">{o.id}</p>
                    <p className="text-xs text-gray-400 font-semibold">{o.customer?.name} · {new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={isRTL?'text-left':'text-right'}>
                    <p className="text-sm font-black text-pink-600">{o.total?.toLocaleString()} IQD</p>
                    <span className={`badge text-xs ${statusColor(o.status)}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CATEGORY MODAL
══════════════════════════════════════════════ */
function CategoryModal({ cat, onClose, onSave }) {
  const { isRTL } = useLang();
  const [form, setForm] = useState({
    nameEn: cat?.nameEn||'', nameAr: cat?.nameAr||'',
    types: cat?.types?.join(', ')||'', order: cat?.order||''
  });
  const [imgFile, setImgFile] = useState(null);
  const [preview, setPreview] = useState(cat?.image||null);
  const [loading, setLoading] = useState(false);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const handleImg = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImgFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('nameEn', form.nameEn);
      fd.append('nameAr', form.nameAr);
      fd.append('types', JSON.stringify(form.types.split(',').map(s=>s.trim()).filter(Boolean)));
      if (form.order) fd.append('order', form.order);
      if (imgFile) fd.append('image', imgFile);
      if (cat) { await updateCategory(cat.id, fd); toast.success(isRTL?'تم التحديث!':'Updated!'); }
      else { await createCategory(fd); toast.success(isRTL?'تم الإنشاء!':'Created!'); }
      onSave(); onClose();
    } catch(e) { toast.error(e.response?.data?.error||'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" dir={isRTL?'rtl':'ltr'}>
        <div className={`flex items-center justify-between p-6 border-b border-pink-100 ${isRTL?'flex-row-reverse':''}`}>
          <h2 className="font-display text-xl font-black">{cat ? (isRTL?'تعديل القسم':'Edit Category') : (isRTL?'قسم جديد':'New Category')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-pink-50 active:scale-90 transition-all"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image */}
          <div>
            <label className="block text-sm font-black text-gray-800 mb-1.5">{isRTL?'صورة القسم':'Category Image'}</label>
            <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group border-2 border-dashed border-pink-200 hover:border-pink-400 transition-colors"
              onClick={()=>document.getElementById('catImg').click()}>
              {preview
                ? <img src={preview} alt="" className="w-full h-full object-cover"/>
                : <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                    <Image className="w-8 h-8"/>
                    <span className="text-sm font-semibold">{isRTL?'اضغطي لرفع صورة':'Click to upload photo'}</span>
                  </div>}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-8 h-8 text-white"/>
              </div>
              <input id="catImg" type="file" accept="image/*" className="hidden" onChange={handleImg}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black text-gray-800 mb-1.5">{isRTL?'الاسم بالإنجليزي':'English Name'} *</label>
              <input className="input" value={form.nameEn} onChange={e=>set('nameEn',e.target.value)} placeholder="e.g. Clothes" required dir="ltr"/>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-1.5">{isRTL?'الاسم بالعربي':'Arabic Name'}</label>
              <input className="input" value={form.nameAr} onChange={e=>set('nameAr',e.target.value)} placeholder="مثال: الملابس" dir="rtl"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-800 mb-1.5">{isRTL?'الأنواع (مفصولة بفاصلة)':'Types (comma-separated)'}</label>
            <input className="input" value={form.types} onChange={e=>set('types',e.target.value)} placeholder="Dress, Blouse, Skirt" dir="ltr"/>
            <p className="text-xs text-gray-400 font-semibold mt-1">{isRTL?'الأنواع تظهر كفلاتر في صفحة القسم':'These appear as filters in the category page'}</p>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-800 mb-1.5">{isRTL?'الترتيب':'Display Order'}</label>
            <input type="number" className="input w-32" value={form.order} onChange={e=>set('order',e.target.value)} placeholder="1" min="1" dir="ltr"/>
          </div>

          <div className={`flex gap-3 pt-2 ${isRTL?'flex-row-reverse':''}`}>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">{isRTL?'إلغاء':'Cancel'}</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
              {cat ? (isRTL?'تحديث القسم':'Update Category') : (isRTL?'إنشاء القسم':'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ADMIN CATEGORIES
══════════════════════════════════════════════ */
function AdminCategories() {
  const [cats, setCats]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null);
  const { isRTL } = useLang();

  const load = useCallback(async()=>{
    const { data } = await getCategories();
    setCats(data); setLoading(false);
  },[]);
  useEffect(()=>{ load(); },[load]);

  const handleDelete = async (id, name) => {
    if (!confirm(isRTL?`حذف قسم "${name}"?`:`Delete category "${name}"?`)) return;
    try { await deleteCategory(id); toast.success(isRTL?'تم الحذف!':'Deleted!'); load(); }
    catch(e) { toast.error(e.response?.data?.error||(isRTL?'لا يمكن حذف قسم به منتجات':'Cannot delete category with products')); }
  };

  return (
    <div dir={isRTL?'rtl':'ltr'}>
      <div className={`flex items-center justify-between mb-6 ${isRTL?'flex-row-reverse':''}`}>
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900">{isRTL?'إدارة الأقسام':'Categories'}</h1>
          <p className="text-gray-400 text-sm font-semibold">{cats.length} {isRTL?'قسم':'categories'}</p>
        </div>
        <button onClick={()=>setModal('new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4"/> {isRTL?'قسم جديد':'New Category'}
        </button>
      </div>

      {loading
        ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(5)].map((_,i)=><div key={i} className="h-48 rounded-2xl skeleton"/>)}</div>
        : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cats.map(cat=>(
              <div key={cat.id} className="card overflow-hidden group">
                {/* Category image */}
                <div className="relative h-36 bg-gray-100 overflow-hidden">
                  <img src={cat.image||'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=60'}
                    alt={cat.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e=>{ e.target.src='https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=60'; }}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <div>
                      <p className="text-white font-black text-sm">{isRTL?cat.nameAr:cat.nameEn}</p>
                      <p className="text-white/70 text-xs font-semibold">{isRTL?cat.nameEn:cat.nameAr}</p>
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className="p-3">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {cat.types?.slice(0,3).map(tp=>(
                      <span key={tp} className="text-[10px] bg-pink-50 text-pink-600 font-bold px-2 py-0.5 rounded-full">
                        {isRTL?(TYPE_LABELS_AR[tp]||tp):tp}
                      </span>
                    ))}
                    {cat.types?.length>3 && <span className="text-[10px] text-gray-400 font-bold">+{cat.types.length-3}</span>}
                  </div>
                  <div className={`flex gap-2 ${isRTL?'flex-row-reverse':''}`}>
                    <button onClick={()=>setModal(cat)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold border border-blue-200 text-blue-500 hover:bg-blue-50 transition-colors">
                      <Edit className="w-3 h-3"/> {isRTL?'تعديل':'Edit'}
                    </button>
                    <button onClick={()=>handleDelete(cat.id, cat.nameEn)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-400 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3 h-3"/> {isRTL?'حذف':'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {/* Add new card */}
            <button onClick={()=>setModal('new')}
              className="h-full min-h-[200px] rounded-2xl border-2 border-dashed border-pink-200
                hover:border-pink-400 hover:bg-pink-50 transition-all duration-200
                flex flex-col items-center justify-center gap-3 text-pink-400 group">
              <div className="w-12 h-12 rounded-full bg-pink-100 group-hover:bg-pink-200 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6"/>
              </div>
              <span className="text-sm font-black">{isRTL?'إضافة قسم جديد':'Add New Category'}</span>
            </button>
          </div>}

      {modal && <CategoryModal cat={modal==='new'?null:modal} onClose={()=>setModal(null)} onSave={load}/>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   PRODUCT MODAL
══════════════════════════════════════════════ */
function ProductModal({ product, allCategories, onClose, onSave }) {
  const { t, isRTL } = useLang();
  const [form, setForm] = useState({
    name:product?.name||'', category:product?.category||allCategories[0]?.id||'clothes',
    type:product?.type||'', price:product?.price||'', originalPrice:product?.originalPrice||'',
    quantity:product?.quantity||'', description:product?.description||'',
    sizes:product?.sizes?.join(',')||'', colors:product?.colors?.join(',')||'',
    featured:product?.featured||false,
  });
  const [imgFile, setImgFile]   = useState(null);
  const [preview, setPreview]   = useState(product?.image||null);
  const [loading, setLoading]   = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  // get types for selected category
  const currentCat = allCategories.find(c=>c.id===form.category);
  const typeOptions = currentCat?.types || CATEGORY_TYPES[form.category] || [];

  const handleImg = e => {
    const f = e.target.files[0]; if(!f) return;
    setImgFile(f); setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>{
        if(k==='sizes'||k==='colors') fd.append(k, JSON.stringify(v.split(',').map(s=>s.trim()).filter(Boolean)));
        else fd.append(k, v);
      });
      if(imgFile) fd.append('image', imgFile);
      if(product){ await updateProduct(product.id, fd); toast.success(t('admin_updated')); }
      else { await createProduct(fd); toast.success(t('admin_created')); }
      onSave(); onClose();
    } catch(e){ toast.error(e.response?.data?.error||'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir={isRTL?'rtl':'ltr'}>
        <div className={`flex items-center justify-between p-6 border-b border-pink-100 ${isRTL?'flex-row-reverse':''}`}>
          <h2 className="font-display text-xl font-black">{product?t('admin_edit_product'):t('admin_new_product')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-pink-50 active:scale-90 transition-all"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-black text-gray-800 mb-1.5">{t('admin_product_name')} *</label>
              <input className="input" value={form.name} onChange={e=>set('name',e.target.value)} required/>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-1.5">{t('admin_category')} *</label>
              <select className="input" value={form.category} onChange={e=>{ set('category',e.target.value); set('type',''); }}>
                {allCategories.map(c=>(
                  <option key={c.id} value={c.id}>{isRTL?c.nameAr:c.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-1.5">{t('admin_type')}</label>
              <select className="input" value={form.type} onChange={e=>set('type',e.target.value)}>
                <option value="">--</option>
                {typeOptions.map(tp=>(
                  <option key={tp} value={tp}>{isRTL?(TYPE_LABELS_AR[tp]||tp):tp}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-1.5">{t('admin_price')} *</label>
              <input type="number" className="input" value={form.price} onChange={e=>set('price',e.target.value)} required min="0" dir="ltr"/>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-1.5">{t('admin_original_price')}</label>
              <input type="number" className="input" value={form.originalPrice} onChange={e=>set('originalPrice',e.target.value)} min="0" dir="ltr"/>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-1.5">{t('admin_quantity')} *</label>
              <input type="number" className="input" value={form.quantity} onChange={e=>set('quantity',e.target.value)} required min="0" dir="ltr"/>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-1.5">{t('admin_featured')}</label>
              <select className="input" value={form.featured} onChange={e=>set('featured',e.target.value==='true')}>
                <option value="false">{t('admin_no')}</option>
                <option value="true">{t('admin_yes')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-1.5">{t('admin_sizes')}</label>
              <input className="input" value={form.sizes} onChange={e=>set('sizes',e.target.value)} placeholder="S, M, L or 36, 37, 38" dir="ltr"/>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-1.5">{t('admin_colors')}</label>
              <input className="input" value={form.colors} onChange={e=>set('colors',e.target.value)} placeholder="Pink, White, Blue" dir="ltr"/>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-black text-gray-800 mb-1.5">{t('admin_description')}</label>
              <textarea className="input min-h-[80px] resize-none" value={form.description} onChange={e=>set('description',e.target.value)} rows={3}/>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-black text-gray-800 mb-1.5">{t('admin_image')}</label>
              <div className="relative h-36 rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group border-2 border-dashed border-pink-200 hover:border-pink-400 transition-colors"
                onClick={()=>document.getElementById('prodImg').click()}>
                {preview
                  ? <img src={preview} alt="" className="w-full h-full object-cover"/>
                  : <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                      <Upload className="w-8 h-8"/>
                      <span className="text-sm font-semibold">{t('admin_upload')}</span>
                    </div>}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white"/>
                </div>
                <input id="prodImg" type="file" accept="image/*" className="hidden" onChange={handleImg}/>
              </div>
            </div>
          </div>
          <div className={`flex gap-3 pt-2 ${isRTL?'flex-row-reverse':''}`}>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">{t('admin_cancel')}</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
              {product?t('admin_update'):t('admin_create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ADMIN PRODUCTS
══════════════════════════════════════════════ */
function AdminProducts() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null);
  const [filterCat,   setFilterCat]   = useState('');
  const { t, isRTL } = useLang();

  const load = useCallback(async()=>{
    const [pr, cats] = await Promise.all([
      getProducts(filterCat?{ category:filterCat }:{}),
      getCategories()
    ]);
    setProducts(pr.data); setCategories(cats.data); setLoading(false);
  },[filterCat]);
  useEffect(()=>{ load(); },[load]);

  const handleDelete = async(id,name)=>{
    if(!confirm(`${t('admin_delete_confirm')} "${name}"?`)) return;
    try{ await deleteProduct(id); toast.success(t('admin_deleted')); load(); }
    catch{ toast.error('Failed'); }
  };

  return (
    <div dir={isRTL?'rtl':'ltr'}>
      <div className={`flex items-center justify-between mb-6 ${isRTL?'flex-row-reverse':''}`}>
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900">{t('admin_products')}</h1>
          <p className="text-gray-400 text-sm font-semibold">{products.length} {t('admin_items')}</p>
        </div>
        <button onClick={()=>setModal('new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4"/> {t('admin_add_product')}
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={()=>setFilterCat('')}
          className={`btn-outline text-xs ${!filterCat?'border-pink-400 text-pink-600 bg-pink-50':''}`}>
          {t('admin_all')}
        </button>
        {categories.map(c=>(
          <button key={c.id} onClick={()=>setFilterCat(c.id)}
            className={`btn-outline text-xs ${filterCat===c.id?'border-pink-400 text-pink-600 bg-pink-50':''}`}>
            {isRTL?c.nameAr:c.nameEn}
          </button>
        ))}
      </div>

      {loading
        ? <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-16 rounded-xl skeleton"/>)}</div>
        : <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-pink-50 border-b border-pink-100">
                  <tr>
                    {[t('admin_product_col'),t('admin_category'),t('admin_price'),t('admin_stock'),t('admin_featured'),t('admin_actions')].map(h=>(
                      <th key={h} className={`text-xs font-black text-gray-500 px-4 py-3 uppercase tracking-wide ${isRTL?'text-right':'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {products.length===0
                    ? <tr><td colSpan={6} className="text-center py-12 text-gray-400 font-semibold">{t('admin_no_products')}</td></tr>
                    : products.map(p=>(
                    <tr key={p.id} className="hover:bg-pink-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-3 ${isRTL?'flex-row-reverse':''}`}>
                          <div className="w-11 h-11 rounded-xl bg-pink-100 overflow-hidden flex-shrink-0 shadow-sm">
                            {p.image && <img src={p.image} className="w-full h-full object-cover" alt=""
                              onError={e=>{ e.target.style.display='none'; }}/>}
                          </div>
                          <div className={isRTL?'text-right':''}>
                            <p className="font-black text-sm text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-400 font-semibold">{p.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-600 capitalize">
                        {isRTL ? (categories.find(c=>c.id===p.category)?.nameAr||p.category) : p.category}
                      </td>
                      <td className="px-4 py-3 text-sm font-black text-pink-600">{p.price.toLocaleString()} IQD</td>
                      <td className="px-4 py-3">
                        <span className={`badge font-black ${p.quantity===0?'bg-red-100 text-red-600':p.quantity<=5?'bg-amber-100 text-amber-600':'bg-green-100 text-green-600'}`}>
                          {p.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{p.featured?'✅':'—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={()=>setModal(p)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-400 active:scale-90 transition-all"><Edit className="w-4 h-4"/></button>
                          <button onClick={()=>handleDelete(p.id,p.name)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 active:scale-90 transition-all"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>}

      {modal && <ProductModal
        product={modal==='new'?null:modal}
        allCategories={categories}
        onClose={()=>setModal(null)}
        onSave={load}
      />}
    </div>
  );
}

/* ══════════════════════════════════════════════
   ADMIN ORDERS
══════════════════════════════════════════════ */
function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, isRTL } = useLang();

  useEffect(()=>{ getOrders().then(r=>setOrders(r.data)).catch(console.error).finally(()=>setLoading(false)); },[]);

  const statusColor = s=>({ pending:'bg-amber-100 text-amber-700', processing:'bg-blue-100 text-blue-700', shipped:'bg-purple-100 text-purple-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700' }[s]||'bg-gray-100 text-gray-600');

  const updateStatus = async(id,status)=>{
    try{ const { data } = await updateOrderStatus(id,{ status }); setOrders(os=>os.map(o=>o.id===id?data:o)); toast.success(t('admin_status_updated')); }
    catch{ toast.error('Failed'); }
  };

  return (
    <div dir={isRTL?'rtl':'ltr'}>
      <h1 className="font-display text-2xl font-black text-gray-900 mb-6">{t('admin_orders')}</h1>
      {loading
        ? <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-20 rounded-xl skeleton"/>)}</div>
        : orders.length===0
          ? <div className="text-center py-16 text-gray-400"><ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30"/><p className="font-semibold">{t('admin_no_orders')}</p></div>
          : <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-pink-50 border-b border-pink-100">
                    <tr>{[t('admin_order_id'),t('admin_customer'),'Total',t('admin_payment'),t('admin_status'),t('admin_date'),t('admin_actions')].map(h=>(
                      <th key={h} className={`text-xs font-black text-gray-500 px-4 py-3 uppercase ${isRTL?'text-right':'text-left'}`}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {orders.map(o=>(
                      <tr key={o.id} className="hover:bg-pink-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-black text-gray-600">{o.id}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-black text-gray-900">{o.customer?.name}</p>
                          <p className="text-xs text-gray-400 font-semibold">{o.customer?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-black text-pink-600">{o.total?.toLocaleString()} IQD</td>
                        <td className="px-4 py-3 text-xs text-gray-600 font-bold capitalize">{o.paymentMethod?.replace('_',' ')}</td>
                        <td className="px-4 py-3"><span className={`badge font-black ${statusColor(o.status)}`}>{o.status}</span></td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-semibold">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-pink-400 font-semibold">
                            {['pending','processing','shipped','delivered','cancelled'].map(s=>(
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   ADMIN CUSTOMERS
══════════════════════════════════════════════ */
function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const { t, isRTL } = useLang();
  useEffect(()=>{ getCustomers().then(r=>setCustomers(r.data)).catch(console.error).finally(()=>setLoading(false)); },[]);

  return (
    <div dir={isRTL?'rtl':'ltr'}>
      <h1 className="font-display text-2xl font-black text-gray-900 mb-6">{t('admin_customers')}</h1>
      {loading
        ? <div className="h-48 rounded-xl skeleton"/>
        : customers.length===0
          ? <div className="text-center py-16 text-gray-400"><Users className="w-12 h-12 mx-auto mb-3 opacity-30"/><p className="font-semibold">{t('admin_no_customers')}</p></div>
          : <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-pink-50 border-b border-pink-100">
                    <tr>{[t('admin_customer'),'Email',t('admin_orders_count'),t('admin_spent'),t('admin_joined')].map(h=>(
                      <th key={h} className={`text-xs font-black text-gray-500 px-4 py-3 uppercase ${isRTL?'text-right':'text-left'}`}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {customers.map(c=>(
                      <tr key={c.id} className="hover:bg-pink-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className={`flex items-center gap-3 ${isRTL?'flex-row-reverse':''}`}>
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-pink-200 to-pink-400 flex-shrink-0 flex items-center justify-center shadow-sm">
                              {c.avatar
                                ? <img src={c.avatar} alt="" className="w-full h-full object-cover"/>
                                : <span className="text-white text-sm font-black">{c.name?.[0]?.toUpperCase()}</span>}
                            </div>
                            <span className="font-black text-sm text-gray-900">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-semibold" dir="ltr">{c.email}</td>
                        <td className="px-4 py-3 text-sm font-black text-gray-900">{c.orders}</td>
                        <td className="px-4 py-3 text-sm font-black text-pink-600">{c.totalSpent?.toLocaleString()} IQD</td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-semibold">{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN ADMIN LAYOUT
══════════════════════════════════════════════ */
export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate  = useNavigate();
  const { isAdmin, user } = useAuth();
  const { t, isRTL } = useLang();

  useEffect(()=>{
    if(!user){ navigate('/login'); return; }
    if(!isAdmin){ navigate('/'); toast.error(isRTL?'صلاحية المدير مطلوبة':'Admin access required'); }
  },[user,isAdmin,navigate,isRTL]);

  const getContent = () => {
    const p = location.pathname;
    if(p==='/admin'||p==='/admin/')          return <DashboardHome/>;
    if(p.includes('/admin/products'))        return <AdminProducts/>;
    if(p.includes('/admin/categories'))      return <AdminCategories/>;
    if(p.includes('/admin/orders'))          return <AdminOrders/>;
    if(p.includes('/admin/customers'))       return <AdminCustomers/>;
    return <DashboardHome/>;
  };

  if(!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}/>
      <div className={isRTL?'lg:mr-64':'lg:ml-64'}>
        <header className="bg-white border-b border-pink-100 px-4 sm:px-6 h-14 flex items-center gap-4">
          <button onClick={()=>setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-pink-50 active:scale-90 transition-all">
            <Menu className="w-5 h-5 text-gray-500"/>
          </button>
          <span className="font-black text-gray-600 text-sm">{t('admin_panel')}</span>
        </header>
        <main className="p-4 sm:p-6 max-w-6xl mx-auto">{getContent()}</main>
      </div>
    </div>
  );
}
