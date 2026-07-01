import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../src/services/auth';  // ← chemin corrigé
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function VerifyPhone() {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verifyPhone(code);
      toast.success(t('auth.verifyPhone.success'));
      navigate('/profile');
    } catch (error) {
      const message = error.response?.data?.message || t('auth.common.invalidOrExpiredCode');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await authService.resendVerification();
      toast.success(t('auth.verifyPhone.smsCodeResent'));
    } catch (error) {
      const message = error.response?.data?.message || t('auth.common.sendError');
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {t('auth.verifyPhone.title')}
          </h2>
          <p className="mt-2 text-center text-gray-600">
            {t('auth.verifyPhone.subtitle')}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength="6"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t('auth.common.verifying') : t('auth.common.verify')}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full text-center text-[#009966] hover:text-[#00BBA7]"
          >
            {resendLoading ? t('auth.common.sending') : t('auth.verifyPhone.resendSmsCode')}
          </button>
        </form>
      </div>
    </div>
  );
}