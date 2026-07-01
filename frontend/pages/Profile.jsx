import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../src/store/authStore';
import { authService } from '../src/services/auth';
import ReviewsList from '../src/components/profile/ReviewsList';
import {
  UserIcon, BoltIcon,
  PhoneIcon,
  CalendarIcon,
  BriefcaseIcon,
  MapPinIcon,
  WalletIcon,
  StarIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  PencilIcon,
  HomeIcon,
  HeartIcon,
  MoonIcon,
  FireIcon,
  UserGroupIcon,
  SparklesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { t } = useTranslation();
  const { setUser, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await authService.getMe();
      setProfile(response.data);
      setUser(response.data);
    } catch (error) {
      toast.error(t('profile.me.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success(t('profile.me.logout_success'));
    window.location.href = '/login';
  };

  const subscriptionEndsAt = profile?.subscription_ends_at;
  const daysLeft = subscriptionEndsAt
    ? Math.ceil((new Date(subscriptionEndsAt) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;


  const getCompletionPercentage = () => {
    if (!profile?.profile) return 0;
    let score = 0;
    if (profile.full_name) score += 10;
    if (profile.phone) score += 5;
    if (profile.birth_date) score += 5;
    if (profile.gender) score += 5;
    if (profile.profession) score += 5;
    if (profile.profile?.city) score += 5;
    if (profile.profile?.bio && profile.profile.bio.length > 20) score += 10;
    if (profile.profile?.interests?.length > 0) score += 10;
    if (profile.profile?.smoking) score += 5;
    if (profile.profile?.pets) score += 5;
    if (profile.profile?.sleep_schedule) score += 5;
    if (profile.profile?.cleanliness) score += 5;
    if (profile.profile?.social_level) score += 5;
    if (profile.email_verified_at) score += 10;
    if (profile.phone_verified_at) score += 10;
    return Math.min(100, score);
  };

  const completion = getCompletionPercentage();
  const isProfileComplete = completion >= 80;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BBA7]"></div>
      </div>
    );
  }

  if (!profile) return null;

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  const getLabel = (value, options) => {
    const option = options.find(opt => opt.value === value);
    return option?.label || value;
  };

  const smokingOptions = [
    { value: 'no', label: t('profile.me.smoking.no') },
    { value: 'occasionally', label: t('profile.me.smoking.occasionally') },
    { value: 'yes', label: t('profile.me.smoking.yes') }
  ];

  const petsOptions = [
    { value: 'no', label: t('profile.me.pets.no') },
    { value: 'maybe', label: t('profile.me.pets.maybe') },
    { value: 'yes', label: t('profile.me.pets.yes') }
  ];

  const sleepOptions = [
    { value: 'early_bird', label: t('profile.me.sleep.early_bird') },
    { value: 'flexible', label: t('profile.me.sleep.flexible') },
    { value: 'night_owl', label: t('profile.me.sleep.night_owl') }
  ];

  const cleanlinessOptions = [
    { value: 'relaxed', label: t('profile.me.cleanliness.relaxed') },
    { value: 'moderate', label: t('profile.me.cleanliness.moderate') },
    { value: 'very_clean', label: t('profile.me.cleanliness.very_clean') }
  ];

  const socialOptions = [
    { value: 'introvert', label: t('profile.me.social.introvert') },
    { value: 'ambivert', label: t('profile.me.social.ambivert') },
    { value: 'extrovert', label: t('profile.me.social.extrovert') }
  ];

  const genderOptions = [
    { value: 'male', label: t('profile.me.gender.male') },
    { value: 'female', label: t('profile.me.gender.female') },
    { value: 'other', label: t('profile.me.gender.other') }
  ];

  const interestLabels = {
    cooking: t('profile.me.interests.cooking'), fitness: t('profile.me.interests.fitness'), tech: t('profile.me.interests.tech'), travel: t('profile.me.interests.travel'),
    study: t('profile.me.interests.study'), remote_work: t('profile.me.interests.remote_work'), music: t('profile.me.interests.music'), sports: t('profile.me.interests.sports'),
    reading: t('profile.me.interests.reading'), art: t('profile.me.interests.art'), gaming: t('profile.me.interests.gaming'), outdoors: t('profile.me.interests.outdoors')
  };


  const isPremium = profile?.subscription_plan === 'premium' || profile?.is_premium;
  const isStandard = profile?.subscription_plan === 'standard';
  const subscriptionPlan = profile?.subscription_plan;

  // const isPremium = profile?.subscription_plan === 'premium' || profile?.is_premium;
  // Configuration des couleurs selon le plan
  const getPlanConfig = () => {
    if (isPremium) {
      return {
        name: t('profile.me.plan.premium'),
        color: 'amber',
        gradient: 'from-amber-400 to-amber-500',
        bgLight: 'bg-amber-50',
        textLight: 'text-amber-700',
        borderLight: 'border-amber-200',
        icon: <SparklesIcon className="h-5 w-5" />,
        features: [t('profile.me.features.unlimited_messages'), t('profile.me.features.unlimited_listings'), t('profile.me.features.featured_profile'), t('profile.me.features.vip_support')]
      };
    }
    if (isStandard) {
      return {
        name: t('profile.me.plan.standard'),
        color: 'teal',
        gradient: 'from-teal-400 to-teal-500',
        bgLight: 'bg-teal-50',
        textLight: 'text-teal-700',
        borderLight: 'border-teal-200',
        icon: <BoltIcon className="h-5 w-5" />,
        features: [t('profile.me.features.messages_50_day'), t('profile.me.features.listings_10_max'), t('profile.me.features.featured_profile'), t('profile.me.features.priority_support')]
      };
    }
    return {
      name: t('profile.me.plan.free'),
      color: 'gray',
      gradient: 'from-gray-400 to-gray-500',
      bgLight: 'bg-gray-50',
      textLight: 'text-gray-600',
      borderLight: 'border-gray-200',
      icon: <UserIcon className="h-5 w-5" />,
      features: [t('profile.me.features.messages_5_day'), t('profile.me.features.listings_2_max'), t('profile.me.features.basic_profile')]
    };
  };

  const planConfig = getPlanConfig();
  return (
    <div className="min-h-screen px-4 w-full bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Header avec dégradé selon le plan */}
      <div className={`bg-gradient-to-r px-4 ${isPremium ? 'from-[#009966] to-[#00BBA7]' :
        isStandard ? 'from-teal-600 to-teal-500' :
          'from-[#009966] to-[#00BBA7]'
        } text-white`}>
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar avec anneau selon le plan */}
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.full_name}
                  className={`h-28 w-28 rounded-full object-cover border-4 shadow-lg ${isPremium ? 'border-amber-400 ring-4 ring-amber-300/50' :
                    isStandard ? 'border-teal-400 ring-4 ring-teal-300/50' :
                      'border-white'
                    }`}
                />
              ) : (
                <div className={`h-28 w-28 rounded-full bg-white/20 flex items-center justify-center shadow-lg ${isPremium ? 'border-4 border-amber-400 ring-4 ring-amber-300/50' :
                  isStandard ? 'border-4 border-teal-400 ring-4 ring-teal-300/50' :
                    'border-4 border-white'
                  }`}>
                  <span className="text-4xl text-white font-bold">{getInitials(profile.full_name)}</span>
                </div>
              )}
              <Link
                to="/profile/edit"
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:scale-105 transition-transform"
              >
                <PencilIcon className="h-4 w-4 text-[#009966]" />
              </Link>

              {/* Badge sur l'avatar */}
              {isPremium && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full p-1.5 shadow-lg">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </div>
              )}
              {isStandard && !isPremium && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full p-1.5 shadow-lg">
                  <BoltIcon className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Infos utilisateur */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl font-bold">{profile.full_name}</h1>

                {/* Badge selon le plan */}
                {isPremium && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-gray-800 rounded-full text-xs font-bold shadow-sm">
                    <SparklesIcon className="h-3.5 w-3.5" />
                    PREMIUM
                  </span>
                )}
                {isStandard && !isPremium && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-400 text-white rounded-full text-xs font-bold shadow-sm">
                    <BoltIcon className="h-3.5 w-3.5" />
                    STANDARD
                  </span>
                )}
              </div>
              <p className="text-white/80">{profile.email}</p>
              {profile.phone && (
                <p className="text-white/70 text-sm flex items-center justify-center md:justify-start gap-1 mt-1">
                  <PhoneIcon className="h-4 w-4" /> {profile.phone}
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                {profile.email_verified_at && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                    <CheckCircleIcon className="h-3 w-3" /> {t('profile.me.email_verified')}
                  </span>
                )}
                {profile.profile?.is_identity_verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                    <ShieldCheckIcon className="h-3 w-3" /> {t('profile.me.identity_verified')}
                  </span>
                )}

                {/* Badge plan */}
                {isPremium && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-400 text-gray-800 rounded-full text-xs font-semibold shadow-sm">
                    <SparklesIcon className="h-3 w-3" />
                    {t('profile.me.plan.premium')}
                  </span>
                )}
                {isStandard && !isPremium && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-400 text-white rounded-full text-xs font-semibold shadow-sm">
                    <BoltIcon className="h-3 w-3" />
                    {t('profile.me.plan.standard')}
                  </span>
                )}
              </div>

              {/* Info abonnement */}
              {subscriptionPlan !== 'free' && subscriptionEndsAt && daysLeft > 0 && (
                <p className="text-white/70 text-xs mt-2 flex items-center justify-center md:justify-start gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {t('profile.me.subscription_valid', { plan: planConfig.name, date: new Date(subscriptionEndsAt).toLocaleDateString('fr-FR') })}
                  {daysLeft <= 7 && (
                    <span className={`font-medium ml-1 ${isPremium ? 'text-amber-200' : 'text-teal-200'
                      }`}>
                      {t('profile.me.days_left', { count: daysLeft })}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                to="/profile/edit"
                className="px-4 py-2 bg-white text-[#009966] rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                {t('profile.me.edit')}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                {t('profile.me.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section des avantages selon le plan */}
      {subscriptionPlan !== 'free' && (
        <div className={`bg-gradient-to-r ${isPremium ? 'from-amber-50 to-amber-100 border-amber-200' : 'from-teal-50 to-teal-100 border-teal-200'
          } border-b`}>
          <div className="container-custom p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                {planConfig.icon}
                <span className={`text-sm font-medium ${isPremium ? 'text-amber-800' : 'text-teal-800'
                  }`}>
                  ✨ {t('profile.me.plan_benefit', { plan: planConfig.name })}
                </span>
                <div className="flex gap-2 text-xs">
                  {planConfig.features.map((feature, idx) => (
                    <span key={idx} className={`${isPremium ? 'text-amber-600' : 'text-teal-600'
                      }`}>
                      • {feature}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to="/subscription/plans"
                className={`text-xs font-medium underline ${isPremium ? 'text-amber-700 hover:text-amber-900' : 'text-teal-700 hover:text-teal-900'
                  }`}
              >
                {subscriptionPlan === 'standard' ? t('profile.me.upgrade_premium') : t('profile.me.manage_subscription')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Si l'utilisateur est standard, ajouter une invitation à passer premium
      {isStandard && !isPremium && (
        <div className="container-custom py-4">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <SparklesIcon className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="font-semibold text-amber-800">Passez à Premium pour encore plus d'avantages !</p>
                  <p className="text-sm text-amber-600">Messages illimités, annonces illimitées, badge exclusif et support VIP</p>
                </div>
              </div>
              <Link
                to="/subscription/plans"
                className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors"
              >
                Upgrade to Premium →
              </Link>
            </div>
          </div>
        </div>
      )} */}

      {/* Barre de progression du profil */}
      <div className="bg-white border-b shadow-sm">
        <div className="container-custom p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{t('profile.me.completion')}</span>
                <span className="text-[#009966] font-medium">{completion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#009966] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
            </div>
            {!isProfileComplete && (
              <Link
                to="/complete-profile"
                className="px-4 py-2 bg-[#009966] text-white rounded-lg text-sm font-medium hover:bg-[#00BBA7] transition-colors"
              >
                {t('profile.me.complete_profile')}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'info'
                    ? 'bg-[#00BBA7]/10 text-[#009966] font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>{t('profile.me.tabs.info')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('interests')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'interests'
                    ? 'bg-[#00BBA7]/10 text-[#009966] font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <HeartIcon className="h-5 w-5" />
                  <span>{t('profile.me.tabs.interests')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('lifestyle')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'lifestyle'
                    ? 'bg-[#00BBA7]/10 text-[#009966] font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>{t('profile.me.tabs.lifestyle')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'preferences'
                    ? 'bg-[#00BBA7]/10 text-[#009966] font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <UserGroupIcon className="h-5 w-5" />
                  <span>{t('profile.me.tabs.preferences')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'security'
                    ? 'bg-[#00BBA7]/10 text-[#009966] font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>{t('profile.me.tabs.security')}</span>
                </button>
              </nav>

              {/* Stats rapides */}
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('profile.me.member_since')}</span>
                    <span className="font-medium">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : t('profile.me.na')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('profile.me.listings')}</span>
                    <span className="font-medium text-[#009966]">{profile.listings_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('profile.me.reviews')}</span>
                    <span className="font-medium">{profile.reviews_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('profile.me.average_rating')}</span>
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium">{profile.average_rating || 0}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab: Informations */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Bio */}
                {profile.profile?.bio && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5 text-[#00BBA7]" />
                      {t('profile.me.about')}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{profile.profile.bio}</p>
                  </div>
                )}

                {/* Informations détaillées */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.me.personal_info')}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <UserIcon className="h-5 w-5 text-[#4FD1C5]" />
                      <div>
                        <p className="text-xs text-gray-400">{t('profile.me.full_name')}</p>
                        <p className="font-medium">{profile.full_name}</p>
                      </div>
                    </div>
                    {profile.gender && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <UserIcon className="h-5 w-5 text-[#4FD1C5]" />
                        <div>
                          <p className="text-xs text-gray-400">{t('profile.me.gender_label')}</p>
                          <p className="font-medium">{getLabel(profile.gender, genderOptions)}</p>
                        </div>
                      </div>
                    )}
                    {profile.birth_date && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <CalendarIcon className="h-5 w-5 text-[#4FD1C5]" />
                        <div>
                          <p className="text-xs text-gray-400">{t('profile.me.birth_date')}</p>
                          <p className="font-medium">{new Date(profile.birth_date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    )}
                    {profile.profession && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <BriefcaseIcon className="h-5 w-5 text-[#4FD1C5]" />
                        <div>
                          <p className="text-xs text-gray-400">{t('profile.me.profession')}</p>
                          <p className="font-medium">{profile.profession}</p>
                        </div>
                      </div>
                    )}
                    {profile.profile?.city && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPinIcon className="h-5 w-5 text-[#4FD1C5]" />
                        <div>
                          <p className="text-xs text-gray-400">{t('profile.me.city')}</p>
                          <p className="font-medium">{profile.profile.city}</p>
                        </div>
                      </div>
                    )}
                    {profile.profile?.neighborhood && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPinIcon className="h-5 w-5 text-[#4FD1C5]" />
                        <div>
                          <p className="text-xs text-gray-400">{t('profile.me.neighborhood')}</p>
                          <p className="font-medium">{profile.profile.neighborhood}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget */}
                {(profile.budget_min || profile.budget_max) && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.me.budget')}</h3>
                    <div className="flex items-center gap-3 text-gray-600">
                      <WalletIcon className="h-5 w-5 text-[#4FD1C5]" />
                      <div>
                        <p className="text-xs text-gray-400">{t('profile.me.monthly_budget')}</p>
                        <p className="font-medium text-[#009966]">
                          {profile.budget_min && profile.budget_max
                            ? t('profile.me.budget_range', { min: profile.budget_min, max: profile.budget_max })
                            : profile.budget_min
                              ? t('profile.me.budget_from', { min: profile.budget_min })
                              : t('profile.me.budget_up_to', { max: profile.budget_max })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Centres d'intérêt */}
            {activeTab === 'interests' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HeartIcon className="h-5 w-5 text-[#00BBA7]" />
                  {t('profile.me.interests_title')}
                </h3>
                {profile.profile?.interests?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1.5 bg-[#00BBA7]/10 text-[#009966] rounded-full text-sm font-medium"
                      >
                        {interestLabels[interest] || interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">{t('profile.me.no_interests')}</p>
                )}
              </div>
            )}

            {/* Tab: Mode de vie */}
            {activeTab === 'lifestyle' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-[#00BBA7]" />
                  {t('profile.me.lifestyle_title')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.profile?.smoking && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500 flex items-center gap-2">
                        <FireIcon className="h-4 w-4 text-gray-400" /> {t('profile.me.tobacco')}
                      </span>
                      <span className="font-medium">{getLabel(profile.profile.smoking, smokingOptions)}</span>
                    </div>
                  )}
                  {profile.profile?.pets && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500 flex items-center gap-2">
                        <HeartIcon className="h-4 w-4 text-gray-400" /> {t('profile.me.pets_label')}
                      </span>
                      <span className="font-medium">{getLabel(profile.profile.pets, petsOptions)}</span>
                    </div>
                  )}
                  {profile.profile?.sleep_schedule && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500 flex items-center gap-2">
                        <MoonIcon className="h-4 w-4 text-gray-400" /> {t('profile.me.sleep_label')}
                      </span>
                      <span className="font-medium">{getLabel(profile.profile.sleep_schedule, sleepOptions)}</span>
                    </div>
                  )}
                  {profile.profile?.cleanliness && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500 flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-gray-400" /> {t('profile.me.cleanliness_label')}
                      </span>
                      <span className="font-medium">{getLabel(profile.profile.cleanliness, cleanlinessOptions)}</span>
                    </div>
                  )}
                  {profile.profile?.social_level && (
                    <div className="flex justify-between py-2 border-b md:col-span-2">
                      <span className="text-gray-500 flex items-center gap-2">
                        <UserGroupIcon className="h-4 w-4 text-gray-400" /> {t('profile.me.social_label')}
                      </span>
                      <span className="font-medium">{getLabel(profile.profile.social_level, socialOptions)}</span>
                    </div>
                  )}
                </div>
                {!profile.profile?.smoking && !profile.profile?.pets && !profile.profile?.sleep_schedule && !profile.profile?.cleanliness && (
                  <p className="text-gray-500 text-center py-4">{t('profile.me.no_lifestyle')}</p>
                )}
              </div>
            )}

            {/* Tab: Préférences colocataire */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-[#00BBA7]" />
                  {t('profile.me.roommate_prefs')}
                </h3>
                <div className="space-y-4">
                  {profile.profile?.preferred_gender && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">{t('profile.me.preferred_gender')}</span>
                      <span className="font-medium">
                        {profile.profile.preferred_gender === 'male' ? t('profile.me.gender.male') :
                          profile.profile.preferred_gender === 'female' ? t('profile.me.gender.female') : t('profile.me.gender.any')}
                      </span>
                    </div>
                  )}
                  {profile.profile?.accepts_pets !== null && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">{t('profile.me.accepts_pets')}</span>
                      <span className="font-medium">{profile.profile.accepts_pets ? t('profile.me.yes') : t('profile.me.no')}</span>
                    </div>
                  )}
                  {profile.profile?.accepts_smokers !== null && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">{t('profile.me.accepts_smokers')}</span>
                      <span className="font-medium">{profile.profile.accepts_smokers ? t('profile.me.yes') : t('profile.me.no')}</span>
                    </div>
                  )}
                  {(profile.profile?.preferred_min_age || profile.profile?.preferred_max_age) && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">{t('profile.me.preferred_age_range')}</span>
                      {/* <span className="font-medium">
                        {profile.profile.preferred_min_age || '18'} - {now() - profile.birth_date || '100'} ans
                      </span> */}
                    </div>
                  )}
                </div>
                {!profile.profile?.preferred_gender && !profile.profile?.accepts_pets && !profile.profile?.accepts_smokers && (
                  <p className="text-gray-500 text-center py-4">{t('profile.me.no_preferences')}</p>
                )}
              </div>
            )}

            {/* Tab: Sécurité */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.me.verifications')}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <div>
                        <p className="font-medium">{t('profile.me.email')}</p>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                      </div>
                      {profile.email_verified_at ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircleIcon className="h-4 w-4" /> {t('profile.me.verified')}
                        </span>
                      ) : (
                        <button className="text-[#009966] text-sm">{t('profile.me.verify')}</button>
                      )}
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <div>
                        <p className="font-medium">{t('profile.me.phone')}</p>
                        <p className="text-sm text-gray-500">{profile.phone || t('profile.me.not_provided')}</p>
                      </div>
                      {profile.phone_verified_at ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircleIcon className="h-4 w-4" /> {t('profile.me.verified')}
                        </span>
                      ) : (
                        <button className="text-[#009966] text-sm">{t('profile.me.verify')}</button>
                      )}
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <div>
                        <p className="font-medium">{t('profile.me.identity_cin')}</p>
                        <p className="text-sm text-gray-500">{t('profile.me.official_document')}</p>
                      </div>
                      {profile.profile?.is_identity_verified ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircleIcon className="h-4 w-4" /> {t('profile.me.verified')}
                        </span>
                      ) : (
                        <button className="text-[#009966] text-sm">{t('profile.me.submit')}</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.me.two_factor_title')}</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{t('profile.me.two_factor_short')}</p>
                      <p className="text-sm text-gray-500">{t('profile.me.secure_account')}</p>
                    </div>
                    <button className="px-4 py-2 bg-[#009966] text-white rounded-lg text-sm hover:bg-[#00BBA7] transition-colors">
                      {profile.two_factor_enabled ? t('profile.me.disable') : t('profile.me.enable')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}