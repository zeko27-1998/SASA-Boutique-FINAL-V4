import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { t, isRTL, lang, toggleLang } = useLang();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password);
        toast.success(`${isRTL ? 'مرحباً بعودتكِ' : 'Welcome back'}, ${user.name}! 🌸`);
        navigate(user.role === 'admin' ? '/admin' : '/');
      } else {
        if (!form.name.trim()) { toast.error(isRTL ? 'الاسم مطلوب' : 'Name is required'); setLoading(false); return; }
        const user = await register(form.name, form.email, form.password);
        toast.success(`${isRTL ? 'مرحباً' : 'Welcome'}, ${user.name}! 🌸`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || (isRTL ? 'حدث خطأ ما' : 'Something went wrong'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-[#C9A84C]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#C9A84C]/10 blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="w-44 h-44 rounded-full overflow-hidden mx-auto mb-8 shadow-[0_0_60px_rgba(201,168,76,0.4)] border-2 border-[#C9A84C]/30">
            <img src="/logo.png" alt="SASA Boutique" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-display text-4xl font-bold text-[#C9A84C] mb-2 tracking-widest uppercase">SASA</h1>
          <p className="text-[#C9A84C]/70 tracking-[0.4em] text-sm uppercase mb-4">Boutique</p>
          <p className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed">{t('auth_tagline')}</p>
          <div className="grid grid-cols-2 gap-3 mt-8 max-w-xs mx-auto">
            <img src="https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=200&q=60" alt="" className="rounded-2xl w-full h-28 object-cover opacity-60 hover:opacity-90 transition-opacity" />
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=60" alt="" className="rounded-2xl w-full h-28 object-cover opacity-60 hover:opacity-90 transition-opacity mt-4" />
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-cream relative">

        {/* Language toggle top right */}
        <button onClick={toggleLang}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-pink-200 text-xs font-bold hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all text-gray-600 bg-white">
          <span>{lang === 'ar' ? '🇬🇧 EN' : '🇮🇶 ع'}</span>
        </button>

        <div className="w-full max-w-md">
          <div className="card p-8">
            {/* Mobile logo */}
            <div className="flex flex-col items-center mb-7 lg:hidden">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-black shadow-lg mb-3 border border-[#C9A84C]/30">
                <img src="/logo.png" alt="SASA Boutique" className="w-full h-full object-cover" />
              </div>
              <span className="font-display text-xl font-bold tracking-widest text-gray-900 uppercase">SASA</span>
              <span className="text-[10px] tracking-[0.4em] text-[#C9A84C] font-medium uppercase">Boutique</span>
            </div>

            <div className="text-center mb-7">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-1.5">
                {mode === 'login' ? t('auth_welcome_back') : t('auth_join')}
              </h2>
              <p className="text-gray-400 text-sm">
                {mode === 'login' ? t('auth_signin_desc') : t('auth_register_desc')}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-pink-50 rounded-xl p-1 mb-6">
              {['login', 'register'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${mode === m ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-pink-400'}`}>
                  {m === 'login' ? t('auth_signin_tab') : t('auth_register_tab')}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth_name')}</label>
                  <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder={t('auth_name_placeholder')} className="input" required={mode === 'register'} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {isRTL ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder={t('auth_email_placeholder')} className="input" required dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth_password')}</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => set('password', e.target.value)} placeholder="••••••••"
                    className="input pr-12" required minLength={6} dir="ltr" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-4' : 'right-4'}`}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {mode === 'login' && (
                <div className={isRTL ? 'text-left' : 'text-right'}>
                  <a href="#" className="text-sm text-pink-500 hover:underline">{t('auth_forgot')}</a>
                </div>
              )}
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base disabled:opacity-70 shadow-pink-md">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Sparkles className="w-4 h-4" />{mode === 'login' ? t('auth_signin_btn') : t('auth_create_btn')}</>}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-5">
              {mode === 'login' ? t('auth_no_account') : t('auth_have_account')}{' '}
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-pink-500 font-medium hover:underline">
                {mode === 'login' ? t('auth_register_link') : t('auth_signin_link')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
