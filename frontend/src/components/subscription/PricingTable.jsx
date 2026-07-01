import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

export default function PricingTable({ currentPlan, onSelect }) {
  const { t } = useTranslation();
  const features = [
    { name: t('subscription.table.profile'), free: true, standard: true, premium: true },
    { name: t('subscription.table.listingsPublished'), free: t('subscription.table.maxCount', { n: 2 }), standard: '10', premium: t('subscription.table.unlimited') },
    { name: t('subscription.table.messagesPerDay'), free: '5', standard: '50', premium: t('subscription.table.unlimited') },
    { name: t('subscription.table.whoViewedProfile'), free: false, standard: true, premium: true },
    { name: t('subscription.features.advancedFilters'), free: false, standard: true, premium: true },
    { name: t('subscription.table.premiumBadge'), free: false, standard: false, premium: true },
    { name: t('subscription.features.featuredProfile'), free: false, standard: false, premium: true },
    { name: t('subscription.table.noAds'), free: false, standard: true, premium: true },
    { name: t('subscription.features.prioritySupport'), free: false, standard: false, premium: true },
    { name: t('subscription.table.backgroundCheck'), free: false, standard: false, premium: t('subscription.table.oneFreePerYear') },
  ];

  console.log("plan");

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">{t('subscription.table.featureHeader')}</th>
            <th className="p-4 text-center bg-gray-50 rounded-t-lg">{t('subscription.plans.free')}</th>
            <th className="p-4 text-center bg-gray-50 rounded-t-lg">{t('subscription.plans.standard')}</th>
            <th className="p-4 text-center bg-[#e6f7f5] rounded-t-lg">{t('subscription.plans.premium')}</th>
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
                {currentPlan === 'free' ? t('subscription.table.current') : t('subscription.plans.free')}
              </button>
            </td>
            <td className="p-4 text-center">
              <button
                onClick={() => onSelect?.('standard')}
                disabled={currentPlan === 'standard'}
                className="btn-secondary w-full text-sm"
              >
                {currentPlan === 'standard' ? t('subscription.table.current') : t('subscription.table.pricePerMonth', { price: 99 })}
              </button>
            </td>
            <td className="p-4 text-center">
              <button
                onClick={() => onSelect?.('premium')}
                disabled={currentPlan === 'premium'}
                className="btn-primary w-full text-sm"
              >
                {currentPlan === 'premium' ? t('subscription.table.current') : t('subscription.table.pricePerMonth', { price: 199 })}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}