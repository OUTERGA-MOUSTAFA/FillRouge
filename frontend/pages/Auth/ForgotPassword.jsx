import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../src/services/auth';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success('Email de réinitialisation envoyé');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email non trouvé');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email envoyé !</h2>
          <p className="text-gray-600 mb-6">
            Nous avons envoyé un lien de réinitialisation à {email}.<br />
            Vérifiez votre boîte de réception.
          </p>
          <Link to="/login" className="text-[#009966] hover:text-[#00BBA7]">
            Retour à la connexion
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
            Mot de passe oublié ?
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Entrez votre email pour recevoir un lien de réinitialisation
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
              placeholder="votre@email.com"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
          
          <div className="text-center">
            <Link to="/login" className="text-[#009966] hover:text-[#00BBA7]">
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}