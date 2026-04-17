import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../src/store/authStore';
import {
  EnvelopeIcon, LockClosedIcon,
  EyeIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const { login } = useAuthStore();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result?.requires2FA) {
        navigate('/2fa', { state: { twoFactorToken: result.twoFactorToken } });
        return;
      }
      toast.success('Connexion réussie');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Panneau gauche — illustration / brand ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#009966]">
        {/* Formes décoratives */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#00BBA7] opacity-40" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-500 opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[#33bfaf] opacity-20" />

        {/* Contenu */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-extrabold text-xl">D</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Darna</span>
          </div>

          {/* Tagline centrale */}
          <div>
            <h2 className="text-4xl font-extrabold leading-snug mb-4">
              Trouvez votre<br />colocataire idéal<br />au Maroc.
            </h2>
            <p className="text-[#ccefeb] text-base max-w-xs leading-relaxed">
              Des milliers de profils vérifiés dans toutes les grandes villes — Casablanca, Rabat, Marrakech et plus.
            </p>
          </div>

          {/* Témoignage */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <p className="text-sm text-[#e6f7f5] italic leading-relaxed mb-3">
              "J'ai trouvé ma colocataire en moins d'une semaine grâce à Darna. L'interface est simple et les profils sont fiables."
            </p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">S</div>
              <div>
                <p className="text-xs font-semibold">Salma B.</p>
                <p className="text-xs text-primary-200">Casablanca</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">

        {/* Logo mobile */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="h-9 w-9 rounded-xl bg-[#009966] flex items-center justify-center">
            <span className="text-white font-extrabold text-lg">D</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Darna</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Bon retour 👋</h1>
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Boutons OAuth */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <OAuthBtn
              onClick={() => window.location.href = 'http://localhost:8000/api/auth/google/redirect'}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              }
              label="Google"
            />
            <OAuthBtn
              onClick={() => window.location.href = 'http://localhost:8000/api/auth/facebook/redirect'}
              icon={
                <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87v2.25h3.32l-.53 3.49h-2.79V24C19.62 23.1 24 18.1 24 12.07Z"/>
                </svg>
              }
              label="Facebook"
            />
          </div>

          {/* Séparateur */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-gray-50 text-xs text-gray-400">ou continuez avec votre email</span>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ahmed@exemple.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30 focus:border-[#00BBA7] transition-all"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-600 font-medium hover:text-primary-700 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30 focus:border-[#00BBA7] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword
                    ? <EyeSlashIcon className="h-4 w-4" />
                    : <EyeIcon className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>

            {/* Se souvenir */}
            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-[#00BBA7]"
              />
              <label htmlFor="remember-me" className="text-sm text-gray-600">
                Se souvenir de moi
              </label>
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                bg-[#009966] text-white text-sm font-semibold
                hover:bg-[#00734d] active:scale-[0.99]
                focus:outline-none focus:ring-2 focus:ring-[#00BBA7] focus:ring-offset-2
                transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Connexion…
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Lien inscription (mobile) */}
          <p className="mt-6 text-center text-sm text-gray-500 lg:hidden">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Bouton OAuth ──────────────────────────────────────────────────────────────
function OAuthBtn({ onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-200
        rounded-xl bg-white text-sm font-medium text-gray-700
        hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]
        transition-all shadow-sm"
    >
      {icon}
      {label}
    </button>
  );
}