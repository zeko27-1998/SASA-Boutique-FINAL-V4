import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';

const IMG_FALLBACK = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&q=60';

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total, clearCart } = useCart();
  const { t, isRTL } = useLang();

  const deliveryFee = total >= 100000 ? 0 : 5000;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 h-full w-full max-w-[420px] bg-white z-50 flex flex-col
          shadow-[0_0_60px_rgba(0,0,0,0.15)] animate-slide-up
          ${isRTL ? 'left-0' : 'right-0'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* ── Header ── */}
        <div className={`flex items-center justify-between px-5 py-4 border-b border-pink-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-pink-500"/>
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-base">{t('cart_title')}</h2>
              <p className="text-xs text-gray-400 font-semibold">
                {items.length} {t('cart_items')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="icon-btn text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* ── Free delivery progress bar ── */}
        {items.length > 0 && total < 100000 && (
          <div className="px-5 py-3 bg-gradient-to-r from-pink-50 to-pink-50/0 border-b border-pink-100">
            <div className={`flex items-center justify-between mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p className="text-xs font-bold text-pink-600">
                {isRTL
                  ? `أضيفي ${(100000 - total).toLocaleString()} دينار للتوصيل المجاني`
                  : `Add ${(100000 - total).toLocaleString()} IQD for free delivery`}
              </p>
              <Sparkles className="w-3.5 h-3.5 text-pink-400"/>
            </div>
            <div className="h-1.5 bg-pink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full
                  transition-all duration-500"
                style={{ width: `${Math.min(100, (total / 100000) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {items.length > 0 && total >= 100000 && (
          <div className={`flex items-center gap-2 px-5 py-2.5 bg-green-50 border-b border-green-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Sparkles className="w-4 h-4 text-green-500"/>
            <p className="text-xs font-black text-green-700">
              {isRTL ? '🎉 يمكنكِ الاستمتاع بالتوصيل المجاني!' : '🎉 You qualify for free delivery!'}
            </p>
          </div>
        )}

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-10">
              <div className="w-24 h-24 rounded-2xl bg-pink-50 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-pink-200"/>
              </div>
              <div>
                <p className="font-black text-gray-700 text-lg mb-1">{t('cart_empty')}</p>
                <p className="text-sm text-gray-400 font-semibold">{t('cart_empty_desc')}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-primary">
                {t('cart_continue')}
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={`${item.product.id}-${item.size}-${item.color}`}
                className={`flex gap-3 p-3 bg-pink-50/60 rounded-2xl hover:bg-pink-50
                  transition-colors duration-200 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm">
                  <img
                    src={item.product.image || IMG_FALLBACK}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = IMG_FALLBACK; }}
                  />
                </div>

                {/* Details */}
                <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                  <h4 className="font-black text-sm text-gray-900 truncate mb-0.5">
                    {item.product.name}
                  </h4>
                  <div className={`flex flex-wrap gap-2 mb-1.5 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                    {item.size  && <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded-md font-semibold text-gray-500">{t('cart_size')}: {item.size}</span>}
                    {item.color && <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded-md font-semibold text-gray-500">{t('cart_color')}: {item.color}</span>}
                  </div>
                  <p className="font-black text-pink-600 text-sm">
                    {(item.product.price * item.quantity).toLocaleString()} {t('currency')}
                  </p>

                  {/* Quantity + remove */}
                  <div className={`flex items-center gap-2 mt-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                    <div className="flex items-center border-2 border-pink-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                        className="px-2.5 py-1 hover:bg-pink-100 text-gray-500 transition-colors active:bg-pink-200">
                        <Minus className="w-3 h-3"/>
                      </button>
                      <span className="px-3 text-sm font-black text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                        className="px-2.5 py-1 hover:bg-pink-100 text-gray-500 transition-colors active:bg-pink-200">
                        <Plus className="w-3 h-3"/>
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.size, item.color)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300
                        hover:text-red-400 transition-all duration-200 active:scale-90">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-pink-100 space-y-3 bg-white">
            {/* Subtotal */}
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm font-semibold text-gray-500">{t('cart_subtotal')}</span>
              <span className="font-semibold text-gray-700">
                {total.toLocaleString()} {t('currency')}
              </span>
            </div>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm font-semibold text-gray-500">
                {isRTL ? 'التوصيل' : 'Delivery'}
              </span>
              <span className={`font-black text-sm ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                {deliveryFee === 0
                  ? (isRTL ? '🎉 مجاني' : '🎉 Free')
                  : `${deliveryFee.toLocaleString()} ${t('currency')}`}
              </span>
            </div>

            {/* Total */}
            <div className={`flex items-center justify-between pt-2 border-t border-pink-100
              ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="font-black text-gray-900">{t('total')}</span>
              <span className="font-display text-xl font-black text-pink-600">
                {(total + deliveryFee).toLocaleString()} {t('currency')}
              </span>
            </div>

            <p className="text-xs text-center text-gray-400 font-semibold">{t('cart_shipping')}</p>

            {/* Checkout button */}
            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className={`btn-primary w-full text-center py-3.5 text-base flex items-center justify-center gap-2
                ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {t('cart_checkout')}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`}/>
            </Link>

            <button
              onClick={clearCart}
              className="w-full text-xs text-gray-400 font-bold hover:text-red-400
                transition-colors py-1 text-center">
              {t('cart_clear')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
