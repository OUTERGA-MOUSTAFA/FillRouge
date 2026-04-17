import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../src/store/authStore';
import { authService } from '../src/services/auth';
import ReviewsList from '../src/components/profile/ReviewsList';
import {
  UserIcon,
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

export default function Profile() {
  const { user, setUser, logout } = useAuthStore();
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
      toast.error('Erreur chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnecté avec succès');
    window.location.href = '/login';
  };

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
    { value: 'no', label: 'Non-fumeur' },
    { value: 'occasionally', label: 'Occasionnel' },
    { value: 'yes', label: 'Fumeur' }
  ];

  const petsOptions = [
    { value: 'no', label: 'Non' },
    { value: 'maybe', label: 'Peut-être' },
    { value: 'yes', label: 'Oui' }
  ];

  const sleepOptions = [
    { value: 'early_bird', label: 'Lève-tôt' },
    { value: 'flexible', label: 'Flexible' },
    { value: 'night_owl', label: 'Couche-tard' }
  ];

  const cleanlinessOptions = [
    { value: 'relaxed', label: 'Relax' },
    { value: 'moderate', label: 'Modéré' },
    { value: 'very_clean', label: 'Très propre' }
  ];

  const socialOptions = [
    { value: 'introvert', label: 'Introverti' },
    { value: 'ambivert', label: 'Ambiverti' },
    { value: 'extrovert', label: 'Extraverti' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Homme' },
    { value: 'female', label: 'Femme' },
    { value: 'other', label: 'Autre' }
  ];

  const interestLabels = {
    cooking: 'Cuisine', fitness: 'Sport', tech: 'Technologie', travel: 'Voyage',
    study: 'Études', remote_work: 'Télétravail', music: 'Musique', sports: 'Sports',
    reading: 'Lecture', art: 'Art', gaming: 'Jeux vidéo', outdoors: 'Plein air'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header avec dégradé */}
      <div className="bg-gradient-to-r from-[#009966] to-[#00BBA7] text-white">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.full_name}
                  className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-4xl text-white font-bold">{getInitials(profile.full_name)}</span>
                </div>
              )}
              <Link
                to="/profile/edit"
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:scale-105 transition-transform"
              >
                <PencilIcon className="h-4 w-4 text-[#009966]" />
              </Link>
            </div>

            {/* Infos utilisateur */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <p className="text-white/80">{profile.email}</p>
              {profile.phone && (
                <p className="text-white/70 text-sm flex items-center justify-center md:justify-start gap-1 mt-1">
                  <PhoneIcon className="h-4 w-4" /> {profile.phone}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                {profile.email_verified_at && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                    <CheckCircleIcon className="h-3 w-3" /> Email vérifié
                  </span>
                )}
                {profile.profile?.is_identity_verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                    <ShieldCheckIcon className="h-3 w-3" /> Identité vérifiée
                  </span>
                )}
                {profile.is_premium && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400 text-gray-800 rounded-full text-xs font-semibold">
                    ⭐ Premium
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                to="/profile/edit"
                className="px-4 py-2 bg-white text-[#009966] rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Modifier
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression du profil */}
      <div className="bg-white border-b shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Complétion du profil</span>
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
                Compléter mon profil
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'info'
                      ? 'bg-[#00BBA7]/10 text-[#009966] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Informations</span>
                </button>
                <button
                  onClick={() => setActiveTab('interests')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'interests'
                      ? 'bg-[#00BBA7]/10 text-[#009966] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <HeartIcon className="h-5 w-5" />
                  <span>Centres d'intérêt</span>
                </button>
                <button
                  onClick={() => setActiveTab('lifestyle')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'lifestyle'
                      ? 'bg-[#00BBA7]/10 text-[#009966] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>Mode de vie</span>
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'preferences'
                      ? 'bg-[#00BBA7]/10 text-[#009966] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserGroupIcon className="h-5 w-5" />
                  <span>Préférences</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'security'
                      ? 'bg-[#00BBA7]/10 text-[#009966] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Sécurité</span>
                </button>
              </nav>

              {/* Stats rapides */}
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Membre depuis</span>
                    <span className="font-medium">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Annonces</span>
                    <span className="font-medium text-[#009966]">{profile.listings_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Avis</span>
                    <span className="font-medium">{profile.reviews_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Note moyenne</span>
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
                      À propos
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{profile.profile.bio}</p>
                  </div>
                )}

                {/* Informations détaillées */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <UserIcon className="h-5 w-5 text-[#4FD1C5]" />
                      <div>
                        <p className="text-xs text-gray-400">Nom complet</p>
                        <p className="font-medium">{profile.full_name}</p>
                      </div>
                    </div>
                    {profile.gender && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <UserIcon className="h-5 w-5 text-[#4FD1C5]" />
                        <div>
                          <p className="text-xs text-gray-400">Genre</p>
                          <p className="font-medium">{getLabel(profile.gender, genderOptions)}</p>
                        </div>
                      </div>
                    )}
                    {profile.birth_date && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <CalendarIcon className="h-5 w-5 text-[#4FD1C5]" />
                        <div>
                          <p className="text-xs text-gray-400">Date de naissance</p>
                          <p className="font-medium">{new Date(profile.birth_date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    )}
                    {profile.profession && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <BriefcaseIcon className="h-5 w-5 text-[#4FD1C5]" />
                        <div>
                          <p className="text-xs text-gray-400">Profession</p>
                          <p className="font-medium">{profile.profession}</p>
                        </div>
                      </div>
                    )}
                    {profile.profile?.city && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPinIcon className="h-5 w-5 text-[#4FD1C5]" />
                        <div>
                          <p className="text-xs text-gray-400">Ville</p>
                          <p className="font-medium">{profile.profile.city}</p>
                        </div>
                      </div>
                    )}
                    {profile.profile?.neighborhood && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPinIcon className="h-5 w-5 text-[#4FD1C5]" />
                        <div>
                          <p className="text-xs text-gray-400">Quartier</p>
                          <p className="font-medium">{profile.profile.neighborhood}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget */}
                {(profile.budget_min || profile.budget_max) && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget</h3>
                    <div className="flex items-center gap-3 text-gray-600">
                      <WalletIcon className="h-5 w-5 text-[#4FD1C5]" />
                      <div>
                        <p className="text-xs text-gray-400">Budget mensuel</p>
                        <p className="font-medium text-[#009966]">
                          {profile.budget_min && profile.budget_max
                            ? `${profile.budget_min} - ${profile.budget_max} MAD`
                            : profile.budget_min
                              ? `À partir de ${profile.budget_min} MAD`
                              : `Jusqu'à ${profile.budget_max} MAD`}
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
                  Centres d'intérêt
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
                  <p className="text-gray-500 text-center py-4">Aucun centre d'intérêt renseigné</p>
                )}
              </div>
            )}

            {/* Tab: Mode de vie */}
            {activeTab === 'lifestyle' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-[#00BBA7]" />
                  Mode de vie
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.profile?.smoking && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500 flex items-center gap-2">
                        <FireIcon className="h-4 w-4 text-gray-400" /> Tabac
                      </span>
                      <span className="font-medium">{getLabel(profile.profile.smoking, smokingOptions)}</span>
                    </div>
                  )}
                  {profile.profile?.pets && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500 flex items-center gap-2">
                        <HeartIcon className="h-4 w-4 text-gray-400" /> Animaux
                      </span>
                      <span className="font-medium">{getLabel(profile.profile.pets, petsOptions)}</span>
                    </div>
                  )}
                  {profile.profile?.sleep_schedule && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500 flex items-center gap-2">
                        <MoonIcon className="h-4 w-4 text-gray-400" /> Sommeil
                      </span>
                      <span className="font-medium">{getLabel(profile.profile.sleep_schedule, sleepOptions)}</span>
                    </div>
                  )}
                  {profile.profile?.cleanliness && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500 flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-gray-400" /> Propreté
                      </span>
                      <span className="font-medium">{getLabel(profile.profile.cleanliness, cleanlinessOptions)}</span>
                    </div>
                  )}
                  {profile.profile?.social_level && (
                    <div className="flex justify-between py-2 border-b md:col-span-2">
                      <span className="text-gray-500 flex items-center gap-2">
                        <UserGroupIcon className="h-4 w-4 text-gray-400" /> Niveau social
                      </span>
                      <span className="font-medium">{getLabel(profile.profile.social_level, socialOptions)}</span>
                    </div>
                  )}
                </div>
                {!profile.profile?.smoking && !profile.profile?.pets && !profile.profile?.sleep_schedule && !profile.profile?.cleanliness && (
                  <p className="text-gray-500 text-center py-4">Aucune préférence de vie renseignée</p>
                )}
              </div>
            )}

            {/* Tab: Préférences colocataire */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-[#00BBA7]" />
                  Préférences colocataire
                </h3>
                <div className="space-y-4">
                  {profile.profile?.preferred_gender && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Genre préféré</span>
                      <span className="font-medium">
                        {profile.profile.preferred_gender === 'male' ? 'Homme' :
                         profile.profile.preferred_gender === 'female' ? 'Femme' : 'Peu importe'}
                      </span>
                    </div>
                  )}
                  {profile.profile?.accepts_pets !== null && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Accepte les animaux</span>
                      <span className="font-medium">{profile.profile.accepts_pets ? 'Oui' : 'Non'}</span>
                    </div>
                  )}
                  {profile.profile?.accepts_smokers !== null && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Accepte les fumeurs</span>
                      <span className="font-medium">{profile.profile.accepts_smokers ? 'Oui' : 'Non'}</span>
                    </div>
                  )}
                  {(profile.profile?.preferred_min_age || profile.profile?.preferred_max_age) && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Tranche d'âge préférée</span>
                      <span className="font-medium">
                        {profile.profile.preferred_min_age || '18'} - {profile.profile.preferred_max_age || '100'} ans
                      </span>
                    </div>
                  )}
                </div>
                {!profile.profile?.preferred_gender && !profile.profile?.accepts_pets && !profile.profile?.accepts_smokers && (
                  <p className="text-gray-500 text-center py-4">Aucune préférence renseignée</p>
                )}
              </div>
            )}

            {/* Tab: Sécurité */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vérifications</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                      </div>
                      {profile.email_verified_at ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircleIcon className="h-4 w-4" /> Vérifié
                        </span>
                      ) : (
                        <button className="text-[#009966] text-sm">Vérifier</button>
                      )}
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <div>
                        <p className="font-medium">Téléphone</p>
                        <p className="text-sm text-gray-500">{profile.phone || 'Non renseigné'}</p>
                      </div>
                      {profile.phone_verified_at ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircleIcon className="h-4 w-4" /> Vérifié
                        </span>
                      ) : (
                        <button className="text-[#009966] text-sm">Vérifier</button>
                      )}
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <div>
                        <p className="font-medium">Identité (CIN)</p>
                        <p className="text-sm text-gray-500">Document officiel</p>
                      </div>
                      {profile.profile?.is_identity_verified ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircleIcon className="h-4 w-4" /> Vérifié
                        </span>
                      ) : (
                        <button className="text-[#009966] text-sm">Soumettre</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentification à deux facteurs</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">2FA</p>
                      <p className="text-sm text-gray-500">Sécurisez votre compte</p>
                    </div>
                    <button className="px-4 py-2 bg-[#009966] text-white rounded-lg text-sm hover:bg-[#00BBA7] transition-colors">
                      {profile.two_factor_enabled ? 'Désactiver' : 'Activer'}
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