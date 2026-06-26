import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

// Wishlist is stored in a simple global in-memory list for the session
// (In production this would be tied to user account)
import { useState, useEffect, createContext, useContext } from 'react';

export const WishlistContext = createContext(null);
export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sasa_wishlist') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('sasa_wishlist', JSON.stringify(items)); }, [items]);

  const toggle = (product) => {
    setItems(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      return [...prev, product];
    });
  };
  const isWished = (id) => items.some(p => p.id === id);
  const remove = (id) => setItems(prev => prev.filter(p => p.id !== id));

  return (
    <WishlistContext.Provider value={{ items, toggle, isWished, remove }}>
      {children}
    </WishlistContext.Provider>
  );
}
export const useWishlist = () => useContext(WishlistContext);

const CATEGORY_PLACEHOLDERS = {
  clothes: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=300&q=60',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=60',
  bags: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&q=60',
  foundation: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&q=60',
  other: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&q=60',
};

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const { addItem } = useCart();
  const { isRTL, t } = useLang();

  const handleAddToCart = (product) => {
    addItem(product, 1, product.sizes?.[0] || null, product.colors?.[0] || null);
    toast.success(isRTL ? 'تمت الإضافة للسلة! 🛍️' : 'Added to cart! 🛍️', {
      style: { border: '1px solid #fda4af' }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center">
          <Heart className="w-6 h-6 text-pink-500 fill-pink-200" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            {isRTL ? 'المفضلة' : 'My Wishlist'}
          </h1>
          <p className="text-gray-400 text-sm">{items.length} {isRTL ? 'منتج محفوظ' : 'saved items'}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-pink-200" />
          </div>
          <h2 className="font-display text-2xl text-gray-600 mb-3">
            {isRTL ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
          </h2>
          <p className="text-gray-400 mb-8 max-w-sm">
            {isRTL
              ? 'أضيفي المنتجات التي تعجبكِ إلى المفضلة بالضغط على أيقونة القلب'
              : 'Save items you love by tapping the heart icon on any product'}
          </p>
          <Link to="/" className="btn-primary">
            {isRTL ? 'ابدئي التسوق' : 'Start Shopping'}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {items.map(product => {
              const discount = product.originalPrice
                ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
              const imgSrc = product.image
                ? `${product.image}`
                : CATEGORY_PLACEHOLDERS[product.category] || CATEGORY_PLACEHOLDERS.other;

              return (
                <div key={product.id} className="card group relative">
                  {/* Remove btn */}
                  <button
                    onClick={() => remove(product.id)}
                    className={`absolute top-3 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>

                  <Link to={`/product/${product.id}`}>
                    <div className="relative aspect-square bg-pink-50 overflow-hidden">
                      <img src={imgSrc} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.src = CATEGORY_PLACEHOLDERS.other; }} />
                      {discount && (
                        <span className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} badge bg-pink-500 text-white text-xs px-2 py-1`}>-{discount}%</span>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-2 capitalize">
                        <Tag className="w-3 h-3" />{product.type}
                      </p>
                    </Link>
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="font-semibold text-pink-600">{product.price.toLocaleString()} {t('currency')}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity === 0}
                      className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {product.quantity === 0
                        ? (isRTL ? 'نفد المخزون' : 'Out of Stock')
                        : (isRTL ? 'أضيفي للسلة' : 'Add to Cart')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Move all to cart */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                items.forEach(p => addItem(p, 1, p.sizes?.[0] || null, p.colors?.[0] || null));
                toast.success(isRTL ? 'تمت إضافة جميع المنتجات للسلة! 🛍️' : 'All items added to cart! 🛍️');
              }}
              className="btn-secondary flex items-center gap-2 hover:bg-pink-500 hover:text-white hover:border-pink-500"
            >
              <ShoppingBag className="w-4 h-4" />
              {isRTL ? 'إضافة الكل للسلة' : 'Add All to Cart'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
