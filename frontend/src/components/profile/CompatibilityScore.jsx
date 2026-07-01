import { useTranslation } from 'react-i18next';

export default function CompatibilityScore({ score }) {
  const { t } = useTranslation();
  const getColor = () => {
    if (score >= 80) return { text: 'text-[#00BBA7]', stroke: '#00BBA7', bg: 'bg-[#e6f7f5]' };
    if (score >= 60) return { text: 'text-[#3fa79e]', stroke: '#4FD1C5', bg: 'bg-[#e6fcf8]' };
    return { text: 'text-[#00734d]', stroke: '#99dfd7', bg: 'bg-[#e6f7f5]' };
  };

  const getMessage = () => {
    if (score >= 80) return t('profile.compatibility.excellent');
    if (score >= 60) return t('profile.compatibility.good');
    if (score >= 40) return t('profile.compatibility.potential');
    return t('profile.compatibility.limited');
  };

  const { text, stroke } = getColor();
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex items-center gap-4">
      {/* Ring */}
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="#ccefeb" strokeWidth="5" />
          <circle
            cx="32" cy="32" r={radius}
            fill="none" stroke={stroke} strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${text}`}>
          {score}%
        </span>
      </div>

      {/* Label */}
      <div>
        <p className={`text-sm font-bold ${text}`}>{getMessage()}</p>
        <p className="text-xs text-gray-400 mt-0.5">{t('profile.compatibility.label')}</p>
      </div>
    </div>
  );
}