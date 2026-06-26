import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Check, Truck, RotateCcw, Star, Minus, Plus, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import { getProduct, getProducts } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from './WishlistPage';
import { useLang } from '../context/LanguageContext';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';

const IMG_PLACEHOLDER = {
  clothes:'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=700&q=80',
  shoes:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
  bags:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=80',
  foundation:'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=700&q=80',
  other:'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=80',
};
const CAT_AR = { clothes:'الملابس', shoes:'الأحذية', bags:'الحقائب', foundation:'التجميل', other:'الإكسسوارات' };

export default function ProductPage() {
  const { id } = useParams();
  const [product,       setProduct]       = useState(null);
  const [related,       setRelated]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedSize,  setSelectedSize]  = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity,      setQuantity]      = useState(1);
  const [adding,        setAdding]        = useState(false);
  const { addItem }                       = useCart();
  const { toggle, isWished }              = useWishlist();
  const { t, isRTL }                      = useLang();

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then(r => {
        const p = r.data;
        setProduct(p);
        setSelectedSize(p.sizes?.[0] || null);
        setSelectedColor(p.colors?.[0] || null);
        // fetch related
        return getProducts({ category: p.category });
      })
      .then(r => setRelated(r.data.filter(p => p.id !== id).slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-3xl skeleton"/>
        <div className="space-y-5 pt-4">
          {[...Array(6)].map((_,i) => (
            <div key={i} className={`h-${i===0?'8':i===1?'6':'4'} rounded-xl skeleton ${i>2?'w-2/3':''}`}/>
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="text-7xl mb-5">😔</div>
      <h2 className="font-display text-2xl font-black mb-4">
        {isRTL ? 'المنتج غير موجود' : 'Product not found'}
      </h2>
      <Link to="/" className="btn-primary">{isRTL ? 'الرئيسية' : 'Go Home'}</Link>
    </div>
  );

  const handleAddToCart = () => {
    if (adding) return;
    if (product.sizes?.length && !selectedSize)  { toast.error(isRTL ? 'اختاري مقاساً' : 'Please select a size');  return; }
    if (product.colors?.length && !selectedColor) { toast.error(isRTL ? 'اختاري لوناً'  : 'Please select a color'); return; }
    setAdding(true);
    addItem(product, quantity, selectedSize, selectedColor);
    toast.success(isRTL ? 'أُضيف للسلة! 🛍️' : 'Added to cart! 🛍️', {
      style: { border: '1px solid #fda4af', fontWeight:700 }
    });
    setTimeout(() => setAdding(false), 600);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).catch(()=>{});
      toast.success(isRTL ? 'تم نسخ الرابط!' : 'Link copied!');
    }
  };

  const imgSrc   = product.image || IMG_PLACEHOLDER[product.category] || IMG_PLACEHOLDER.other;
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
  const wished   = isWished(product.id);
  const catLabel = isRTL ? (CAT_AR[product.category] || product.category) : product.category;
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // colour lookup
  const colorHex = (c) => ({
    pink:'#ec4899', white:'#f9fafb', ivory:'#fffff0', blue:'#93c5fd', 'baby blue':'#93c5fd',
    black:'#1f2937', gold:'#C9A84C', 'rose gold':'#C9A84C', beige:'#d4b896', nude:'#d4b896',
    red:'#ef4444', green:'#22c55e', purple:'#a855f7', silver:'#94a3b8',
  })[c?.toLowerCase()] || '#d1d5db';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Breadcrumb */}
      <div className={`flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap
        ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
        <Link to="/" className="hover:text-pink-500 font-semibold transition-colors">{t('home')}</Link>
        <span>/</span>
        <Link to={`/category/${product.category}`} className="hover:text-pink-500 font-semibold capitalize transition-colors">{catLabel}</Link>
        <span>/</span>
        <span className="text-gray-600 font-semibold truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-16">

        {/* ── Image ── */}
        <div className="relative">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-pink-50 to-gray-50 product-img-wrap shadow-lg">
            <img src={imgSrc} alt={product.name}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = IMG_PLACEHOLDER.other; }}/>
          </div>

          {/* Discount badge */}
          {discount && (
            <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}
              bg-pink-500 text-white text-sm font-black px-3 py-1.5 rounded-full
              shadow-pink-sm`}>
              -{discount}%
            </div>
          )}

          {/* Action buttons */}
          <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} flex flex-col gap-2`}>
            <button onClick={() => toggle(product)}
              className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center
                hover:scale-110 active:scale-90 transition-all duration-200">
              <Heart className={`w-5 h-5 transition-all duration-200
                ${wished ? 'fill-pink-500 text-pink-500 scale-110' : 'text-gray-400'}`}/>
            </button>
            <button onClick={handleShare}
              className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center
                hover:scale-110 active:scale-90 transition-all duration-200 text-gray-400 hover:text-pink-500">
              <Share2 className="w-5 h-5"/>
            </button>
          </div>

          {/* Out of stock overlay */}
          {product.quantity === 0 && (
            <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center">
              <span className="bg-white text-gray-800 font-black px-6 py-3 rounded-full text-lg shadow-xl">
                {isRTL ? 'نفد المخزون' : 'Out of Stock'}
              </span>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="animate-fade-in flex flex-col">
          <span className="text-xs text-pink-500 font-black uppercase tracking-widest mb-2 block">
            {product.type}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">
            {product.name}
          </h1>

          {/* Stars */}
          <div className={`flex items-center gap-2 mb-5 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <div className="flex">
              {[...Array(5)].map((_,i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400"/>
              ))}
            </div>
            <span className="text-sm text-gray-400 font-semibold">(128 {t('reviews')})</span>
          </div>

          {/* Price */}
          <div className={`flex items-baseline gap-3 mb-6 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <span className="font-display text-4xl font-black text-pink-600">
              {product.price.toLocaleString()} {t('currency')}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through font-semibold">
                {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed font-medium mb-6">{product.description}</p>

          <div className="flex-1 space-y-5">
            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-black text-gray-900 text-sm">{t('size_label')}</h3>
                  <button className="text-xs text-pink-500 font-black hover:underline">{t('size_guide')}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-12 px-3 rounded-xl border-2 text-sm font-black
                        transition-all duration-200 active:scale-90
                        ${selectedSize === size
                          ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-pink-sm'
                          : 'border-gray-200 text-gray-600 hover:border-pink-300'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <h3 className="font-black text-gray-900 text-sm mb-3">
                  {t('color_label')}: <span className="text-pink-600 font-semibold">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-bold
                        transition-all duration-200 active:scale-90
                        ${selectedColor === color
                          ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm'
                          : 'border-gray-200 text-gray-500 hover:border-pink-300'}`}>
                      <span className="w-4 h-4 rounded-full border border-gray-200 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: colorHex(color) }}/>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="font-black text-gray-900 text-sm">{t('quantity_label')}</h3>
                <span className="text-xs text-gray-400 font-semibold">
                  {product.quantity} {t('in_stock')}
                </span>
              </div>
              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <div className="flex items-center border-2 border-pink-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))}
                    className="px-4 py-3 hover:bg-pink-50 text-gray-600 transition-colors active:bg-pink-100">
                    <Minus className="w-4 h-4"/>
                  </button>
                  <span className="px-5 py-3 font-black text-gray-900 min-w-[3.5rem] text-center">
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(q => Math.min(product.quantity, q+1))}
                    className="px-4 py-3 hover:bg-pink-50 text-gray-600 transition-colors active:bg-pink-100">
                    <Plus className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className={`flex gap-3 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button onClick={handleAddToCart}
              disabled={product.quantity === 0 || adding}
              className="flex-1 btn-primary py-4 flex items-center justify-center gap-2 text-base
                disabled:opacity-50 disabled:cursor-not-allowed">
              {adding
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                : <ShoppingBag className="w-5 h-5"/>}
              {product.quantity === 0
                ? (isRTL ? 'نفد المخزون' : 'Out of Stock')
                : adding
                  ? (isRTL ? 'تمت الإضافة!' : 'Added!')
                  : t('add_to_cart')}
            </button>
            <Link to="/checkout" onClick={() => { if (product.quantity > 0) addItem(product, quantity, selectedSize, selectedColor); }}
              className="btn-secondary py-4 px-6 text-base font-black">
              {t('buy_now')}
            </Link>
          </div>

          {/* Perks */}
          <div className="mt-6 space-y-2.5 border-t border-pink-100 pt-5">
            {[
              { icon: Truck,      text: t('free_delivery') },
              { icon: RotateCcw,  text: t('easy_returns') },
              { icon: Check,      text: t('authentic') },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className={`flex items-center gap-3 text-sm text-gray-500 font-semibold
                ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-pink-400"/>
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile sticky add-to-cart ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden
        bg-white/95 backdrop-blur-xl border-t border-pink-100
        px-4 py-3 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button onClick={() => toggle(product)}
          className="w-12 h-12 rounded-xl border-2 border-pink-200 flex items-center justify-center flex-shrink-0 active:scale-90 transition-all">
          <Heart className={`w-5 h-5 ${wished ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`}/>
        </button>
        <button onClick={handleAddToCart}
          disabled={product.quantity === 0 || adding}
          className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50">
          {adding
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            : <ShoppingBag className="w-5 h-5"/>}
          {product.quantity === 0 ? (isRTL ? 'نفد' : 'Out of Stock') : t('add_to_cart')}
        </button>
      </div>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <section className="pb-20 md:pb-8">
          <h2 className="section-title mb-6">
            {isRTL ? 'منتجات مشابهة' : 'You Might Also Like'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p}/>)}
          </div>
        </section>
      )}
    </div>
  );
}
