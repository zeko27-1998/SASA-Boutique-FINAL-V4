import { useState, useRef } from 'react';
import { Camera, Lock, User, Check, Eye, EyeOff, Package } from 'lucide-react';
import { updateProfile, getUserOrders } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const { isRTL } = useLang();
  const fileRef = useRef();

  const [tab,      setTab]      = useState('info');
  const [name,     setName]     = useState(user?.name || '');
  const [avatar,   setAvatar]   = useState(null);
  const [preview,  setPreview]  = useState(user?.avatar || null);
  const [curPass,  setCurPass]  = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [confPass, setConfPass] = useState('');
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [orders,   setOrders]   = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (tab === 'orders' && user?.email) {
      setOrdersLoading(true);
      getUserOrders(user.email)
        .then(r => setOrders(r.data))
        .catch(console.error)
        .finally(() => setOrdersLoading(false));
    }
  }, [tab, user?.email]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleInfoSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      if (avatar) fd.append('avatar', avatar);
      const { data } = await updateProfile(fd);
      localStorage.setItem('sasa_token', data.token);
      refreshUser(data.user);
      toast.success(isRTL ? 'تم تحديث الملف الشخصي ✅' : 'Profile updated! ✅');
      setAvatar(null);
    } catch(e) {
      toast.error(e.response?.data?.error || (isRTL ? 'حدث خطأ' : 'Error'));
    } finally { setLoading(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (newPass !== confPass)
      return toast.error(isRTL ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
    if (newPass.length < 6)
      return toast.error(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Minimum 6 characters');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('currentPassword', curPass);
      fd.append('newPassword', newPass);
      const { data } = await updateProfile(fd);
      localStorage.setItem('sasa_token', data.token);
      refreshUser(data.user);
      toast.success(isRTL ? 'تم تغيير كلمة المرور ✅' : 'Password changed! ✅');
      setCurPass(''); setNewPass(''); setConfPass('');
    } catch(e) {
      toast.error(e.response?.data?.error || (isRTL ? 'كلمة المرور الحالية غير صحيحة' : 'Wrong current password'));
    } finally { setLoading(false); }
  };

  const STATUS_COLOR = { pending:'bg-amber-100 text-amber-700', processing:'bg-blue-100 text-blue-700', shipped:'bg-purple-100 text-purple-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700' };
  const STATUS_AR    = { pending:'قيد الانتظار', processing:'قيد التجهيز', shipped:'تم الشحن', delivered:'تم التسليم', cancelled:'ملغي' };

  const tabs = [
    { key:'info',     icon:'👤', labelAr:'معلومات الحساب',       labelEn:'Account Info' },
    { key:'password', icon:'🔒', labelAr:'تغيير كلمة المرور',    labelEn:'Change Password' },
    { key:'orders',   icon:'📦', labelAr:'طلباتي',               labelEn:'My Orders' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Header ── */}
      <h1 className="font-display text-3xl font-black text-gray-900 mb-8">
        {isRTL ? 'إعدادات الحساب' : 'Account Settings'}
      </h1>

      {/* ── Avatar card ── */}
      <div className={`flex items-center gap-5 mb-6 p-5 card ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden
            bg-gradient-to-br from-pink-300 to-pink-500 shadow-xl">
            {preview
              ? <img src={preview} alt="" className="w-full h-full object-cover"/>
              : <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-3xl font-black">{user?.name?.[0]?.toUpperCase()}</span>
                </div>}
          </div>
          <button onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full
              bg-pink-500 text-white flex items-center justify-center
              shadow-md hover:bg-pink-600 active:scale-90 transition-all">
            <Camera className="w-4 h-4"/>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
        </div>
        <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
          <p className="font-black text-gray-900 text-lg">{user?.name}</p>
          <p className="text-gray-400 font-semibold text-sm mb-1">{user?.email}</p>
          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-black
            ${user?.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-pink-100 text-pink-600'}`}>
            {user?.role === 'admin' ? (isRTL ? '👑 مدير' : '👑 Admin') : (isRTL ? '🛍️ عميل' : '🛍️ Customer')}
          </span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex bg-pink-50 rounded-xl p-1 mb-6 gap-1">
        {tabs.map(({ key, icon, labelAr, labelEn }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-black
              rounded-lg transition-all duration-200
              ${tab === key ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-pink-400'}`}>
            <span>{icon}</span>
            <span className="hidden sm:inline">{isRTL ? labelAr : labelEn}</span>
          </button>
        ))}
      </div>

      {/* ── Info tab ── */}
      {tab === 'info' && (
        <div className="card p-6 animate-fade-in">
          <form onSubmit={handleInfoSave} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-800 mb-1.5">
                {isRTL ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <input type="text" className="input" value={name}
                onChange={e => setName(e.target.value)} required/>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-1.5">
                {isRTL ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input type="email" className="input bg-gray-50 cursor-not-allowed opacity-60"
                value={user?.email} disabled dir="ltr"/>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                {isRTL ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
              </p>
            </div>
            {avatar && (
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                <img src={preview} alt="" className="w-10 h-10 rounded-full object-cover"/>
                <div>
                  <p className="text-sm font-black text-gray-800">{isRTL ? 'صورة جديدة محددة' : 'New photo selected'}</p>
                  <button type="button" onClick={() => { setAvatar(null); setPreview(user?.avatar || null); }}
                    className="text-xs text-red-400 font-bold hover:underline">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                : <Check className="w-4 h-4"/>}
              {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ── Password tab ── */}
      {tab === 'password' && (
        <div className="card p-6 animate-fade-in">
          <form onSubmit={handlePasswordSave} className="space-y-4">
            {[
              { label: isRTL ? 'كلمة المرور الحالية' : 'Current Password', val: curPass, set: setCurPass, show: showCur, toggle: () => setShowCur(v => !v) },
              { label: isRTL ? 'كلمة المرور الجديدة' : 'New Password',     val: newPass, set: setNewPass, show: showNew, toggle: () => setShowNew(v => !v) },
              { label: isRTL ? 'تأكيد كلمة المرور'  : 'Confirm Password', val: confPass, set: setConfPass, show: showNew, toggle: () => setShowNew(v => !v) },
            ].map(({ label, val, set, show, toggle }) => (
              <div key={label}>
                <label className="block text-sm font-black text-gray-800 mb-1.5">{label}</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={val}
                    onChange={e => set(e.target.value)}
                    className="input" dir="ltr" required minLength={6}
                    style={{ paddingRight: isRTL ? '1rem' : '3rem', paddingLeft: isRTL ? '3rem' : '1rem' }}/>
                  <button type="button" onClick={toggle}
                    className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                      ${isRTL ? 'left-4' : 'right-4'}`}>
                    {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                : <Lock className="w-4 h-4"/>}
              {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* ── Orders tab ── */}
      {tab === 'orders' && (
        <div className="animate-fade-in space-y-4">
          {ordersLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-pink-50 rounded-2xl animate-pulse"/>
            ))
          ) : orders.length === 0 ? (
            <div className="card p-10 text-center">
              <Package className="w-12 h-12 text-pink-200 mx-auto mb-3"/>
              <p className="font-black text-gray-600 mb-1">{isRTL ? 'لا يوجد طلبات بعد' : 'No orders yet'}</p>
              <p className="text-sm text-gray-400 font-semibold mb-4">
                {isRTL ? 'ابدئي التسوق واستمتعي بأحدث العروض' : 'Start shopping to see your orders here'}
              </p>
              <Link to="/" className="btn-primary text-sm">
                {isRTL ? 'تسوقي الآن' : 'Shop Now'}
              </Link>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="card p-4">
                <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="font-black text-gray-900 font-mono text-sm">{order.id}</p>
                    <p className="text-xs text-gray-400 font-semibold">
                      {new Date(order.createdAt).toLocaleDateString(isRTL ? 'ar-IQ' : 'en-US', {
                        year:'numeric', month:'long', day:'numeric'
                      })}
                    </p>
                  </div>
                  <div className={`flex flex-col items-end gap-1 ${isRTL ? 'items-start' : ''}`}>
                    <span className={`badge font-black text-xs ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {isRTL ? STATUS_AR[order.status] || order.status : order.status}
                    </span>
                    <p className="font-black text-pink-600">{order.total?.toLocaleString()} {isRTL ? 'دينار' : 'IQD'}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {order.items?.slice(0,3).map((item, i) => (
                    <span key={i} className="text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg font-semibold text-gray-600 truncate max-w-[120px]">
                      {item.name} ×{item.quantity}
                    </span>
                  ))}
                  {order.items?.length > 3 && (
                    <span className="text-xs text-gray-400 font-bold px-2 py-1">+{order.items.length - 3}</span>
                  )}
                </div>
                <div className={`flex items-center justify-between mt-3 pt-3 border-t border-pink-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs text-gray-400 font-semibold capitalize">
                    {order.paymentMethod?.replace('_',' ')}
                  </span>
                  <Link to={`/track-order`} state={{ orderId: order.id }}
                    className="text-xs text-pink-500 font-black hover:underline">
                    {isRTL ? 'تتبع الطلب ←' : '→ Track Order'}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Danger zone ── */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button onClick={logout}
          className="text-sm text-red-400 font-bold hover:text-red-600 transition-colors">
          {isRTL ? '🚪 تسجيل الخروج من جميع الأجهزة' : '🚪 Sign out of all devices'}
        </button>
      </div>
    </div>
  );
}
