import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../src/services/auth';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success(t('auth.forgot.resetEmailSent'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.forgot.emailNotFound'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="rounded-full bg-green-100 h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.forgot.emailSentTitle')}</h2>
          <p className="text-gray-600 mb-6">
            {t('auth.forgot.emailSentText1', { email })}<br />
            {t('auth.forgot.emailSentText2')}
          </p>
          <Link to="/login" className="text-[#009966] hover:text-[#00BBA7]">
            {t('auth.common.backToLogin')}
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
            {t('auth.forgot.title')}
          </h2>
          <p className="mt-2 text-center text-gray-600">
            {t('auth.forgot.subtitle')}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder={t('auth.forgot.emailPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t('auth.common.sending') : t('auth.common.send')}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-[#009966] hover:text-[#00BBA7]">
              {t('auth.common.backToLogin')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}