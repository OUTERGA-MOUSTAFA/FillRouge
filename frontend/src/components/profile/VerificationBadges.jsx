import { ShieldCheckIcon, IdentificationIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const badgeConfig = {
  email_verified: {
    icon: EnvelopeIcon,
    labelKey: 'profile.badges.email_verified',
    colors: 'bg-[#e6f7f5] text-[#00734d] ring-[#99dfd7]',
    iconColor: 'text-[#00BBA7]',
  },
  phone_verified: {
    icon: PhoneIcon,
    labelKey: 'profile.badges.phone_verified',
    colors: 'bg-[#e6fcf8] text-[#2f7d76] ring-[#99f3e3]',
    iconColor: 'text-[#4FD1C5]',
  },
  identity_verified: {
    icon: IdentificationIcon,
    labelKey: 'profile.badges.identity_verified',
    colors: 'bg-[#ccefeb] text-[#004d33] ring-[#66cfc3]',
    iconColor: 'text-[#009966]',
  },
  background_checked: {
    icon: ShieldCheckIcon,
    labelKey: 'profile.badges.background_checked',
    colors: 'bg-[#e6f7f5] text-[#00734d] ring-[#66cfc3]',
    iconColor: 'text-[#009966]',
  },
  premium: {
    icon: ShieldCheckIcon,
    labelKey: 'profile.badges.premium',
    colors: 'bg-[#e6f7f5] text-[#00734d] ring-amber-200',
    iconColor: 'text-amber-500',
  },
};

export default function VerificationBadges({ badges }) {
  const { t } = useTranslation();
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {badges.map(badge => {
        const config = badgeConfig[badge];
        if (!config) return null;
        const Icon = config.icon;
        return (
          <div
            key={badge}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${config.colors}`}
          >
            <Icon className={`h-3 w-3 ${config.iconColor}`} />
            {t(config.labelKey)}
          </div>
        );
      })}
    </div>
  );
}