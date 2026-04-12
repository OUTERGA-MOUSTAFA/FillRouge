import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function PricingTable({ plans, currentPlan, onSelect }) {
  const features = [
    { name: 'Profil', free: true, standard: true, premium: true },
    { name: 'Annonces publiées', free: '2 max', standard: '10', premium: 'Illimité' },
    { name: 'Messages par jour', free: '5', standard: '50', premium: 'Illimité' },
    { name: 'Voir qui a vu mon profil', free: false, standard: true, premium: true },
    { name: 'Filtres avancés', free: false, standard: true, premium: true },
    { name: 'Badge "Premium"', free: false, standard: false, premium: true },
    { name: 'Profil mis en avant', free: false, standard: false, premium: true },
    { name: 'Pas de publicités', free: false, standard: true, premium: true },
    { name: 'Support prioritaire', free: false, standard: false, premium: true },
    { name: 'Background check', free: false, standard: false, premium: '1 gratuit/an' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Fonctionnalité</th>
            <th className="p-4 text-center bg-gray-50 rounded-t-lg">Gratuit</th>
            <th className="p-4 text-center bg-gray-50 rounded-t-lg">Standard</th>
            <th className="p-4 text-center bg-primary-50 rounded-t-lg">Premium</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-b">
              <td className="p-4 font-medium">{feature.name}</td>
              <td className="p-4 text-center">
                {typeof feature.free === 'boolean' ? (
                  feature.free ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <XMarkIcon className="h-5 w-5 text-red-500 mx-auto" />
                ) : (
                  <span className="text-sm">{feature.free}</span>
                )}
              </td>
              <td className="p-4 text-center">
                {typeof feature.standard === 'boolean' ? (
                  feature.standard ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <XMarkIcon className="h-5 w-5 text-red-500 mx-auto" />
                ) : (
                  <span className="text-sm">{feature.standard}</span>
                )}
              </td>
              <td className="p-4 text-center">
                {typeof feature.premium === 'boolean' ? (
                  feature.premium ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <XMarkIcon className="h-5 w-5 text-red-500 mx-auto" />
                ) : (
                  <span className="text-sm">{feature.premium}</span>
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td className="p-4"></td>
            <td className="p-4 text-center">
              <button
                onClick={() => onSelect?.('free')}
                disabled={currentPlan === 'free'}
                className="btn-secondary w-full text-sm"
              >
                {currentPlan === 'free' ? 'Actuel' : 'Gratuit'}
              </button>
            </td>
            <td className="p-4 text-center">
              <button
                onClick={() => onSelect?.('standard')}
                disabled={currentPlan === 'standard'}
                className="btn-secondary w-full text-sm"
              >
                {currentPlan === 'standard' ? 'Actuel' : '99 MAD/mois'}
              </button>
            </td>
            <td className="p-4 text-center">
              <button
                onClick={() => onSelect?.('premium')}
                disabled={currentPlan === 'premium'}
                className="btn-primary w-full text-sm"
              >
                {currentPlan === 'premium' ? 'Actuel' : '199 MAD/mois'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}