import { Link } from 'react-router-dom';
import { Heart, MapPin, Phone, Mail } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { useEffect, useState } from 'react';
import { getCategories } from '../../api';

export default function Footer() {
  const { t, isRTL } = useLang();
  const [categories, setCategories] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/sasa_boutique_online?igsh=MXNnZjN2YjdxZm1ocg==',
      svg: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/share/18zfLDdwhA/',
      svg: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    },
    {
      label: 'TikTok',
      href: 'https://www.tiktok.com/@sasabout1?_r=1&_t=ZS-97X2ilVzv8O',
      svg: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.29 6.29 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
      </svg>
    },
  ];

  const paymentMethods = [
    { icon: '🏦', label: isRTL ? 'كي كارد' : 'Qi Card' },
    { icon: '🚚', label: isRTL ? 'كاش' : 'Cash on Delivery' },
  ];

  return (
    <footer
      className="bg-gradient-to-b from-white to-pink-50/60 border-t border-pink-100 mt-16"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">

          {/* ── Brand ── */}
          <div>
            <Link to="/" className={`flex items-center gap-3 mb-5 group w-fit ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-12 h-12 rounded-full overflow-hidden bg-black shadow-md
                group-hover:shadow-[0_0_0_2px_#C9A84C,0_4px_16px_rgba(201,168,76,0.3)]
                transition-all duration-300">
                <img src="/logo.png" alt="SASA Boutique" className="w-full h-full object-cover"/>
              </div>
              <div className={`flex flex-col leading-none ${isRTL ? 'items-end' : 'items-start'}`}>
                <span className="font-display text-base font-black tracking-widest text-gray-900 uppercase">SASA</span>
                <span className="text-[9px] tracking-[0.35em] text-[#C9A84C] font-black uppercase">Boutique</span>
              </div>
            </Link>
            <p className="text-sm text-gray-500 font-semibold leading-relaxed mb-5 max-w-[220px]">
              {t('footer_desc')}
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map(({ href, label, svg }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center
                    text-pink-400 hover:bg-pink-500 hover:text-white
                    hover:scale-110 active:scale-90
                    transition-all duration-200 shadow-sm">
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* ── Shop (dynamic categories) ── */}
          <div>
            <h3 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wider">
              {t('footer_shop')}
            </h3>
            <ul className="space-y-2.5">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.id}`}
                    className="text-sm text-gray-500 font-semibold hover:text-pink-500
                      transition-colors duration-200 flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-pink-200 group-hover:bg-pink-500 transition-colors flex-shrink-0"/>
                    {isRTL ? cat.nameAr : cat.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>



          {/* ── Contact ── */}
          <div>
            <h3 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wider">
              {t('footer_contact')}
            </h3>
            <ul className="space-y-3 mb-5">
              <li className={`flex items-start gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A84C]"/>
                </div>
                <span className="text-sm text-gray-600 font-semibold">
                  {isRTL ? 'بغداد، العراق' : 'Baghdad, Iraq'}
                </span>
              </li>
              <li className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#C9A84C]"/>
                </div>
                <span className="text-sm text-gray-600 font-semibold" dir="ltr">+964 773 3440 545</span>
              </li>
            </ul>

            {/* Payment methods */}
            <p className="text-xs text-gray-400 font-black uppercase tracking-wider mb-2">
              {t('footer_accept')}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {paymentMethods.map(({ icon, label }) => (
                <div key={label}
                  className="flex items-center gap-1 text-xs bg-white border border-gray-200
                    rounded-lg px-2 py-1 text-gray-600 font-semibold shadow-sm hover:border-pink-300 transition-colors">
                  <span>{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setShowContactModal(true)}
              className="w-full py-2.5 rounded-xl bg-pink-500 text-white text-sm font-bold
                hover:bg-pink-600 transition-colors shadow-sm">
              {t('footer_contact_us')}
            </button>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-pink-100 pt-6 flex justify-center">
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-6 h-6 rounded-full overflow-hidden bg-black flex-shrink-0">
              <img src="/logo.png" alt="" className="w-full h-full object-cover"/>
            </div>
            <p className="text-xs text-gray-400 font-semibold">{t('footer_rights')}</p>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowContactModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-xl"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-gray-900 mb-5 text-center">
              {isRTL ? 'تواصلي معنا' : 'Contact Us'}
            </h3>
            <div className="flex justify-center gap-4">
              {socialLinks.map(({ href, label, svg }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center
                    text-pink-500 hover:bg-pink-500 hover:text-white
                    transition-all duration-200 shadow-sm">
                  {svg}
                </a>
              ))}
            </div>
            <button onClick={() => setShowContactModal(false)}
              className="mt-5 w-full py-2 rounded-xl border border-pink-200 text-sm font-bold
                text-gray-500 hover:text-pink-500 hover:border-pink-300 transition-colors">
              {isRTL ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
