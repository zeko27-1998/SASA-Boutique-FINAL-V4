import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

export default function NotFoundPage() {
  const { isRTL } = useLang();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-baby-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="relative">
        {/* Big 404 */}
        <div className="font-display text-[9rem] font-bold leading-none bg-gradient-to-br from-pink-300 to-pink-100 bg-clip-text text-transparent select-none">
          404
        </div>

        {/* Logo floats over */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full overflow-hidden bg-black shadow-2xl border-4 border-white animate-float">
          <img src="/logo.png" alt="SASA Boutique" className="w-full h-full object-cover" />
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold text-gray-800 mt-6 mb-3">
        {isRTL ? 'الصفحة غير موجودة!' : 'Page Not Found!'}
      </h1>
      <p className="text-gray-400 mb-8 max-w-sm">
        {isRTL
          ? 'يبدو أن هذه الصفحة لا وجود لها. ربما تم نقلها أو حذفها.'
          : "Looks like this page doesn't exist. It may have been moved or deleted."}
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/" className="btn-primary">
          {isRTL ? '🏠 العودة للرئيسية' : '🏠 Back to Home'}
        </Link>
        <Link to="/category/clothes" className="btn-secondary">
          {isRTL ? '👗 تصفحي الملابس' : '👗 Browse Clothes'}
        </Link>
      </div>

      {/* Quick links */}
      <div className="mt-10 flex flex-wrap gap-3 justify-center">
        {[
          { label: isRTL ? 'الأحذية' : 'Shoes', to: '/category/shoes', emoji: '👠' },
          { label: isRTL ? 'الحقائب' : 'Bags', to: '/category/bags', emoji: '👜' },
          { label: isRTL ? 'التجميل' : 'Beauty', to: '/category/foundation', emoji: '💄' },
        ].map(({ label, to, emoji }) => (
          <Link key={to} to={to} className="flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full text-sm text-pink-600 hover:bg-pink-100 transition-colors">
            {emoji} {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
