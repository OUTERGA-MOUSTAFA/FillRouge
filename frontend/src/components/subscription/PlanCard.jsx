import { CheckIcon } from '@heroicons/react/24/solid';

export default function PlanCard({ plan, isCurrent, onSelect, featured = false }) {
  const getPlanName = (key) => {
    const names = { free: 'Gratuit', standard: 'Standard', premium: 'Premium' };
    return names[key] || key;
  };

  const getPlanPrice = (key) => {
    const prices = { free: '0 MAD', standard: '99 MAD/mois', premium: '199 MAD/mois' };
    return prices[key] || '0 MAD';
  };

  const features = {
    free: [
      'Profil de base',
      '2 annonces maximum',
      '5 messages par jour',
      'Recherche basique',
    ],
    standard: [
      'Tout ce qui est dans Gratuit',
      '10 annonces maximum',
      '50 messages par jour',
      'Filtres avancés',
      'Profil mis en avant',
      'Support prioritaire',
    ],
    premium: [
      'Tout ce qui est dans Standard',
      'Annonces illimitées',
      'Messages illimités',
      'Badge "Premium"',
      'Background check offert',
      'Support VIP 24/7',
    ],
  };

  return (
    <div className={`card p-6 ${featured ? 'ring-2 ring-primary-500 relative' : ''}`}>
      {featured && (
        <div className="absolute top-0 right-0 bg-primary-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
          POPULAIRE
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">{getPlanName(plan)}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold text-primary-600">{getPlanPrice(plan)}</span>
        </div>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features[plan]?.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button
        onClick={() => onSelect?.(plan)}
        disabled={isCurrent}
        className={`w-full ${isCurrent ? 'bg-gray-300 cursor-not-allowed' : plan === 'free' ? 'btn-secondary' : 'btn-primary'}`}
      >
        {isCurrent ? 'Plan actuel' : plan === 'free' ? 'Plan gratuit' : 'S\'abonner'}
      </button>
    </div>
  );
}