import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

// Scroll to top on every route change
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

// Floating back-to-top button
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled  = window.scrollY;
      const total     = document.documentElement.scrollHeight - window.innerHeight;
      const pct       = total > 0 ? (scrolled / total) * 100 : 0;
      setScrollPct(pct);
      setVisible(scrolled > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  // SVG circle progress
  const r   = 18;
  const circ = 2 * Math.PI * r;
  const dash = circ - (circ * scrollPct) / 100;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 w-12 h-12 flex items-center justify-center
        rounded-full bg-pink-500 text-white
        hover:bg-pink-600 hover:scale-110 active:scale-95
        transition-all duration-200
        shadow-[0_4px_20px_rgba(232,76,138,0.45)]"
    >
      {/* Progress ring */}
      <svg className="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
        <circle cx="20" cy="20" r={r} fill="none"
          stroke="white" strokeWidth="2"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.1s ease' }}/>
      </svg>
      <ArrowUp className="w-4 h-4 relative z-10"/>
    </button>
  );
}
