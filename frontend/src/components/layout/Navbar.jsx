import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, Heart, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLang } from '../../context/LanguageContext';
import { useWishlist } from '../../pages/WishlistPage';

export default function Navbar() {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ,    setSearchQ]    = useState('');
  const [scrolled,   setScrolled]   = useState(false);

  const { user, logout, isAdmin }         = useAuth();
  const { count, setIsOpen }              = useCart();
  const { items: wishItems }              = useWishlist();
  const { t, lang, toggleLang, isRTL }   = useLang();
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinks = [
    { label: t('nav_home'),    to: '/' },
    { label: t('nav_clothes'), to: '/category/clothes' },
    { label: t('nav_shoes'),   to: '/category/shoes' },
    { label: t('nav_bags'),    to: '/category/bags' },
    { label: t('nav_beauty'),  to: '/category/foundation' },
    { label: t('nav_more'),    to: '/category/other' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
    setSearchOpen(false);
    setSearchQ('');
  };

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300
      ${scrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(236,72,153,0.10)] border-b border-pink-100/60'
        : 'bg-white/95 backdrop-blur-md border-b border-pink-100'}`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className={`relative rounded-full overflow-hidden bg-black
              shadow-md group-hover:shadow-[0_0_0_2.5px_#C9A84C,0_4px_20px_rgba(201,168,76,0.35)]
              transition-all duration-300 ${scrolled ? 'w-9 h-9' : 'w-10 h-10'}`}>
              <img src="/logo.png" alt="SASA Boutique"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
            </div>
            <div className={`flex flex-col leading-none ${isRTL ? 'items-end' : 'items-start'}`}>
              <span className="font-display text-lg font-black tracking-widest text-gray-900 uppercase
                group-hover:text-pink-600 transition-colors duration-200">SASA</span>
              <span className="text-[9px] tracking-[0.35em] text-[#C9A84C] font-black uppercase">Boutique</span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Actions ── */}
          <div className="flex items-center gap-1">

            {/* Language */}
            <button onClick={toggleLang}
              className="icon-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full
                border-2 border-pink-100 hover:border-[#C9A84C] hover:text-[#C9A84C]
                text-xs font-black text-gray-600 transition-all duration-200">
              <span className="text-sm">{lang === 'ar' ? '🇬🇧' : '🇮🇶'}</span>
              <span>{lang === 'ar' ? 'EN' : 'ع'}</span>
            </button>

            {/* Search */}
            <button onClick={() => setSearchOpen(v => !v)} className="icon-btn">
              <Search className="w-5 h-5"/>
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative group hidden md:block">
                <button className="icon-btn flex items-center gap-1.5 pr-2">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden
                    bg-gradient-to-br from-[#C9A84C] to-[#e8c97a] shadow-sm flex-shrink-0">
                    {user.avatar
                      ? <img src={user.avatar} alt="" className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-xs font-black">{user.name?.[0]?.toUpperCase()}</span>
                        </div>}
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-pink-500
                    group-hover:rotate-180 transition-all duration-200"/>
                </button>

                {/* Dropdown */}
                <div className={`absolute top-full mt-2 w-56 bg-white rounded-2xl
                  shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-pink-100/80 py-2
                  opacity-0 invisible translate-y-2
                  group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                  transition-all duration-200 z-50 ${isRTL ? 'left-0' : 'right-0'}`}>

                  {/* User info */}
                  <div className={`px-4 py-3 border-b border-pink-50 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#C9A84C] to-[#e8c97a] flex-shrink-0">
                      {user.avatar
                        ? <img src={user.avatar} alt="" className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white text-xs font-black">{user.name?.[0]?.toUpperCase()}</span>
                          </div>}
                    </div>
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="font-black text-sm text-gray-900 truncate max-w-[140px]">{user.name}</p>
                      <p className="text-xs text-gray-400 font-semibold truncate max-w-[140px]">{user.email}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link to="/admin"
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm
                        text-[#C9A84C] hover:bg-amber-50 font-black transition-colors
                        ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Settings className="w-4 h-4"/>
                      {t('nav_admin')}
                    </Link>
                  )}

                  <Link to="/profile"
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm
                      text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-bold transition-colors
                      ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>👤</span>
                    {isRTL ? 'إعدادات الحساب' : 'Account Settings'}
                  </Link>

                  <Link to="/track-order"
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm
                      text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-bold transition-colors
                      ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>📦</span>
                    {isRTL ? 'تتبع الطلب' : 'Track Order'}
                  </Link>

                  <div className="border-t border-pink-50 mt-1 pt-1">
                    <button onClick={logout}
                      className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm
                        text-gray-500 hover:bg-red-50 hover:text-red-500 font-bold transition-colors
                        ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>🚪</span>
                      {t('nav_signout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden md:inline-flex btn-primary text-sm py-2 px-5">
                {t('nav_signin')}
              </Link>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" className="icon-btn relative">
              <Heart className={`w-5 h-5 transition-all duration-200
                ${wishItems.length > 0 ? 'fill-pink-400 text-pink-400' : ''}`}/>
              {wishItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px]
                  w-4 h-4 rounded-full flex items-center justify-center font-black
                  shadow-[0_0_0_2px_white]">
                  {wishItems.length > 9 ? '9+' : wishItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button onClick={() => setIsOpen(true)} className="icon-btn relative">
              <ShoppingBag className="w-5 h-5"/>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px]
                  w-4 h-4 rounded-full flex items-center justify-center font-black
                  shadow-[0_0_0_2px_white]">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {/* Mobile menu — animated hamburger */}
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden icon-btn">
              <div className="relative w-5 h-5">
                <span className={`absolute block h-0.5 w-5 bg-gray-700 rounded transition-all duration-300
                  ${menuOpen ? 'top-2.5 rotate-45' : 'top-0.5'}`}/>
                <span className={`absolute block h-0.5 bg-gray-700 rounded transition-all duration-200
                  ${menuOpen ? 'w-0 opacity-0 top-2.5 left-1/2' : 'w-4 top-2.5'}`}/>
                <span className={`absolute block h-0.5 w-5 bg-gray-700 rounded transition-all duration-300
                  ${menuOpen ? 'top-2.5 -rotate-45' : 'top-[18px]'}`}/>
              </div>
            </button>
          </div>
        </div>

        {/* ── Search bar ── */}
        {searchOpen && (
          <div className="pb-3 animate-slide-up">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder={t('nav_search_placeholder')} className="input text-sm" autoFocus/>
              <button type="submit" className="btn-primary text-sm px-5 py-2.5 flex-shrink-0">
                {t('nav_search_btn')}
              </button>
            </form>
          </div>
        )}

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-pink-100 pt-3 animate-slide-up">
            <nav className="flex flex-col gap-0.5">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-black transition-colors
                    ${isActive(link.to) ? 'bg-pink-100 text-pink-600' : 'text-gray-700 hover:bg-pink-50 hover:text-pink-500'}`}>
                  {link.label}
                </Link>
              ))}

              <button onClick={toggleLang}
                className="flex items-center gap-2 px-4 py-3 text-sm font-black text-gray-700 hover:text-[#C9A84C] transition-colors">
                {lang === 'ar' ? '🇬🇧 Switch to English' : '🇮🇶 التبديل للعربية'}
              </button>

              <div className="border-t border-pink-100 mt-2 pt-2 space-y-0.5">
                {user ? (
                  <>
                    <div className={`flex items-center gap-3 px-4 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#C9A84C] to-[#e8c97a] flex-shrink-0">
                        {user.avatar
                          ? <img src={user.avatar} alt="" className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center">
                              <span className="text-white text-xs font-black">{user.name?.[0]?.toUpperCase()}</span>
                            </div>}
                      </div>
                      <div>
                        <p className="font-black text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#C9A84C] font-black">⚙️ {t('nav_admin')}</Link>
                    )}
                    <Link to="/profile" onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 font-bold hover:text-pink-500">
                      👤 {isRTL ? 'إعدادات الحساب' : 'Account Settings'}
                    </Link>
                    <Link to="/track-order" onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 font-bold hover:text-pink-500">
                      📦 {isRTL ? 'تتبع الطلب' : 'Track Order'}
                    </Link>
                    <button onClick={() => { logout(); setMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-600 font-bold hover:text-red-500">
                      🚪 {t('nav_signout')}
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="btn-primary text-sm mx-4 text-center block py-3">{t('nav_signin')}</Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
