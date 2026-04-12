import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/solid';
import { subscriptionService } from '../../services/subscription';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState(null);
  
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, currentRes] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrent(),
      ]);
      setPlans(plansRes.data);
      setCurrentSubscription(currentRes.data);
    } catch (error) {
      toast.error('Erreur chargement des plans', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan) => {
    navigate('/subscription/checkout', { state: { plan } });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choisissez le plan qui vous convient
        </h1>
        <p className="text-xl text-gray-600">
          Passez à Darna Premium pour maximiser vos chances de trouver le colocataire idéal
        </p>
      </div>

      {/* Current Subscription */}
      {currentSubscription?.current_plan !== 'free' && (
        <div className="mb-8 bg-primary-50 rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Votre abonnement actuel</h3>
              <p className="text-gray-600">
                Plan {currentSubscription.current_plan === 'premium' ? 'Premium' : 'Standard'}
                {currentSubscription.remaining_days > 0 && (
                  <span className="ml-2 text-sm">
                    - Expire dans {currentSubscription.remaining_days} jours
                  </span>
                )}
              </p>
            </div>
            {currentSubscription.current_plan !== 'premium' && (
              <button
                onClick={() => handleSubscribe('premium')}
                className="btn-primary"
              >
                Passer à Premium
              </button>
            )}
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {Object.entries(plans).map(([key, plan]) => (
          <div
            key={key}
            className={`card p-6 ${key === 'premium' ? 'ring-2 ring-primary-500 relative' : ''}`}
          >
            {key === 'premium' && (
              <div className="absolute top-0 right-0 bg-primary-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                POPULAIRE
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary-600">{plan.price_mad}</span>
                {plan.price > 0 && <span className="text-gray-500">/mois</span>}
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSubscribe(key)}
              disabled={currentSubscription?.current_plan === key}
              className={`w-full ${
                currentSubscription?.current_plan === key
                  ? 'bg-gray-300 cursor-not-allowed'
                  : key === 'free'
                  ? 'btn-secondary'
                  : 'btn-primary'
              }`}
            >
              {currentSubscription?.current_plan === key
                ? 'Plan actuel'
                : key === 'free'
                ? 'Plan gratuit'
                : 'S\'abonner'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}