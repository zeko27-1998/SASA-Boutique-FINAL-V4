import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Package, Truck, Check, Clock, XCircle, MapPin, CreditCard } from 'lucide-react';
import { getOrder } from '../api';
import { useLang } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const STATUS_EN = ['pending', 'processing', 'shipped', 'delivered'];
const STATUS_AR = ['قيد الانتظار', 'قيد التجهيز', 'تم الشحن', 'تم التسليم'];
const STATUS_ICONS = {
  pending:    Clock,
  processing: Package,
  shipped:    Truck,
  delivered:  Check,
  cancelled:  XCircle,
};
const STATUS_COLORS = {
  pending:    'text-amber-500 bg-amber-50 border-amber-200',
  processing: 'text-blue-500 bg-blue-50 border-blue-200',
  shipped:    'text-purple-500 bg-purple-50 border-purple-200',
  delivered:  'text-green-500 bg-green-50 border-green-200',
  cancelled:  'text-red-500 bg-red-50 border-red-200',
};
const STATUS_STEP_COLORS = {
  done:   'bg-pink-500 text-white shadow-pink-sm',
  active: 'bg-pink-500 text-white ring-4 ring-pink-200',
  future: 'bg-gray-100 text-gray-300',
};

export default function OrderTrackPage() {
  const { isRTL, t } = useLang();
  const location     = useLocation();

  const [orderId, setOrderId] = useState(
    location.state?.orderId || ''
  );
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Auto-search if navigated here with an orderId
  useEffect(() => {
    if (location.state?.orderId) {
      handleSearch(null, location.state.orderId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e, id) => {
    if (e) e.preventDefault();
    const searchId = (id || orderId).trim();
    if (!searchId) return;
    setLoading(true); setError(''); setOrder(null);
    try {
      const { data } = await getOrder(searchId);
      setOrder(data);
    } catch {
      setError(isRTL
        ? 'لم يتم العثور على الطلب. تأكدي من رقم الطلب.'
        : 'Order not found. Please check the order ID.');
    } finally { setLoading(false); }
  };

  const currentStep = order ? STATUS_EN.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  const PAY_METHOD_LABELS = {
    mastercard: isRTL ? 'ماستركارد' : 'Mastercard',
    qi_card:    isRTL ? 'كي كارد' : 'Qi Card',
    zain_cash:  isRTL ? 'زين كاش' : 'Zain Cash',
    delivery:   isRTL ? 'دفع عند الاستلام' : 'Cash on Delivery',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Header ── */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-200
          flex items-center justify-center mx-auto mb-4 shadow-pink-sm">
          <Package className="w-8 h-8 text-pink-500"/>
        </div>
        <h1 className="font-display text-3xl font-black text-gray-900 mb-2">
          {isRTL ? 'تتبع طلبكِ' : 'Track Your Order'}
        </h1>
        <p className="text-gray-500 font-semibold">
          {isRTL ? 'أدخلي رقم الطلب لمعرفة حالته الآن' : 'Enter your order ID to check its current status'}
        </p>
      </div>

      {/* ── Search ── */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
            ${isRTL ? 'right-4' : 'left-4'}`}/>
          <input
            type="text"
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            placeholder={isRTL ? 'رقم الطلب — مثال: ORD-1234567890' : 'Order ID — e.g. ORD-1234567890'}
            className="input flex-1 w-full"
            style={{ paddingLeft: isRTL ? '1rem' : '2.75rem', paddingRight: isRTL ? '2.75rem' : '1rem' }}
            dir="ltr"
          />
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary flex items-center gap-2 flex-shrink-0 px-5">
          {loading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            : <Search className="w-4 h-4"/>}
          {isRTL ? 'بحث' : 'Track'}
        </button>
      </form>

      {/* ── Error ── */}
      {error && (
        <div className={`flex items-center gap-3 p-4 bg-red-50 border border-red-200
          rounded-2xl mb-6 animate-scale-in ${isRTL ? 'flex-row-reverse' : ''}`}>
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0"/>
          <p className="text-red-600 font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* ── Order result ── */}
      {order && (
        <div className="space-y-4 animate-scale-in">

          {/* Order header card */}
          <div className="card p-5">
            <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-1">
                  {isRTL ? 'رقم الطلب' : 'Order ID'}
                </p>
                <p className="font-black text-gray-900 font-mono text-lg">{order.id}</p>
                <p className="text-xs text-gray-400 font-semibold mt-1">
                  {new Date(order.createdAt).toLocaleDateString(
                    isRTL ? 'ar-IQ' : 'en-US',
                    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </p>
              </div>
              <div className={`flex flex-col ${isRTL ? 'items-start' : 'items-end'} gap-2`}>
                <span className={`badge border font-black text-sm px-3 py-1
                  ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {(() => { const Icon = STATUS_ICONS[order.status]; return Icon ? <Icon className="w-3.5 h-3.5 mr-1 inline"/> : null; })()}
                  {isRTL
                    ? (STATUS_AR[STATUS_EN.indexOf(order.status)] || order.status)
                    : order.status}
                </span>
                <p className="font-black text-pink-600 text-lg">
                  {order.total?.toLocaleString()} {t('currency')}
                </p>
              </div>
            </div>

            {/* Progress tracker */}
            {!isCancelled && (
              <div className="mt-2">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">
                  {isRTL ? 'مسار الطلب' : 'Order Journey'}
                </p>
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {STATUS_EN.map((step, i) => {
                    const Icon  = STATUS_ICONS[step];
                    const done  = i < currentStep;
                    const active= i === currentStep;
                    const cls   = done ? STATUS_STEP_COLORS.done
                                : active ? STATUS_STEP_COLORS.active
                                : STATUS_STEP_COLORS.future;
                    return (
                      <div key={step}
                        className={`flex items-center ${i < STATUS_EN.length - 1 ? 'flex-1' : ''} ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center
                            border-2 ${done || active ? 'border-pink-500' : 'border-gray-200'}
                            ${cls} transition-all duration-500`}>
                            <Icon className="w-4 h-4"/>
                          </div>
                          <span className={`text-[10px] font-black text-center w-16 leading-tight
                            ${done || active ? 'text-pink-600' : 'text-gray-300'}`}>
                            {isRTL ? STATUS_AR[i] : step}
                          </span>
                        </div>
                        {i < STATUS_EN.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 mb-6 rounded-full transition-all duration-700
                            ${i < currentStep ? 'bg-pink-400' : 'bg-gray-200'}`}/>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isCancelled && (
              <div className={`flex items-center gap-3 p-3 bg-red-50 rounded-xl mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0"/>
                <p className="text-red-600 font-bold text-sm">
                  {isRTL ? 'تم إلغاء هذا الطلب' : 'This order has been cancelled'}
                </p>
              </div>
            )}
          </div>

          {/* Items card */}
          <div className="card p-5">
            <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-pink-400"/>
              {isRTL ? 'المنتجات' : 'Items'} ({order.items?.length})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 py-2
                  border-b border-pink-50 last:border-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-pink-50 flex-shrink-0 flex items-center justify-center">
                    <Package className="w-5 h-5 text-pink-300"/>
                  </div>
                  <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                    <p className="text-sm font-black text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 font-semibold">
                      ×{item.quantity}
                      {item.size  ? ` · ${item.size}`  : ''}
                      {item.color ? ` · ${item.color}` : ''}
                    </p>
                  </div>
                  <p className="text-sm font-black text-pink-600 flex-shrink-0">
                    {(item.price * item.quantity).toLocaleString()} {t('currency')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery + Payment info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4">
              <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="w-4 h-4 text-pink-400"/>
                <h4 className="font-black text-xs text-gray-500 uppercase tracking-wide">
                  {isRTL ? 'عنوان التوصيل' : 'Delivery Address'}
                </h4>
              </div>
              <p className={`text-sm font-semibold text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                {order.deliveryAddress || '—'}
              </p>
              {order.customer?.phone && (
                <p className="text-xs text-gray-400 font-semibold mt-1" dir="ltr">
                  {order.customer.phone}
                </p>
              )}
            </div>
            <div className="card p-4">
              <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CreditCard className="w-4 h-4 text-pink-400"/>
                <h4 className="font-black text-xs text-gray-500 uppercase tracking-wide">
                  {isRTL ? 'طريقة الدفع' : 'Payment'}
                </h4>
              </div>
              <p className={`text-sm font-semibold text-gray-700 capitalize ${isRTL ? 'text-right' : ''}`}>
                {PAY_METHOD_LABELS[order.paymentMethod] || order.paymentMethod?.replace('_',' ')}
              </p>
              <p className={`text-xs mt-1 font-bold
                ${order.paymentStatus === 'confirmed' || order.paymentStatus === 'paid' || order.paymentStatus === 'cod_confirmed'
                  ? 'text-green-500' : 'text-amber-500'}`}>
                {order.paymentStatus === 'confirmed' || order.paymentStatus === 'paid' || order.paymentStatus === 'cod_confirmed'
                  ? (isRTL ? '✓ مدفوع' : '✓ Paid')
                  : (isRTL ? '⏳ قيد المراجعة' : '⏳ Pending')}
              </p>
            </div>
          </div>

          {/* Total summary */}
          <div className={`flex items-center justify-between p-5 card ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="font-black text-gray-700">{t('total')}</span>
            <span className="font-display text-2xl font-black text-pink-600">
              {order.total?.toLocaleString()} {t('currency')}
            </span>
          </div>
        </div>
      )}

      {/* ── Empty state hint ── */}
      {!order && !error && !loading && (
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-pink-200"/>
          </div>
          <p className="text-gray-400 font-semibold text-sm mb-2">
            {isRTL
              ? 'ستجدين رقم طلبكِ في رسالة التأكيد بعد إتمام الشراء'
              : 'Find your order ID in the confirmation message after purchase'}
          </p>
          <Link to="/" className="text-pink-500 font-black text-sm hover:underline">
            {isRTL ? 'ابدئي التسوق →' : '→ Start Shopping'}
          </Link>
        </div>
      )}
    </div>
  );
}
