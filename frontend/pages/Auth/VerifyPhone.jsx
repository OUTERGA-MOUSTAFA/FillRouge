import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../src/services/auth';  // ← chemin corrigé
import toast from 'react-hot-toast';

export default function VerifyPhone() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verifyPhone(code);
      toast.success('Téléphone vérifié avec succès');
      navigate('/profile');
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
      toast.success('Nouveau code SMS envoyé');
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
            Vérifiez votre téléphone
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Entrez le code SMS reçu sur votre téléphone
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
            {resendLoading ? 'Envoi...' : 'Renvoyer le code SMS'}
          </button>
        </form>
      </div>
    </div>
  );
}