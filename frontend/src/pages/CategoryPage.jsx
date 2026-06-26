import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { getProducts, getCategories } from '../api';
import ProductCard from '../components/product/ProductCard';
import { useLang } from '../context/LanguageContext';

export default function CategoryPage() {
  const { category }  = useParams();
  const location      = useLocation();
  const { t, isRTL }  = useLang();
  const searchQ       = new URLSearchParams(location.search).get('q') || '';
  const cat           = category || 'all';

  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters,     setFilters]     = useState({
    type: '', minPrice: '', maxPrice: '', sort: '', search: searchQ
  });

  // Load dynamic categories once
  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(console.error);
  }, []);

  // Current category object
  const catObj = categories.find(c => c.id === cat);

  const catLabel = catObj
    ? (isRTL ? catObj.nameAr : catObj.nameEn)
    : cat === 'all'
      ? (isRTL ? 'جميع المنتجات' : 'All Products')
      : cat;

  const catImage = catObj?.image || null;
  const typeOptions = catObj?.types || [];

  const SORT_OPTIONS = [
    { value: '',           label: t('sort_recommended') },
    { value: 'newest',     label: t('sort_newest') },
    { value: 'price_asc',  label: t('sort_price_asc') },
    { value: 'price_desc', label: t('sort_price_desc') },
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...(cat !== 'all' && { category: cat }),
        ...filters,
      };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await getProducts(params);
      setProducts(data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [cat, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setFilters(f => ({ ...f, search: searchQ })); }, [searchQ]);

  const clearFilters = () => setFilters({ type: '', minPrice: '', maxPrice: '', sort: '', search: '' });

  // Banner gradient color per category (fallback if no image)
  const BANNER_CLASSES = {
    clothes: 'cat-clothes', shoes: 'cat-shoes', bags: 'cat-bags',
    foundation: 'cat-foundation', other: 'cat-other',
  };
  const bannerCls = BANNER_CLASSES[cat] || 'bg-gradient-to-r from-pink-100 to-sky-100';

  const typeLabel = (tp) => {
    const key = `type_${tp.toLowerCase().replace(/[\s-]/g, '_')}`;
    return isRTL ? t(key) : tp;
  };

  const FilterPanel = () => (
    <div className="space-y-5">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h2 className="font-black text-gray-900 text-sm">{t('filters')}</h2>
        <button onClick={clearFilters} className="text-xs text-pink-500 hover:underline font-bold">{t('clear_all')}</button>
      </div>

      {/* Type filter */}
      {typeOptions.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-gray-800 mb-3">{t('type_label')}</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters(f => ({ ...f, type: '' }))}
              className={`btn-outline text-xs ${!filters.type ? 'border-pink-400 text-pink-600 bg-pink-50' : ''}`}>
              {isRTL ? 'الكل' : 'All'}
            </button>
            {typeOptions.map(tp => (
              <button key={tp}
                onClick={() => setFilters(f => ({ ...f, type: f.type === tp ? '' : tp }))}
                className={`btn-outline text-xs ${filters.type === tp ? 'border-pink-400 text-pink-600 bg-pink-50' : ''}`}>
                {typeLabel(tp)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div>
        <h3 className="text-sm font-black text-gray-800 mb-3">{t('price_label')}</h3>
        <div className="flex gap-2">
          <input type="number" placeholder={isRTL ? 'أدنى' : 'Min'}
            value={filters.minPrice}
            onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
            className="input text-sm py-2 px-3" dir="ltr"/>
          <input type="number" placeholder={isRTL ? 'أعلى' : 'Max'}
            value={filters.maxPrice}
            onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
            className="input text-sm py-2 px-3" dir="ltr"/>
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-sm font-black text-gray-800 mb-3">{t('sort_by')}</h3>
        {SORT_OPTIONS.map(o => (
          <button key={o.value}
            onClick={() => setFilters(f => ({ ...f, sort: o.value }))}
            className={`block w-full text-sm px-3 py-2.5 rounded-xl transition-colors font-semibold
              ${isRTL ? 'text-right' : 'text-left'}
              ${filters.sort === o.value
                ? 'bg-pink-50 text-pink-600 font-black'
                : 'text-gray-500 hover:bg-pink-50'}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Banner ── */}
      <div className={`relative rounded-3xl overflow-hidden mb-8 h-36 sm:h-44 ${!catImage ? bannerCls : ''}`}>
        {catImage && (
          <>
            <img src={catImage} alt={catLabel}
              className="absolute inset-0 w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent"/>
          </>
        )}
        <div className={`relative h-full flex items-center px-8 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className={`font-display text-3xl sm:text-4xl font-black mb-1
              ${catImage ? 'text-white drop-shadow-lg' : 'text-gray-900'}`}>
              {searchQ ? `${t('search_results')}: "${searchQ}"` : catLabel}
            </h1>
            <p className={`text-sm font-semibold
              ${catImage ? 'text-white/80' : 'text-gray-500'}`}>
              {products.length} {t('items_found')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-6">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <FilterPanel/>
          </div>
        </aside>

        <div className="flex-1 min-w-0">

          {/* ── Mobile top controls ── */}
          <div className="flex items-center gap-3 mb-5 lg:hidden">
            <button onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-2 btn-outline text-sm">
              <SlidersHorizontal className="w-4 h-4"/>
              {t('filters')}
            </button>
            <select value={filters.sort}
              onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
              className="flex-1 input text-sm py-2">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Mobile filter panel */}
          {showFilters && (
            <div className="lg:hidden card p-5 mb-5 animate-slide-up">
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-black text-gray-900">{t('filters')}</span>
                <button onClick={() => setShowFilters(false)} className="p-1 rounded-lg hover:bg-pink-50">
                  <X className="w-4 h-4"/>
                </button>
              </div>
              <FilterPanel/>
            </div>
          )}

          {/* ── Desktop top bar ── */}
          <div className={`hidden lg:flex items-center justify-between mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <p className="text-sm text-gray-500 font-semibold">
              {products.length} {t('products_count')}
            </p>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-gray-500 font-semibold">{t('sort_by')}:</span>
              <select value={filters.sort}
                onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                className="border-2 border-gray-200 rounded-xl text-sm px-3 py-1.5
                  focus:outline-none focus:border-pink-400 font-semibold">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* ── Product grid ── */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_,i) => (
                <div key={i} className="card skeleton">
                  <div className="aspect-square bg-pink-100 rounded-2xl"/>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-pink-100 rounded-lg"/>
                    <div className="h-3 bg-pink-100 rounded-lg w-2/3"/>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display text-xl font-black text-gray-700 mb-2">{t('no_products')}</h3>
              <p className="text-gray-400 font-semibold mb-6">{t('no_products_desc')}</p>
              <button onClick={clearFilters} className="btn-primary">{t('clear_filters')}</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
