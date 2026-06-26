import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Check, ArrowLeft, ArrowRight, Clock, AlertCircle, Copy, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LanguageContext';
import { initPayment, confirmPayment } from '../api';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = (isRTL) => [
  { id:'mastercard',  icon:'💳', labelAr:'ماستركارد / فيزا',      labelEn:'Mastercard / Visa',     descAr:'ادفعي ببطاقة الائتمان',         descEn:'Pay with credit/debit card' },
  { id:'qi_card',     icon:'🏦', labelAr:'كي كارد',               labelEn:'Qi Card',                descAr:'ادفعي باستخدام كي كارد العراقية', descEn:'Pay using Iraqi Qi Card' },
  { id:'zain_cash',   icon:'📱', labelAr:'زين كاش',               labelEn:'Zain Cash',              descAr:'ادفعي عبر محفظة زين كاش',       descEn:'Pay via Zain Cash wallet' },
  { id:'delivery',    icon:'🚚', labelAr:'الدفع عند الاستلام',    labelEn:'Cash on Delivery',       descAr:'ادفعي عند وصول طلبكِ',          descEn:'Pay when order arrives' },
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { t, isRTL } = useLang();
  const navigate = useNavigate();

  // step: 1=info, 2=payment method, 3=pay action, 4=success
  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [selectedMethod, setMethod]   = useState('mastercard');
  const [cardFields, setCardFields]   = useState({});
  const [pendingData, setPendingData] = useState(null); // from /payment/init
  const [transferRef, setTransferRef] = useState('');
  const [copiedRef, setCopiedRef]     = useState(false);
  const [orderId, setOrderId]         = useState('');
  const [countdown, setCountdown]     = useState(900); // 15 min
  const [customer, setCustomer]       = useState({ name:'', email:'', phone:'', address:'', city:'' });

  const methods = PAYMENT_METHODS(isRTL);
  const method  = methods.find(m=>m.id===selectedMethod);

  /* Countdown timer when on step 3 */
  const startCountdown = () => {
    const iv = setInterval(() => {
      setCountdown(c => { if (c<=1){ clearInterval(iv); return 0; } return c-1; });
    }, 1000);
  };

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  /* Step 1 → 2 */
  const handleInfoNext = (e) => {
    e.preventDefault();
    if (!customer.name||!customer.email||!customer.phone||!customer.address)
      return toast.error(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
    setStep(2);
  };

  /* Step 2 → 3: init payment */
  const handlePaymentInit = async () => {
    setLoading(true);
    try {
      const { data } = await initPayment({
        method: selectedMethod,
        amount: total,
        items: items.map(i=>({ productId:i.product.id, name:i.product.name, price:i.product.price, quantity:i.quantity, size:i.size, color:i.color })),
        customer,
        deliveryAddress: `${customer.address}, ${customer.city}`,
      });
      if (data.orderId) {
        // COD — instant
        setOrderId(data.orderId);
        clearCart();
        setStep(4);
      } else {
        setPendingData(data);
        setCountdown(900);
        startCountdown();
        setStep(3);
      }
    } catch(e) {
      toast.error(e.response?.data?.error || (isRTL ? 'حدث خطأ' : 'Error occurred'));
    } finally { setLoading(false); }
  };

  /* Step 3: confirm payment */
  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!pendingData) return;
    if (selectedMethod==='zain_cash' && !transferRef.trim())
      return toast.error(isRTL ? 'أدخلي رقم الحوالة' : 'Enter transfer reference number');
    if ((selectedMethod==='mastercard'||selectedMethod==='qi_card') && (!cardFields.number||!cardFields.expiry||!cardFields.cvv))
      return toast.error(isRTL ? 'يرجى تعبئة بيانات البطاقة' : 'Please fill card details');

    setLoading(true);
    try {
      const { data } = await confirmPayment({
        pendingId: pendingData.pendingId,
        cardDetails: cardFields,
        transferRef,
      });
      setOrderId(data.orderId);
      clearCart();
      setStep(4);
      toast.success(isRTL ? 'تم الدفع بنجاح! 🎉' : 'Payment confirmed! 🎉');
    } catch(e) {
      toast.error(e.response?.data?.error || (isRTL ? 'فشل التأكيد' : 'Confirmation failed'));
    } finally { setLoading(false); }
  };

  const copyRef = () => {
    if (pendingData?.pendingId) {
      navigator.clipboard.writeText(pendingData.pendingId).catch(()=>{});
      setCopiedRef(true);
      setTimeout(()=>setCopiedRef(false), 2000);
    }
  };

  const deliveryFee = total >= 100000 ? 0 : 5000;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (items.length===0 && step!==4) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center" dir={isRTL?'rtl':'ltr'}>
      <div className="text-6xl mb-4">🛍️</div>
      <h2 className="font-display text-2xl font-black mb-4">{isRTL?'سلتك فارغة':'Your cart is empty'}</h2>
      <Link to="/" className="btn-primary">{isRTL?'ابدئي التسوق':'Start Shopping'}</Link>
    </div>
  );

  const STEPS_AR = ['معلومات التوصيل','اختيار الدفع','إتمام الدفع','تم!'];
  const STEPS_EN = ['Delivery Info','Payment Method','Pay','Done!'];
  const stepLabels = isRTL ? STEPS_AR : STEPS_EN;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8" dir={isRTL?'rtl':'ltr'}>

      {/* Progress */}
      {step < 4 && (
        <div className={`flex items-center gap-3 mb-8 ${isRTL?'flex-row-reverse':''}`}>
          {[1,2,3].map((s,i)=>(
            <div key={s} className={`flex items-center gap-2 flex-1 ${isRTL?'flex-row-reverse':''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0
                transition-all duration-300
                ${step>s ? 'bg-pink-500 text-white shadow-[0_4px_12px_rgba(236,72,153,0.4)]'
                  : step===s ? 'bg-pink-500 text-white ring-4 ring-pink-200'
                  : 'bg-gray-100 text-gray-400'}`}>
                {step>s ? <Check className="w-4 h-4"/> : s}
              </div>
              <span className={`text-sm font-bold hidden sm:block transition-colors ${step===s?'text-pink-600':'text-gray-400'}`}>
                {stepLabels[i]}
              </span>
              {i<2 && <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step>s?'bg-pink-400':'bg-gray-200'}`}/>}
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* ── STEP 1: Delivery Info ── */}
          {step===1 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display text-xl font-black mb-5">{t('checkout_delivery')}</h2>
              <form onSubmit={handleInfoNext} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-gray-800 mb-1.5">{t('checkout_fullname')} *</label>
                    <input type="text" className="input" value={customer.name}
                      onChange={e=>setCustomer(c=>({...c,name:e.target.value}))}
                      placeholder={isRTL?'اسمك الكامل':'Your full name'} required/>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-800 mb-1.5">{t('checkout_phone')} *</label>
                    <input type="tel" className="input" dir="ltr" value={customer.phone}
                      onChange={e=>setCustomer(c=>({...c,phone:e.target.value}))}
                      placeholder="07XX XXX XXXX" required/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-800 mb-1.5">{t('checkout_email')} *</label>
                  <input type="email" className="input" dir="ltr" value={customer.email}
                    onChange={e=>setCustomer(c=>({...c,email:e.target.value}))}
                    placeholder="your@email.com" required/>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-800 mb-1.5">{t('checkout_address')} *</label>
                  <input type="text" className="input" value={customer.address}
                    onChange={e=>setCustomer(c=>({...c,address:e.target.value}))}
                    placeholder={isRTL?'الشارع، الحي...':'Street, neighborhood...'} required/>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-800 mb-1.5">{t('checkout_city')}</label>
                  <input type="text" className="input" value={customer.city}
                    onChange={e=>setCustomer(c=>({...c,city:e.target.value}))}
                    placeholder={isRTL?'بغداد، أربيل، البصرة...':'Baghdad, Erbil, Basra...'}/>
                </div>
                <button type="submit" className={`btn-primary w-full py-3.5 flex items-center justify-center gap-2 ${isRTL?'flex-row-reverse':''}`}>
                  {t('checkout_continue')} <ArrowRight className={`w-4 h-4 ${isRTL?'rotate-180':''}`}/>
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 2: Choose payment method ── */}
          {step===2 && (
            <div className="card p-6 animate-fade-in">
              <button onClick={()=>setStep(1)} className={`flex items-center gap-2 text-sm text-gray-500 hover:text-pink-500 mb-5 transition-colors ${isRTL?'flex-row-reverse':''}`}>
                <BackIcon className="w-4 h-4"/> {t('checkout_back')}
              </button>
              <div className={`flex items-center gap-2 mb-6 ${isRTL?'flex-row-reverse':''}`}>
                <Lock className="w-5 h-5 text-green-500"/>
                <h2 className="font-display text-xl font-black">{t('checkout_secure')}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {methods.map(m=>(
                  <button key={m.id} onClick={()=>setMethod(m.id)}
                    className={`p-4 rounded-2xl border-2 text-${isRTL?'right':'left'} transition-all duration-200 hover:scale-[1.02] active:scale-95
                      ${selectedMethod===m.id
                        ? 'border-pink-400 bg-pink-50 shadow-[0_4px_15px_rgba(236,72,153,0.2)]'
                        : 'border-gray-200 hover:border-pink-200'}`}>
                    <div className="text-2xl mb-1.5">{m.icon}</div>
                    <div className="font-black text-sm text-gray-900">{isRTL?m.labelAr:m.labelEn}</div>
                    <div className="text-xs text-gray-400 font-semibold mt-0.5">{isRTL?m.descAr:m.descEn}</div>
                  </button>
                ))}
              </div>
              <button onClick={handlePaymentInit} disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  : <><Lock className="w-4 h-4"/> {isRTL ? 'المتابعة للدفع' : 'Continue to Payment'}</>}
              </button>
            </div>
          )}

          {/* ── STEP 3: Pay action screen ── */}
          {step===3 && pendingData && (
            <div className="animate-fade-in space-y-4">
              {/* Timer */}
              <div className={`flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl ${isRTL?'flex-row-reverse':''}`}>
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0"/>
                <div className={isRTL?'text-right':''}>
                  <p className="font-black text-amber-800 text-sm">
                    {isRTL ? 'انتهاء الجلسة خلال:' : 'Session expires in:'}&nbsp;
                    <span className={`font-black text-lg ${countdown < 120 ? 'text-red-600' : 'text-amber-600'}`}>
                      {fmtTime(countdown)}
                    </span>
                  </p>
                  <p className="text-xs text-amber-600 font-semibold mt-0.5">
                    {isRTL ? 'يرجى إكمال الدفع قبل انتهاء الوقت' : 'Please complete payment before time runs out'}
                  </p>
                </div>
              </div>

              {/* ZainCash instructions */}
              {selectedMethod==='zain_cash' && (
                <div className="card p-6">
                  <div className={`flex items-center gap-3 mb-5 ${isRTL?'flex-row-reverse':''}`}>
                    <span className="text-3xl">📱</span>
                    <h3 className="font-display text-xl font-black">{isRTL?'خطوات الدفع بزين كاش':'ZainCash Payment Steps'}</h3>
                  </div>
                  {/* Reference box */}
                  <div className={`flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-pink-200 mb-5 ${isRTL?'flex-row-reverse':''}`}>
                    <div className={isRTL?'text-right':''}>
                      <p className="text-xs text-gray-500 font-bold mb-1">{isRTL?'رقم المرجع (ضروري في الملاحظات)':'Reference (required in notes)'}</p>
                      <p className="font-black text-xl text-pink-600 font-mono tracking-wider">{pendingData.pendingId}</p>
                    </div>
                    <button onClick={copyRef} className="icon-btn flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-pink-200 text-sm font-bold text-pink-600 hover:bg-pink-50">
                      {copiedRef ? <CheckCircle className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                      {copiedRef ? (isRTL?'تم النسخ':'Copied!') : (isRTL?'نسخ':'Copy')}
                    </button>
                  </div>
                  {/* Steps */}
                  <ol className="space-y-3 mb-6">
                    {(isRTL ? pendingData.walletInstructions?.steps_ar : pendingData.walletInstructions?.steps_en)?.map((step, i)=>(
                      <li key={i} className={`flex gap-3 ${isRTL?'flex-row-reverse':''}`}>
                        <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-black flex-shrink-0">{i+1}</div>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                  {/* Confirm with ref */}
                  <form onSubmit={handleConfirm}>
                    <label className="block text-sm font-black text-gray-800 mb-2">
                      {isRTL?'رقم العملية بعد الإرسال *':'Transaction number after sending *'}
                    </label>
                    <input type="text" className="input mb-4" dir="ltr" value={transferRef}
                      onChange={e=>setTransferRef(e.target.value)}
                      placeholder={isRTL?'مثال: ZC-123456789':'e.g. ZC-123456789'}/>
                    <button type="submit" disabled={loading||!transferRef.trim()||countdown===0}
                      className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Check className="w-5 h-5"/>}
                      {isRTL?'تأكيد الدفع وإتمام الطلب':'Confirm Payment & Place Order'}
                    </button>
                  </form>
                </div>
              )}

              {/* Card payment */}
              {(selectedMethod==='mastercard'||selectedMethod==='qi_card') && (
                <div className="card p-6">
                  <div className={`flex items-center gap-3 mb-5 ${isRTL?'flex-row-reverse':''}`}>
                    <span className="text-3xl">{method?.icon}</span>
                    <h3 className="font-display text-xl font-black">
                      {isRTL ? (selectedMethod==='mastercard'?'بيانات البطاقة':'بيانات كي كارد') : (selectedMethod==='mastercard'?'Card Details':'Qi Card Details')}
                    </h3>
                  </div>
                  <form onSubmit={handleConfirm} className="space-y-4">
                    {[
                      { key:'name', label:isRTL?'اسم حامل البطاقة':'Cardholder Name', ph:isRTL?'الاسم على البطاقة':'Name on card', type:'text', len:null },
                      { key:'number', label:isRTL?'رقم البطاقة':'Card Number', ph:'1234 5678 9012 3456', type:'text', len:19 },
                      { key:'expiry', label:isRTL?'تاريخ الانتهاء':'Expiry', ph:'MM/YY', type:'text', len:5 },
                      { key:'cvv',    label:'CVV', ph:'•••', type:'password', len:4 },
                    ].map(f=>(
                      <div key={f.key}>
                        <label className="block text-sm font-black text-gray-800 mb-1.5">{f.label}</label>
                        <input type={f.type} placeholder={f.ph} maxLength={f.len}
                          value={cardFields[f.key]||''} onChange={e=>setCardFields(c=>({...c,[f.key]:e.target.value}))}
                          className="input" dir="ltr" required/>
                      </div>
                    ))}
                    <button type="submit" disabled={loading||countdown===0}
                      className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Lock className="w-4 h-4"/>}
                      {isRTL?`ادفعي ${total.toLocaleString()} دينار`:`Pay ${total.toLocaleString()} IQD`}
                    </button>
                  </form>
                </div>
              )}

              {countdown===0 && (
                <div className={`flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl ${isRTL?'flex-row-reverse':''}`}>
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0"/>
                  <p className="text-red-700 font-bold text-sm">
                    {isRTL?'انتهت صلاحية الجلسة. يرجى البدء من جديد.':'Session expired. Please restart checkout.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Success ── */}
          {step===4 && (
            <div className="text-center py-16 animate-fade-in" dir={isRTL?'rtl':'ltr'}>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6
                shadow-[0_8px_30px_rgba(34,197,94,0.25)]">
                <Check className="w-12 h-12 text-green-500"/>
              </div>
              <h2 className="font-display text-3xl font-black text-gray-900 mb-3">{t('checkout_success_title')}</h2>
              <p className="text-gray-500 font-semibold mb-2">{t('checkout_success_desc')}</p>
              <p className="text-sm text-gray-400 font-semibold mb-8">
                {t('checkout_order_id')}: <span className="font-mono font-black text-pink-600">{orderId}</span>
              </p>
              <div className={`flex flex-col sm:flex-row gap-3 justify-center ${isRTL?'flex-row-reverse':''}`}>
                <Link to="/" className="btn-primary">{t('checkout_continue_shopping')}</Link>
                <Link to="/track-order" className="btn-secondary">{t('checkout_track')}</Link>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        {step < 4 && (
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <h3 className="font-display text-lg font-black mb-4">{t('order_summary')}</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(item=>(
                  <div key={`${item.product.id}-${item.size}`} className={`flex gap-3 ${isRTL?'flex-row-reverse':''}`}>
                    <div className="w-14 h-14 rounded-xl bg-pink-50 flex-shrink-0 overflow-hidden shadow-sm">
                      <img src={item.product.image||'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100'} className="w-full h-full object-cover" alt=""/>
                    </div>
                    <div className={`flex-1 min-w-0 ${isRTL?'text-right':''}`}>
                      <p className="text-sm font-black text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400 font-semibold">{t('qty')}: {item.quantity}{item.size?` · ${item.size}`:''}</p>
                      <p className="text-sm text-pink-600 font-black">{(item.product.price*item.quantity).toLocaleString()} {t('currency')}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-pink-100 pt-4 space-y-2.5">
                <div className={`flex justify-between text-sm font-semibold text-gray-600 ${isRTL?'flex-row-reverse':''}`}>
                  <span>{t('subtotal')}</span><span>{total.toLocaleString()} {t('currency')}</span>
                </div>
                <div className={`flex justify-between text-sm font-semibold text-gray-600 ${isRTL?'flex-row-reverse':''}`}>
                  <span>{t('delivery_fee')}</span>
                  <span className={deliveryFee===0?'text-green-600 font-black':''}>
                    {deliveryFee===0 ? t('free') : `${deliveryFee.toLocaleString()} ${t('currency')}`}
                  </span>
                </div>
                <div className={`flex justify-between font-display font-black text-lg pt-2 border-t border-pink-100 ${isRTL?'flex-row-reverse':''}`}>
                  <span>{t('total')}</span>
                  <span className="text-pink-600">{(total+deliveryFee).toLocaleString()} {t('currency')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
