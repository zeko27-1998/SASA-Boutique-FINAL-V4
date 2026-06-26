import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TruckIcon, ShieldCheck, RefreshCw, Star } from 'lucide-react';
import { getProducts, getCategories } from '../api';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/ui/CategoryCard';
import { useLang } from '../context/LanguageContext';

function GradientTitle({ text }) {
  const isArabic = /[\u0600-\u06FF\u0750-\u077F]/.test(text);

  if (isArabic) {
    return (
      <span
        className="block bg-gradient-to-r from-pink-500 via-pink-400 to-pink-300 bg-clip-text text-transparent leading-snug"
        style={{
          fontFamily: "'Cairo', 'Tajawal', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
          paddingBottom: '0.25em',
        }}
      >
        {text}
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 600 130"
      className="w-full"
      preserveAspectRatio="xMinYMin meet"
      aria-label={text}
      role="img"
    >
      <defs>
        <linearGradient id="hero-pink" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e84c8a" />
          <stop offset="55%" stopColor="#f072a3" />
          <stop offset="100%" stopColor="#f7a8c7" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="78"
        fill="url(#hero-pink)"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight="900"
        fontSize="76"
      >
        {text}
      </text>
    </svg>
  );
}

export default function Home() {
  const { t, isRTL } = useLang();
  const [featured,   setFeatured]   = useState([]);
  const [newest,     setNewest]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [newLoading, setNewLoading] = useState(true);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(console.error);
    getProducts({ featured:true }).then(r => setFeatured(r.data.slice(0,8))).catch(console.error).finally(()=>setLoading(false));
    getProducts({ sort:'newest' }).then(r => setNewest(r.data.slice(0,8))).catch(console.error).finally(()=>setNewLoading(false));
  }, []);

  const PERKS = [
    { icon:TruckIcon,   title:t('perk_delivery'),  desc:t('perk_delivery_desc') },
    { icon:ShieldCheck, title:t('perk_secure'),    desc:t('perk_secure_desc') },
    { icon:RefreshCw,   title:t('perk_returns'),   desc:t('perk_returns_desc') },
    { icon:Star,        title:t('perk_quality'),   desc:t('perk_quality_desc') },
  ];

  const SkeletonGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_,i)=>(
        <div key={i} className="card skeleton">
          <div className="aspect-square bg-pink-100"/>
          <div className="p-4 space-y-2">
            <div className="h-4 bg-pink-100 rounded"/>
            <div className="h-3 bg-pink-100 rounded w-2/3"/>
            <div className="h-4 bg-pink-100 rounded w-1/2"/>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-pink-50 via-cream to-sky-50 min-h-[88vh] flex items-center overflow-visible">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-10 right-10 w-96 h-96 bg-pink-200 rounded-full opacity-25 blur-3xl"/>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-baby-200 rounded-full opacity-25 blur-3xl"/>
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-pink-100 rounded-full opacity-20 blur-2xl"/>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-pink-600 text-sm font-bold
              px-4 py-1.5 rounded-full border border-pink-200 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4"/>
              {t('hero_badge')}
            </div>
            <h1 className="font-display leading-tight mb-6">
              <span className="block text-gray-900 text-5xl sm:text-6xl lg:text-7xl font-black">{t('hero_title_1')}</span>
              <GradientTitle text={t('hero_title_2')} />
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed font-semibold mb-8 max-w-md">{t('hero_desc')}</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/category/clothes" className="btn-primary flex items-center gap-2 text-base px-7 py-3">
                {t('hero_shop_now')}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180':''}`}/>
              </Link>
              <Link to="/category/foundation" className="btn-secondary flex items-center gap-2 text-base px-7 py-3">
                {t('hero_beauty_edit')} <Sparkles className="w-4 h-4"/>
              </Link>
            </div>
            <div className={`flex gap-10 mt-12 ${isRTL ? 'flex-row-reverse justify-end':''}`}>
              {[['500+',t('hero_stat_products')],['10K+',t('hero_stat_customers')],['4.9★',t('hero_stat_rating')]].map(([val,label])=>(
                <div key={label}>
                  <div className="font-display text-3xl font-black text-gray-900">{val}</div>
                  <div className="text-sm text-gray-500 font-semibold mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image collage */}
          <div className="relative hidden md:block">
            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="space-y-3">
                <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80" alt="Fashion"
                  className="w-full h-52 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"/>
                <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80" alt="Bags"
                  className="w-full h-36 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"/>
              </div>
              <div className="space-y-3 mt-8">
                <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&q=80" alt="Shoes"
                  className="w-full h-36 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"/>
                <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80" alt="Beauty"
                  className="w-full h-52 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"/>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 glass rounded-2xl px-5 py-3 shadow-xl
              flex items-center gap-3 animate-float border border-pink-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-md">
                <span className="text-white text-lg">🛍️</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold">{isRTL ? 'هذا الأسبوع':'This week'}</p>
                <p className="text-sm font-black text-gray-900">200+ {t('hero_floating')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERKS ── */}
      <section className="bg-white border-y border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {PERKS.map(({ icon:Icon, title, desc })=>(
            <div key={title} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors duration-200 ${isRTL?'flex-row-reverse':''}`}>
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon className="w-5 h-5 text-pink-400"/>
              </div>
              <div>
                <p className="font-black text-sm text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 font-semibold">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className={`flex items-end justify-between mb-8 ${isRTL ? 'flex-row-reverse':''}`}>
          <div>
            <div className={`flex items-center gap-3 mb-2 ${isRTL?'flex-row-reverse':''}`}>
              <h2 className="section-title">{t('new_arrivals_title')}</h2>
              <span className="inline-flex items-center gap-1 bg-pink-500 text-white text-xs font-black
                px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(236,72,153,0.4)]">
                ✨ {t('new_arrivals_badge')}
              </span>
            </div>
            <p className="text-gray-500 text-sm font-semibold">{t('new_arrivals_desc')}</p>
          </div>
          <Link to="/category/all?sort=newest" className="btn-outline flex items-center gap-1 text-sm flex-shrink-0">
            {t('view_all')} <ArrowRight className={`w-4 h-4 ${isRTL?'rotate-180':''}`}/>
          </Link>
        </div>
        {/* Mobile horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:hidden scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
          {newLoading ? [...Array(4)].map((_,i)=>(
            <div key={i} className="w-48 flex-shrink-0 snap-start card animate-pulse">
              <div className="aspect-square bg-pink-100"/>
              <div className="p-3 space-y-2"><div className="h-3 bg-pink-100 rounded"/><div className="h-3 bg-pink-100 rounded w-2/3"/></div>
            </div>
          )) : newest.map(p=>(
            <div key={p.id} className="w-52 flex-shrink-0 snap-start"><ProductCard product={p}/></div>
          ))}
        </div>
        {/* Desktop grid */}
        <div className="hidden md:block">
          {newLoading ? <SkeletonGrid/> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {newest.map(p=><ProductCard key={p.id} product={p}/>)}
            </div>
          )}
        </div>
      </section>

      {/* ── CATEGORIES — photo cards ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-14">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">{t('cat_title')}</h2>
          <p className="text-gray-500 font-semibold">{t('cat_desc')}</p>
        </div>
        {categories.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_,i)=>(
              <div key={i} className="aspect-square rounded-2xl bg-pink-100 animate-pulse"/>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat,i)=>(
              <CategoryCard key={cat.id} cat={cat} index={i}/>
            ))}
          </div>
        )}
      </section>

      {/* ── FEATURED ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-14">
        <div className={`flex items-end justify-between mb-8 ${isRTL ? 'flex-row-reverse':''}`}>
          <div>
            <h2 className="section-title mb-2">{t('featured_title')}</h2>
            <p className="text-gray-500 text-sm font-semibold">{t('featured_desc')}</p>
          </div>
          <Link to="/category/all" className="btn-outline flex items-center gap-1 text-sm flex-shrink-0">
            {t('view_all')} <ArrowRight className={`w-4 h-4 ${isRTL?'rotate-180':''}`}/>
          </Link>
        </div>
        {loading ? <SkeletonGrid/> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p=><ProductCard key={p.id} product={p}/>)}
          </div>
        )}
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl
          bg-gradient-to-r from-pink-600 via-pink-500 to-pink-400
          p-8 md:p-14 text-white
          shadow-[0_20px_60px_rgba(236,72,153,0.35)]">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full pointer-events-none"/>
          <div className="absolute -bottom-10 left-1/4 w-40 h-40 bg-white/10 rounded-full pointer-events-none"/>
          <div className={`relative flex flex-col md:flex-row items-center justify-between gap-8 ${isRTL?'md:flex-row-reverse':''}`}>
            <div className={isRTL?'text-right':''}>
              <p className="text-pink-200 text-sm font-black mb-2 tracking-widest uppercase">{t('promo_limited')}</p>
              <h2 className="font-display text-4xl md:text-5xl font-black mb-3">{t('promo_title')}</h2>
              <p className="text-pink-100 text-xl font-semibold">{t('promo_desc')}</p>
            </div>
            <Link to="/category/clothes"
              className="flex-shrink-0 bg-white text-pink-600 font-black px-10 py-4 rounded-full
                hover:bg-pink-50 hover:shadow-[0_8px_25px_rgba(255,255,255,0.4)]
                active:scale-95 transition-all duration-200 flex items-center gap-2 text-base">
              {t('promo_btn')}
              <ArrowRight className={`w-5 h-5 ${isRTL?'rotate-180':''}`}/>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
