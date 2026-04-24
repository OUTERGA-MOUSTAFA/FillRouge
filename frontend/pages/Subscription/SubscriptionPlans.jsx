import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../src/services/subscription';
import toast from 'react-hot-toast';
import {
  CheckIcon, SparklesIcon, BoltIcon, UserIcon,
  TableCellsIcon, Squares2X2Icon, StarIcon,
  ShieldCheckIcon, ArrowRightIcon, InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

// Données des plans (fallback si l'API ne répond pas)
const DEFAULT_PLANS = {
  free: {
    label: 'Gratuit',
    price: 0,
    tagline: 'Pour commencer',
    color: 'gray',
    icon: <UserIcon className="h-5 w-5" />,
    features: [
      { text: '5 messages par jour', included: true },
      { text: 'Voir les profils basiques', included: true },
      { text: 'Créer une annonce', included: true },
      { text: 'Profil mis en avant', included: false },
      { text: 'Messages illimités', included: false },
      { text: 'Voir qui a visité ton profil', included: false },
      { text: 'Filtres avancés', included: false },
      { text: 'Support prioritaire', included: false },
    ],
  },
  standard: {
    label: 'Standard',
    price: 99,
    tagline: 'Le plus populaire',
    color: 'teal',
    icon: <BoltIcon className="h-5 w-5" />,
    badge: 'Populaire',
    features: [
      { text: '50 messages par jour', included: true },
      { text: 'Voir les profils basiques', included: true },
      { text: 'Créer une annonce', included: true },
      { text: 'Profil mis en avant', included: true },
      { text: 'Messages illimités', included: false },
      { text: 'Voir qui a visité ton profil', included: false },
      { text: 'Filtres avancés', included: true },
      { text: 'Support prioritaire', included: true },
    ],
  },
  premium: {
    label: 'Premium',
    price: 199,
    tagline: 'Tout inclus',
    color: 'primary',
    icon: <SparklesIcon className="h-5 w-5" />,
    badge: 'Meilleur choix',
    features: [
      { text: 'Messages illimités', included: true },
      { text: 'Voir les profils basiques', included: true },
      { text: 'Créer une annonce', included: true },
      { text: 'Profil mis en avant', included: true },
      { text: 'Messages illimités', included: true },
      { text: 'Voir qui a visité ton profil', included: true },
      { text: 'Filtres avancés', included: true },
      { text: 'Support prioritaire', included: true },
    ],
  },
};

const PLAN_STYLES = {
  free: {
    ring: 'ring-gray-200',
    badgeBg: 'bg-gray-100 text-gray-600',
    iconBg: 'bg-gray-100 text-gray-500',
    btn: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    activeBg: 'bg-gray-50',
    price: 'text-gray-900',
  },
  standard: {
    ring: 'ring-[#66edd5]',
    badgeBg: 'bg-[#e6fcf8] text-[#2f7d76]',
    iconBg: 'bg-[#e6fcf8] text-[#3fa79e]',
    btn: 'bg-[#4FD1C5] text-white hover:bg-[#3fa79e]',
    activeBg: 'bg-[#e6fcf8]',
    price: 'text-[#3fa79e]',
  },
  premium: {
    ring: 'ring-[#33bfaf]',
    badgeBg: 'bg-[#009966] text-white',
    iconBg: 'bg-[#e6f7f5] text-[#009966]',
    btn: 'bg-[#009966] text-white hover:bg-[#00734d]',
    activeBg: 'bg-[#e6f7f5]',
    price: 'text-[#009966]',
  },
};

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState(DEFAULT_PLANS); // DEFAULT_PLANS comme fallback
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [viewMode, setViewMode] = useState('cards');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  // const fetchData = async () => {
  //   setLoading(true);
  //   try {
  //     // Récupérer les plans depuis l'API
  //     const plansResponse = await subscriptionService.getPlans();
  //     if (plansResponse?.success && plansResponse?.data) {
  //       setPlans(plansResponse.data);// Remplace tout l’objet plans
  //     }

  //     // Récupérer l'abonnement actuel
  //     const currentResponse = await subscriptionService.getCurrent();
  //     if (currentResponse?.success && currentResponse?.data) {
  //       setCurrentSubscription(currentResponse.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     toast.error(error.response?.data?.message || 'Erreur chargement des plans');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

 const fetchData = async () => {
  setLoading(true);
  try {
    const plansResponse = await subscriptionService.getPlans();
    const currentResponse = await subscriptionService.getCurrent();

    const merged = { ...DEFAULT_PLANS };

    if (plansResponse?.success && plansResponse?.data) {
      Object.keys(plansResponse.data).forEach(key => {
        const apiPlan = plansResponse.data[key];
        const defaultPlan = DEFAULT_PLANS[key] || {};

        merged[key] = {
          ...defaultPlan,
          label: apiPlan.name || defaultPlan.label || key,
          price: apiPlan.price ?? defaultPlan.price,
          tagline: defaultPlan.tagline,
          icon: defaultPlan.icon,
          badge: defaultPlan.badge,
          features: apiPlan.features
            ? apiPlan.features.map(text => ({ text, included: true }))
            : defaultPlan.features,
        };
      });
    }

    console.log('merged', merged); // ← temporaire
    setPlans(merged);

    if (currentResponse?.success && currentResponse?.data) {
      setCurrentSubscription(currentResponse.data);
    }
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || 'Erreur chargement des plans');
    setPlans(DEFAULT_PLANS);
  } finally {
    setLoading(false);
  }
};

  const handleSelectPlan = (planKey) => {
    if (planKey === 'free') {
      toast.info('Le plan gratuit est déjà actif');
      return;
    }
    navigate('/subscription/checkout', { state: { plan: planKey } });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-[#ccefeb] border-t-[#00BBA7] animate-spin" />
        <p className="text-sm text-gray-400">Chargement des plans…</p>
      </div>
    );
  }

  const currentPlan = currentSubscription?.current_plan ?? 'free';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#e6f7f5] opacity-60" />
          <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-[#66edd5] opacity-50" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-14 text-center">
          <span className="inline-flex items-center gap-1.5 bg-[#e6f7f5] text-[#009966] text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <StarSolid className="h-3 w-3 text-[#00BBA7]" />
            Semsar Premium
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
            Trouvez votre colocataire idéal,{' '}
            <span className="text-[#009966]">plus vite</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            Passez à un plan payant pour débloquer toutes les fonctionnalités et maximiser vos chances.
          </p>

          <div className="inline-flex mt-8 bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'cards'
                  ? 'bg-white text-[#009966] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <Squares2X2Icon className="h-4 w-4" /> Cartes
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'table'
                  ? 'bg-white text-[#009966] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <TableCellsIcon className="h-4 w-4" /> Tableau comparatif
            </button>
          </div>
        </div>
      </div>

      {/* Corps principal */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Bannière abonnement actuel */}
        {currentPlan !== 'free' && currentSubscription && (
          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#ccefeb] rounded-2xl px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#e6f7f5] flex items-center justify-center">
                <ShieldCheckIcon className="h-5 w-5 text-[#009966]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Votre abonnement actuel</p>
                <p className="text-sm text-gray-500">
                  Plan{' '}
                  <span className="font-medium text-[#009966]">
                    {currentPlan === 'premium' ? 'Premium' : 'Standard'}
                  </span>
                  {currentSubscription?.remaining_days > 0 && (
                    <> — expire dans{' '}
                      <span className="font-medium">{currentSubscription.remaining_days} jours</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            {currentPlan !== 'premium' && (
              <button
                onClick={() => handleSelectPlan('premium')}
                className="flex items-center gap-2 bg-[#009966] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#00734d] transition-colors shrink-0"
              >
                Passer à Premium <ArrowRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Vue CARTES */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
            {Object.keys(plans).map((key, i) => (
              <PlanCard
                key={key}
                planKey={key}
                plan={plans[key]}
                isCurrent={currentPlan === key}
                onSelect={() => handleSelectPlan(key)}
                featured={key === 'premium'}
                delay={i * 75}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Composant PlanCard
function PlanCard({ planKey, plan, isCurrent, onSelect, featured, delay }) {
  const styles = PLAN_STYLES[planKey];

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300
        ${featured
          ? 'ring-2 ' + styles.ring + ' shadow-xl shadow-[#ccefeb] scale-[1.02]'
          : 'ring-1 ' + styles.ring + ' shadow-sm hover:shadow-md'
        }`}
    >
      {plan.badge && (
        <div className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full ${styles.badgeBg}`}>
          {plan.badge}
        </div>
      )}

      <div className={`p-6 pb-5 ${featured ? styles.activeBg : ''}`}>
        <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl mb-3 ${styles.iconBg}`}>
          {plan.icon}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{plan.label}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{plan.tagline}</p>

        <div className="mt-4 flex items-end gap-1">
          {plan.price === 0 ? (
            <span className="text-3xl font-extrabold text-gray-900">Gratuit</span>
          ) : (
            <>
              <span className={`text-3xl font-extrabold ${styles.price}`}>{plan.price} MAD</span>
              <span className="text-gray-400 text-sm mb-1">/mois</span>
            </>
          )}
        </div>
      </div>

      <div className={`h-px mx-5 ${featured ? 'bg-[#ccefeb]' : 'bg-gray-100'}`} />

      <div className="p-6 flex-1 space-y-3">
        {plan.features?.map((f, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0
        ${f.included ? 'bg-[#e6f7f5]' : 'bg-gray-50'}`}>
              {f.included
                ? <CheckIcon className="h-3 w-3 text-[#009966] stroke-[2.5]" />
                : <span className="h-1.5 w-1.5 rounded-full bg-gray-300 block" />}
            </div>
            <span className={`text-sm ${f.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
              {f.text}
            </span>
          </div>
        ))}
      </div>

      <div className="p-5 pt-0">
        {isCurrent ? (
          <div className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-default">
            Plan actuel
          </div>
        ) : (
          <button
            onClick={onSelect}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${styles.btn}`}
          >
            {planKey === 'free' ? '' : `Choisir ${plan.label}`}
            {planKey !== 'free' && <ArrowRightIcon className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}