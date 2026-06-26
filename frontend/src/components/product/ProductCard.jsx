import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Tag, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLang } from '../../context/LanguageContext';
import { useWishlist } from '../../pages/WishlistPage';
import toast from 'react-hot-toast';

const CATEGORY_PLACEHOLDERS = {
  clothes:'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=400&q=70',
  shoes:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=70',
  bags:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=70',
  foundation:'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=70',
  other:'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=70',
};

export default function ProductCard({ product }) {
  const [adding, setAdding] = useState(false);
  const { addItem }         = useCart();
  const { t, isRTL }        = useLang();
  const { toggle, isWished } = useWishlist();
  const wished               = isWished(product.id);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (adding || product.quantity === 0) return;
    setAdding(true);
    addItem(product, 1, product.sizes?.[0] || null, product.colors?.[0] || null);
    toast.success(isRTL ? `أُضيف ${product.name} للسلة 🛍️` : `${product.name} added! 🛍️`, {
      style: { border: '1px solid #fda4af', fontWeight: 600 },
      iconTheme: { primary: '#ec4899', secondary: '#fff' },
    });
    setTimeout(() => setAdding(false), 700);
  };

  const handleWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggle(product);
    toast(isRTL
      ? (!wished ? '❤️ أُضيف للمفضلة' : '💔 حُذف من المفضلة')
      : (!wished ? '❤️ Added to wishlist' : '💔 Removed from wishlist'),
      { style: { fontWeight: 600 } }
    );
  };

  const imgSrc = product.image
    ? `${product.image}`
    : CATEGORY_PLACEHOLDERS[product.category] || CATEGORY_PLACEHOLDERS.other;

  return (
    <Link to={`/product/${product.id}`} className="card group block" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Image ── */}
      <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-gray-50 product-img-wrap">
        <img src={imgSrc} alt={product.name}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = CATEGORY_PLACEHOLDERS.other; }} />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className={`absolute top-3 flex flex-col gap-1.5 ${isRTL ? 'right-3' : 'left-3'}`}>
          {discount && (
            <span className="badge bg-pink-500 text-white shadow-lg shadow-pink-200 animate-fade-in">
              -{discount}%
            </span>
          )}
          {product.quantity <= 5 && product.quantity > 0 && (
            <span className="badge bg-orange-100 text-orange-700 border border-orange-200">
              {t('only_left').replace('{n}', product.quantity)}
            </span>
          )}
          {product.quantity === 0 && (
            <span className="badge bg-gray-100 text-gray-500">{t('out_of_stock')}</span>
          )}
        </div>

        {/* Wishlist btn */}
        <button onClick={handleWish}
          className={`absolute top-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm
            flex items-center justify-center shadow-md
            hover:scale-110 hover:shadow-lg active:scale-95
            transition-all duration-200 z-10 ${isRTL ? 'left-3' : 'right-3'}`}>
          <Heart className={`w-4 h-4 transition-all duration-200
            ${wished ? 'fill-pink-500 text-pink-500 scale-110' : 'text-gray-400 hover:text-pink-400'}`} />
        </button>

        {/* Bottom action buttons — slide up on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3
          translate-y-full group-hover:translate-y-0
          transition-transform duration-300 ease-out flex gap-2">
          <button onClick={handleAdd} disabled={product.quantity === 0 || adding}
            className="flex-1 bg-white/95 backdrop-blur-sm text-pink-600 font-bold text-sm
              py-2.5 rounded-xl flex items-center justify-center gap-1.5
              hover:bg-pink-500 hover:text-white active:scale-95
              transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            <ShoppingBag className="w-4 h-4" />
            {adding ? (isRTL ? '✓' : '✓') : t('quick_add')}
          </button>
          <Link to={`/product/${product.id}`}
            onClick={e => e.stopPropagation()}
            className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center
              text-gray-500 hover:bg-gray-800 hover:text-white active:scale-95
              transition-all duration-200 shadow-lg flex-shrink-0">
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1
          group-hover:text-pink-600 transition-colors duration-200">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 font-semibold capitalize mb-2.5 flex items-center gap-1">
          <Tag className="w-3 h-3" />{product.type}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-pink-600 text-base">
              {product.price.toLocaleString()} {t('currency')}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through font-medium">
                {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          {product.colors?.length > 0 && (
            <div className="flex gap-1">
              {product.colors.slice(0, 3).map((c, i) => (
                <div key={i} className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
                  style={{ backgroundColor:
                    c.toLowerCase() === 'pink' ? '#ec4899' :
                    c.toLowerCase() === 'white' || c.toLowerCase() === 'ivory' ? '#f9fafb' :
                    c.toLowerCase().includes('blue') ? '#93c5fd' :
                    c.toLowerCase() === 'black' ? '#1f2937' :
                    c.toLowerCase() === 'gold' || c.toLowerCase() === 'rose gold' ? '#C9A84C' :
                    c.toLowerCase() === 'beige' || c.toLowerCase() === 'nude' ? '#d4b896' :
                    '#d1d5db'
                  }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
