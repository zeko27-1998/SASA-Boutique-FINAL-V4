import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ArrowLeft, ArrowRight, MessageCircle, Copy, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LanguageContext';
import api from '../api';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { t, isRTL } = useLang();
  const navigate = useNavigate();

  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [orderId, setOrderId]         = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [copied, setCopied]           = useState(false);
  const [customer, setCustomer]       = useState({ name:'', email:'', phone:'', address:'' });

  const deliveryFee = total >= 100000 ? 0 : 5000;
  const grandTotal  = total + deliveryFee;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  /* Step 1 → 2 */
  const handleInfoNext = (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address)
      return toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
    setStep(2);
  };

  /* Submit order directly */
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/orders/direct', {
        items: items.map(i => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          image: i.product.image,
        })),
        customer,
        deliveryAddress: customer.address,
      });
      setOrderId(data.orderId);
      setWhatsappUrl(data.whatsappUrl);
      clearCart();
      setStep(3);
    } catch(err) {
      toast.error(err.response?.data?.error || (isRTL ? 'حدث خطأ' : 'Error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (items.length === 0 && step !== 3) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-6xl mb-4">🛍️</div>
      <h2 className="font-display text-2xl font-black mb-4">{isRTL ? 'سلتك فارغة' : 'Your cart is empty'}</h2>
      <Link to="/" className="btn-primary">{isRTL ? 'ابدئي التسوق' : 'Start Shopping'}</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Progress */}
      {step < 3 && (
        <div className={`flex items-center gap-3 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {[1, 2].map((s, i) => (
            <div key={s} className={`flex items-center gap-2 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0
                transition-all duration-300
                ${step > s ? 'bg-pink-500 text-white shadow-[0_4px_12px_rgba(236,72,153,0.4)]'
                  : step === s ? 'bg-pink-500 text-white ring-4 ring-pink-200'
                  : 'bg-gray-100 text-gray-400'}`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-sm font-bold hidden sm:block transition-colors ${step === s ? 'text-pink-600' : 'text-gray-400'}`}>
                {isRTL ? ['معلومات التوصيل', 'تأكيد الطلب'][i] : ['Delivery Info', 'Confirm Order'][i]}
              </span>
              {i < 1 && <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step > s ? 'bg-pink-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* ── STEP 1: Delivery Info ── */}
          {step === 1 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display text-xl font-black mb-5">{isRTL ? 'معلومات التوصيل' : 'Delivery Information'}</h2>
              <form onSubmit={handleInfoNext} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-gray-800 mb-1.5">{isRTL ? 'الاسم الكامل *' : 'Full Name *'}</label>
                    <input type="text" className="input" value={customer.name}
                      onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))}
                      placeholder={isRTL ? 'اسمك الكامل' : 'Your full name'} required />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-800 mb-1.5">{isRTL ? 'رقم الهاتف *' : 'Phone Number *'}</label>
                    <input type="tel" className="input" dir="ltr" value={customer.phone}
                      onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))}
                      placeholder="07XX XXX XXXX" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-800 mb-1.5">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                  <input type="email" className="input" dir="ltr" value={customer.email}
                    onChange={e => setCustomer(c => ({ ...c, email: e.target.value }))}
                    placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-800 mb-1.5">{isRTL ? 'العنوان *' : 'Address *'}</label>
                  <input type="text" className="input" value={customer.address}
                    onChange={e => setCustomer(c => ({ ...c, address: e.target.value }))}
                    placeholder={isRTL ? 'الشارع، الحي، المدينة' : 'Street, neighborhood, city'} required />
                </div>
                <button type="submit"
                  className={`btn-primary w-full py-3.5 flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {isRTL ? 'المتابعة لتأكيد الطلب' : 'Continue to Confirm Order'} <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 2: Order summary + WhatsApp ── */}
          {step === 2 && (
            <div className="animate-fade-in space-y-4">
              <button onClick={() => setStep(1)}
                className={`flex items-center gap-2 text-sm text-gray-500 hover:text-pink-500 mb-5 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                <BackIcon className="w-4 h-4" /> {isRTL ? 'تعديل المعلومات' : 'Edit Information'}
              </button>

              <div className="card p-6">
                <h2 className="font-display text-xl font-black mb-4">{isRTL ? 'ملخص الطلب' : 'Order Summary'}</h2>

                {/* Items */}
                <div className="space-y-3 mb-5">
                  {items.map(item => (
                    <div key={`${item.product.id}-${item.size}`}
                      className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-14 h-14 rounded-xl bg-pink-50 flex-shrink-0 overflow-hidden shadow-sm">
                        <img src={item.product.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100'}
                          className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                        <p className="text-sm font-black text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-400 font-semibold">
                          {isRTL ? 'الكمية' : 'Qty'}: {item.quantity}{item.size ? ` · ${item.size}` : ''}{item.color ? ` · ${item.color}` : ''}
                        </p>
                      </div>
                      <p className="text-sm font-black text-pink-600">{(item.product.price * item.quantity).toLocaleString()} {isRTL ? 'دينار' : 'IQD'}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-pink-100 pt-4 space-y-2">
                  <div className={`flex justify-between text-sm font-semibold text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>{total.toLocaleString()} {isRTL ? 'دينار' : 'IQD'}</span>
                  </div>
                  <div className={`flex justify-between text-sm font-semibold text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-black' : ''}>
                      {deliveryFee === 0 ? (isRTL ? 'مجاني' : 'Free') : `${deliveryFee.toLocaleString()} ${isRTL ? 'دينار' : 'IQD'}`}
                    </span>
                  </div>
                  <div className={`flex justify-between font-display font-black text-lg pt-2 border-t border-pink-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-pink-600">{grandTotal.toLocaleString()} {isRTL ? 'دينار' : 'IQD'}</span>
                  </div>
                </div>
              </div>

              {/* Customer info summary */}
              <div className="card p-4">
                <p className="text-xs text-gray-400 font-bold mb-1">{isRTL ? 'العميل' : 'Customer'}</p>
                <p className="text-sm font-black text-gray-900">{customer.name} — <span dir="ltr" className="font-mono">{customer.phone}</span></p>
                <p className="text-xs text-gray-400 font-semibold">{customer.address}</p>
              </div>

              <button onClick={handlePlaceOrder} disabled={loading}
                className={`w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-base
                  flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-green-200 transition-all`}>
                <MessageCircle className="w-5 h-5" />
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : (isRTL ? 'إرسال الطلب عبر واتساب' : 'Send Order via WhatsApp')}
              </button>
              <p className="text-xs text-gray-400 text-center font-semibold">
                {isRTL ? 'سيتم فتح واتساب لتأكيد الطلب مع الإدارة' : 'WhatsApp will open to confirm your order with our team'}
              </p>
            </div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <div className="text-center py-16 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6
                shadow-[0_8px_30px_rgba(34,197,94,0.25)]">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="font-display text-3xl font-black text-gray-900 mb-3">{isRTL ? 'تم إرسال طلبك!' : 'Order Sent!'}</h2>
              <p className="text-gray-500 font-semibold mb-2">
                {isRTL ? 'سيتم التواصل معك قريباً لتأكيد الطلب' : 'We will contact you soon to confirm your order'}
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-50 border-2 border-dashed border-pink-200 rounded-xl px-4 py-3 mb-6">
                <p className="text-xs text-gray-500 font-bold">{isRTL ? 'رقم الطلب:' : 'Order ID:'}</p>
                <p className="font-black text-sm text-pink-600 font-mono">{orderId}</p>
                <button onClick={copyOrderId} className="text-gray-400 hover:text-pink-500">
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600">
                    <MessageCircle className="w-4 h-4" />
                    {isRTL ? 'تواصل مع الإدارة' : 'Contact Admin on WhatsApp'}
                  </a>
                )}
                <Link to="/profile" state={{ tab: 'orders' }}
                  className="btn-secondary">
                  {isRTL ? 'طلباتي' : 'My Orders'}
                </Link>
                <Link to="/" className="btn-secondary">{isRTL ? 'تسوقي المزيد' : 'Continue Shopping'}</Link>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        {step < 3 && (
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <h3 className="font-display text-lg font-black mb-4">{isRTL ? 'ملخص السلة' : 'Cart Summary'}</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.size}`}
                    className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-14 h-14 rounded-xl bg-pink-50 flex-shrink-0 overflow-hidden shadow-sm">
                      <img src={item.product.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100'}
                        className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                      <p className="text-sm font-black text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400 font-semibold">
                        {isRTL ? 'الكمية' : 'Qty'}: {item.quantity}{item.size ? ` · ${item.size}` : ''}
                      </p>
                      <p className="text-sm text-pink-600 font-black">{(item.product.price * item.quantity).toLocaleString()} {isRTL ? 'دينار' : 'IQD'}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-pink-100 pt-4 space-y-2.5">
                <div className={`flex justify-between text-sm font-semibold text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span>{total.toLocaleString()} {isRTL ? 'دينار' : 'IQD'}</span>
                </div>
                <div className={`flex justify-between text-sm font-semibold text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-black' : ''}>
                    {deliveryFee === 0 ? (isRTL ? 'مجاني' : 'Free') : `${deliveryFee.toLocaleString()} ${isRTL ? 'دينار' : 'IQD'}`}
                  </span>
                </div>
                <div className={`flex justify-between font-display font-black text-lg pt-2 border-t border-pink-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-pink-600">{grandTotal.toLocaleString()} {isRTL ? 'دينار' : 'IQD'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
