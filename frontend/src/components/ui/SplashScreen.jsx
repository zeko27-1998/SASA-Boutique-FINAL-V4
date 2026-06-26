import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('in'); // in -> show -> out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 200);
    const t2 = setTimeout(() => setPhase('out'), 1800);
    const t3 = setTimeout(() => onDone(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black
      transition-opacity duration-500 ${phase === 'out' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

      {/* Ambient glow layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[500px] h-[500px] rounded-full bg-[#C9A84C]/8 blur-[120px]
          animate-pulse"/>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full
          bg-pink-900/20 blur-3xl animate-float"/>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full
          bg-[#C9A84C]/10 blur-2xl animate-float"
          style={{ animationDelay: '1.5s' }}/>
      </div>

      {/* Content */}
      <div className={`relative flex flex-col items-center transition-all duration-700
        ${phase === 'in' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

        {/* Logo ring */}
        <div className="relative mb-8">
          {/* Outer spinning ring */}
          <div className="absolute inset-[-8px] rounded-full border border-[#C9A84C]/30
            animate-spin-slow"/>
          {/* Middle pulse ring */}
          <div className="absolute inset-[-4px] rounded-full border border-[#C9A84C]/20"/>
          {/* Logo */}
          <div className="w-28 h-28 rounded-full overflow-hidden
            border-2 border-[#C9A84C]/60
            shadow-[0_0_60px_rgba(201,168,76,0.4),0_0_120px_rgba(201,168,76,0.15)]">
            <img src="/logo.png" alt="SASA Boutique"
              className="w-full h-full object-cover"/>
          </div>
          {/* Gold ping dot */}
          <div className="absolute -top-1 -right-1 w-4 h-4">
            <div className="absolute inset-0 rounded-full bg-[#C9A84C] animate-ping opacity-50"/>
            <div className="relative w-4 h-4 rounded-full bg-[#C9A84C] shadow-gold"/>
          </div>
        </div>

        {/* Text */}
        <h1 className="font-display text-5xl font-black tracking-[0.35em] text-[#C9A84C] uppercase mb-1">
          SASA
        </h1>
        <p className="text-[#C9A84C]/50 tracking-[0.6em] text-xs uppercase font-bold mb-10">
          Boutique
        </p>

        {/* Loading dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/60"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
              }}/>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
