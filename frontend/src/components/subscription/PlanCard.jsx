import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

export function PlanCard({ planKey, plan, isCurrent, onSelect, featured = false, delay = 0 }) {
  const styles = PLAN_STYLES[planKey] ?? PLAN_STYLES.free;
console.log("plan",plan);
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300
        ${featured
          ? 'ring-2 ' + styles.ring + ' shadow-xl shadow-[#ccefeb] scale-[1.02]'
          : 'ring-1 ' + styles.ring + ' shadow-sm hover:shadow-md'
        }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full ${styles.badgeBg}`}>
          {plan.badge}
        </div>
      )}

      {/* Header */}
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

      {/* Features */}
      <div className="p-6 flex-1 space-y-3">
        {plan.features?.map((f, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0
              ${f.included ? 'bg-[#e6f7f5]' : 'bg-gray-50'}`}>
              {f.included
                ? <CheckIcon className="h-3 w-3 text-[#009966] stroke-[2.5]" />
                : <span className="h-1.5 w-1.5 rounded-full bg-gray-300 block" />
              }
            </div>
            <span className={`text-sm ${f.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
              {f.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
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
            {planKey === 'free' ? 'Commencer gratuitement' : `Choisir ${plan.label}`}
          </button>
        )}
      </div>
    </div>
  );
}