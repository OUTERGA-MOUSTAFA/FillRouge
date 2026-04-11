import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscription';
import toast from 'react-hot-toast';

export default function SubscriptionCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
  });

  if (!plan) {
    navigate('/subscription/plans');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await subscriptionService.checkout(plan, paymentMethod, cardDetails);
      toast.success('Abonnement activé avec succès');
      navigate('/subscription/plans');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  const planNames = {
    standard: 'Standard',
    premium: 'Premium',
  };

  const planPrices = {
    standard: 100,
    premium: 200,
  };

  return (
    <div className="container-custom py-12 max-w-2xl">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Finaliser l'abonnement</h1>
        <p className="text-gray-600 mb-6">
          Vous allez souscrire au plan {planNames[plan]} à {planPrices[plan]} MAD/mois
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode de paiement
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`flex-1 p-3 border rounded-lg text-center ${
                  paymentMethod === 'stripe'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                💳 Carte bancaire
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cmi')}
                className={`flex-1 p-3 border rounded-lg text-center ${
                  paymentMethod === 'cmi'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                🏦 CMI (Maroc)
              </button>
            </div>
          </div>
          
          {/* Card Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Numéro de carte
              </label>
              <input
                type="text"
                required
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                className="input mt-1"
                placeholder="4242 4242 4242 4242"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date d'expiration
                </label>
                <input
                  type="text"
                  required
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  className="input mt-1"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CVC
                </label>
                <input
                  type="text"
                  required
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                  className="input mt-1"
                  placeholder="123"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <div className="flex justify-between mb-4">
              <span>Total</span>
              <span className="text-xl font-bold">{planPrices[plan]} MAD</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Traitement...' : `Payer ${planPrices[plan]} MAD`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}