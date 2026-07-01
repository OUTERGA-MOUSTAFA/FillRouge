import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../src/services/auth';  // ← chemin corrigé
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      toast.error(t('auth.common.passwordsDoNotMatch'));
      return;
    }

    if (password.length < 8) {
      toast.error(t('auth.reset.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password, passwordConfirmation);
      toast.success(t('auth.reset.success'));
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || t('auth.reset.error');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{t('auth.reset.invalidToken')}</p>
          <Link to="/forgot-password" className="text-[#009966] mt-4 inline-block">
            {t('auth.reset.requestNewLink')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {t('auth.reset.title')}
          </h2>
          <p className="mt-2 text-center text-gray-600">
            {t('auth.reset.subtitle')}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('auth.common.newPassword')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1"
                placeholder={t('auth.common.passwordPlaceholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('auth.common.confirmPassword')}
              </label>
              <input
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="input mt-1"
                placeholder={t('auth.common.passwordPlaceholder')}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t('auth.reset.resetting') : t('auth.reset.resetButton')}
          </button>
        </form>
      </div>
    </div>
  );
}