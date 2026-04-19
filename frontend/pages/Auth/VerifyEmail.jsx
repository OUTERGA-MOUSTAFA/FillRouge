import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../src/store/authStore';
import { authService } from '../../src/services/auth';
import api from '../../src/services/api';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [testCode, setTestCode] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // En développement, récupérer le code de test
    if (import.meta.env.DEV) {
      fetchTestCode();
    }
  }, []);

  const fetchTestCode = async () => {
    try {
      const response = await api.get('/dev/last-verification-code');
      if (response.data.code) {
        setTestCode(response.data.code);
      }
    } catch (error) {
      console.error('Erreur récupération code test:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verifyEmail(code);
      toast.success('Email vérifié avec succès');
      navigate('/onboarding');
    } catch (error) {
      const message = error.response?.data?.message || 'Code invalide ou expiré';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await authService.resendVerification();
      toast.success('Nouveau code envoyé');
      if (import.meta.env.DEV) {
        setTimeout(fetchTestCode, 1000);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
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
          {testCode && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg text-center">
              <p className="text-sm text-yellow-800">
                🔧 Mode développement - Code de test : 
                <span className="font-bold text-lg ml-2">{testCode}</span>
              </p>
            </div>
          )}
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
            disabled={loading}
            className="w-full text-center text-[#009966] hover:text-[#00BBA7]"
          >
            Renvoyer le code
          </button>
        </form>
      </div>
    </div>
  );
}