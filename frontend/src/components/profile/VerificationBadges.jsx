import { ShieldCheckIcon, IdentificationIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const badgeConfig = {
  email_verified: { icon: EnvelopeIcon, label: 'Email vérifié', color: 'text-green-600' },
  phone_verified: { icon: PhoneIcon, label: 'Téléphone vérifié', color: 'text-green-600' },
  identity_verified: { icon: IdentificationIcon, label: 'Identité vérifiée', color: 'text-blue-600' },
  background_checked: { icon: ShieldCheckIcon, label: 'Background check', color: 'text-purple-600' },
  premium: { icon: ShieldCheckIcon, label: 'Premium', color: 'text-yellow-600' },
};

export default function VerificationBadges({ badges }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-3">
      {badges.map((badge) => {
        const config = badgeConfig[badge];
        if (!config) return null;
        const Icon = config.icon;
        return (
          <div key={badge} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
            <Icon className={`h-3 w-3 ${config.color}`} />
            <span className="text-xs text-gray-600">{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}