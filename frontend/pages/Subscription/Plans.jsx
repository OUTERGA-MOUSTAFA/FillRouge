import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../src/services/subscription';  // ← chemin corrigé
import { useAuthStore } from '../../src/store/authStore';  // ← chemin corrigé
import PlanCard from '../../src/components/subscription/PlanCard';  // ← chemin corrigé
import PricingTable from '../../src/components/subscription/PricingTable';  // ← chemin corrigé
import toast from 'react-hot-toast';

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [viewMode, setViewMode] = useState('cards');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, currentRes] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrent(),
      ]);
      setPlans(plansRes.data);
      setCurrentSubscription(currentRes.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur chargement des plans';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    if (plan === 'free') {
      toast.info('Le plan gratuit est déjà actif');
      return;
    }
    navigate('/subscription/checkout', { state: { plan } });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choisissez le plan qui vous convient
        </h1>
        <p className="text-xl text-gray-600">
          Passez à Darna Premium pour maximiser vos chances de trouver le colocataire idéal
        </p>
        
        <div className="inline-flex mt-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'cards' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Cartes
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'table' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Tableau comparatif
          </button>
        </div>
      </div>

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
              <button onClick={() => handleSelectPlan('premium')} className="btn-primary">
                Passer à Premium
              </button>
            )}
          </div>
        </div>
      )}

      {viewMode === 'cards' && plans && (
        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(plans).map(([key, plan]) => (
            <PlanCard
              key={key}
              plan={key}
              isCurrent={currentSubscription?.current_plan === key}
              onSelect={() => handleSelectPlan(key)}
              featured={key === 'premium'}
            />
          ))}
        </div>
      )}

      {viewMode === 'table' && plans && (
        <PricingTable
          plans={plans}
          currentPlan={currentSubscription?.current_plan}
          onSelect={handleSelectPlan}
        />
      )}
    </div>
  );
}