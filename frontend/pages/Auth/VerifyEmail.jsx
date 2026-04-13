import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../src/store/authStore';
import { authService } from '../../src/services/auth';  
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email_verified_at) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verifyEmail(code);
      toast.success('Email vérifié avec succès');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Code invalide ou expiré';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await authService.resendVerification();
      toast.success('Nouveau code envoyé');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'envoi';
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
            Vérifiez votre email
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Nous avons envoyé un code de vérification à {user?.email}
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
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
          
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full text-center text-primary-600 hover:text-primary-500"
          >
            {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
          </button>
        </form>
      </div>
    </div>
  );
}