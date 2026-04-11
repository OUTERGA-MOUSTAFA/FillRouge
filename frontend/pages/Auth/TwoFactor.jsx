import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function TwoFactor() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { verify2FA } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verify2FA(code);
      toast.success('Connexion réussie');
      navigate('/');
    } catch (error) {
      toast.error('Code 2FA invalide',error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Authentification à deux facteurs
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Entrez le code généré par votre application d'authentification
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
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>
      </div>
    </div>
  );
}