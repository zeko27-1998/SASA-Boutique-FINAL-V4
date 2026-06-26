import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { ArrowRight } from 'lucide-react';

export default function CategoryCard({ cat, index = 0 }) {
  const { isRTL } = useLang();
  const label = isRTL ? cat.nameAr : cat.nameEn;

  return (
    <Link
      to={`/category/${cat.id}`}
      className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl
        transition-all duration-500 hover:-translate-y-1 block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Photo */}
      <div className="aspect-[3/4] sm:aspect-square w-full overflow-hidden bg-gray-100">
        <img
          src={cat.image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80'}
          alt={label}
          className="w-full h-full object-cover
            group-hover:scale-110
            transition-transform duration-700 ease-out"
          onError={e => { e.target.src='https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80'; }}
        />
      </div>

      {/* Default label — bottom gradient strip (always visible) */}
      <div className="absolute inset-x-0 bottom-0 h-24
        bg-gradient-to-t from-black/80 via-black/30 to-transparent
        flex items-end p-4
        group-hover:opacity-0
        transition-opacity duration-300">
        <span className="text-white font-black text-lg tracking-wide drop-shadow-lg">
          {label}
        </span>
      </div>

      {/* Hover overlay — full frosted cover with label + arrow (desktop) */}
      {/* On mobile: just the bottom bar is enough */}
      <div className="absolute inset-0
        bg-gradient-to-br from-pink-600/80 to-pink-400/70
        backdrop-blur-[2px]
        flex flex-col items-center justify-center gap-3
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        hidden sm:flex">
        <span className="text-white font-black text-2xl tracking-widest uppercase drop-shadow-lg text-center px-3">
          {label}
        </span>
        <span className="text-pink-100 text-sm font-semibold text-center px-4">
          {isRTL ? 'اضغطي لاستعراض الكل' : 'Tap to explore'}
        </span>
        <div className="w-10 h-10 rounded-full border-2 border-white/70 flex items-center justify-center
          text-white mt-1
          group-hover:scale-110 transition-transform duration-300">
          <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Mobile: tap highlight */}
      <div className="absolute inset-0 bg-pink-500/10 opacity-0 active:opacity-100 sm:hidden
        transition-opacity duration-150 rounded-2xl" />
    </Link>
  );
}
