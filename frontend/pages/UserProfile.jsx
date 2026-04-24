import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPinIcon, BriefcaseIcon, HeartIcon,
  ChatBubbleLeftRightIcon, CheckBadgeIcon,
  StarIcon, HomeIcon, CalendarIcon,
  UserGroupIcon, MoonIcon, SparklesIcon,
  ArrowLeftIcon, EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { usersService } from '../src/services/users';
import { useAuthStore } from '../src/store/authStore';
import ReviewsList from '../src/components/profile/ReviewsList';
import toast from 'react-hot-toast';

/* ── tiny helpers ─────────────────────────────────────── */
const Badge = ({ label, color = 'gray' }) => {
  const palette = {
    green:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
    blue:   'bg-sky-50 text-sky-700 ring-sky-200',
    amber:  'bg-amber-50 text-amber-700 ring-amber-200',
    gray:   'bg-gray-100 text-gray-600 ring-gray-200',
    purple: 'bg-purple-50 text-purple-700 ring-purple-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${palette[color]}`}>
      {label}
    </span>
  );
};

const InfoRow = ({ label, value }) => value ? (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
    <span className="text-sm text-gray-800 font-medium">{value}</span>
  </div>
) : null;

const Stars = ({ rating, size = 'sm' }) => {
  const s = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        i <= rating
          ? <StarSolid key={i} className={`${s} text-amber-400`} />
          : <StarIcon   key={i} className={`${s} text-gray-200`} />
      ))}
    </div>
  );
};

/* ── listing card ──────────────────────────────────────── */
const ListingCard = ({ listing }) => {
  const photo = listing.main_photo || listing.photos?.[0]?.url;
  const typeLabel = { room: 'Chambre', apartment: 'Appartement', house: 'Maison' };
  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-[#66cfc3] hover:bg-[#e6f7f5]/40 transition-all duration-200"
    >
      <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {photo && <img src={photo} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
        <span className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
          {typeLabel[listing.type] ?? listing.type}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{listing.title}</p>
        <div className="flex items-center gap-1 mt-1">
          <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-500">{listing.city}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-bold text-[#00BBA7]">
            {Number(listing.price).toLocaleString()} <span className="text-xs font-normal text-gray-400">MAD/mois</span>
          </span>
          <Badge
            label={listing.status === 'active' ? 'Actif' : listing.status}
            color={listing.status === 'active' ? 'green' : 'gray'}
          />
        </div>
      </div>
    </Link>
  );
};

/* ── main component ────────────────────────────────────── */
export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const { user } = useAuthStore();
  const isOwnProfile = user?.id === parseInt(id);

  useEffect(() => {
    fetchProfile();
    if (!isOwnProfile && user) fetchCompatibility();
  }, [id, user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await usersService.getProfile(id);
      setProfile(response.data?.data ?? response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompatibility = async () => {
    try {
      const response = await usersService.getCompatibility(id);
      setCompatibility(response.data?.data ?? response.data);
    } catch (){}
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-[3px] border-[#00BBA7] border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400">Chargement du profil…</p>
      </div>
    </div>
  );

  if (!profile) return null;

  const p = profile.profile ?? {};

  const lifestyleMap = {
    smoking: { label: 'Tabac', map: { yes: 'Fumeur', no: 'Non-fumeur', occasional: 'Occasionnel' } },
    pets: { label: 'Animaux', map: { yes: 'Accepte', no: 'Non', maybe: 'Peut-être' } },
    sleep_schedule: { label: 'Rythme', map: { early_bird: 'Lève-tôt', night_owl: 'Couche-tard', flexible: 'Flexible' } },
    cleanliness: { label: 'Propreté', map: { very_clean: 'Très propre', clean: 'Propre', moderate: 'Relax' } },
    social_level: { label: 'Social', map: { extrovert: 'Extraverti', introvert: 'Introverti', ambivert: 'Ambiverti' } },
  };

  const tabs = [
    { id: 'about',    label: 'À propos' },
    { id: 'listings', label: `Annonces (${profile.listings?.length ?? 0})` },
    { id: 'reviews',  label: `Avis (${profile.reviews_count ?? 0})` },
  ];

  const verificationLabels = {
    email_verified:    { label: 'Email',    color: 'green' },
    phone_verified:    { label: 'Téléphone', color: 'blue' },
    identity_verified: { label: 'Identité', color: 'purple' },
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-[system-ui]">

      {/* ── top bar ── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeftIcon className="h-4 w-4" />
          Retour
        </button>
        <span className="text-sm font-semibold text-gray-800">{profile.full_name}</span>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition">
          <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-[300px_1fr] gap-6">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="space-y-4">

          {/* Identity card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            {/* header band */}
            <div className="h-20 bg-gradient-to-br from-[#00BBA7] via-[#4FD1C5] to-[#66cfc3]" />

            <div className="px-5 pb-5 -mt-10">
              {/* Avatar */}
              <div className="relative inline-block">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.full_name}
                    className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#00BBA7] to-[#009966] ring-4 ring-white shadow-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{profile.full_name?.[0]}</span>
                  </div>
                )}
                {profile.is_online && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full ring-2 ring-white" />
                )}
              </div>

              <div className="mt-3">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">{profile.full_name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {profile.gender === 'male' ? 'Homme' : profile.gender === 'female' ? 'Femme' : ''}
                  {profile.age ? ` · ${profile.age} ans` : ''}
                </p>
                {profile.profession && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <BriefcaseIcon className="h-3.5 w-3.5 text-[#00BBA7]" />
                    <span className="text-xs text-gray-600">{profile.profession}</span>
                  </div>
                )}
                {p.city && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">{p.city}</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              {profile.average_rating > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Stars rating={Math.round(profile.average_rating)} />
                  <span className="text-xs text-gray-500">{profile.average_rating.toFixed(1)} · {profile.reviews_count} avis</span>
                </div>
              )}

              {/* Verification badges */}
              {profile.verification_badges?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {profile.verification_badges.map(b => {
                    const info = verificationLabels[b] ?? { label: b, color: 'gray' };
                    return (
                      <span key={b} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${
                        info.color === 'green'  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
                        info.color === 'blue'   ? 'bg-sky-50 text-sky-700 ring-sky-200' :
                        info.color === 'purple' ? 'bg-purple-50 text-purple-700 ring-purple-200' :
                        'bg-gray-100 text-gray-500 ring-gray-200'
                      }`}>
                        <CheckBadgeIcon className="h-3 w-3" />
                        {info.label}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Action buttons */}
              {!isOwnProfile && user && (
                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/messages/${profile.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#00BBA7] hover:bg-[#009966] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    Message
                  </Link>
                  <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors group">
                    <HeartIcon className="h-4 w-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                  </button>
                </div>
              )}
              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="mt-4 block text-center text-sm font-semibold text-[#00BBA7] hover:text-[#009966] py-2.5 rounded-xl border border-[#99dfd7] hover:bg-[#e6f7f5] transition-colors"
                >
                  Modifier le profil
                </Link>
              )}
            </div>
          </div>

          {/* Lifestyle card */}
          {Object.keys(lifestyleMap).some(k => p[k]) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Mode de vie</h3>
              <div>
                {Object.entries(lifestyleMap).map(([key, info]) => p[key] ? (
                  <InfoRow key={key} label={info.label} value={info.map[p[key]] ?? p[key]} />
                ) : null)}
              </div>
            </div>
          )}

          {/* Budget card */}
          {(profile.budget_min || profile.budget_max) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Budget</h3>
              <p className="text-2xl font-bold text-gray-900">
                {profile.budget_min && profile.budget_max
                  ? `${Number(profile.budget_min).toLocaleString()} – ${Number(profile.budget_max).toLocaleString()}`
                  : profile.budget_min
                    ? `≥ ${Number(profile.budget_min).toLocaleString()}`
                    : `≤ ${Number(profile.budget_max).toLocaleString()}`}
                <span className="text-sm font-normal text-gray-400 ml-1">MAD</span>
              </p>
            </div>
          )}

          {/* Compatibility */}
          {compatibility && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Compatibilité</h3>
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#ccefeb" strokeWidth="5" />
                    <circle
                      cx="28" cy="28" r="24"
                      fill="none" stroke="#00BBA7" strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 24}`}
                      strokeDashoffset={`${2 * Math.PI * 24 * (1 - compatibility.compatibility_score / 100)}`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#00BBA7]">
                    {compatibility.compatibility_score}%
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Score de match</p>
                  {compatibility.common_interests?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {compatibility.common_interests.slice(0, 3).map(i => (
                        <Badge key={i} label={i} color="purple" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── RIGHT CONTENT ── */}
        <div>
          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#00BBA7] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-[#e6f7f5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: About */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              {/* Bio */}
              {p.bio && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">À propos</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{p.bio}</p>
                </div>
              )}

              {/* Interests */}
              {p.interests?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Centres d'intérêt</h3>
                  <div className="flex flex-wrap gap-2">
                    {p.interests.map(interest => (
                      <span key={interest} className="px-3 py-1.5 bg-[#e6f7f5] text-[#00734d] rounded-full text-sm font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Roommate preferences */}
              {(p.preferred_gender || p.preferred_min_age || p.preferred_max_age || p.occupation) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Préférences colocataire</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {p.preferred_gender && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Genre</p>
                        <p className="text-sm font-semibold text-gray-800 capitalize">
                          {p.preferred_gender === 'female' ? 'Femme' : p.preferred_gender === 'male' ? 'Homme' : 'Indifférent'}
                        </p>
                      </div>
                    )}
                    {(p.preferred_min_age || p.preferred_max_age) && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Âge</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {p.preferred_min_age}–{p.preferred_max_age} ans
                        </p>
                      </div>
                    )}
                    {p.accepts_pets !== undefined && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Animaux</p>
                        <p className="text-sm font-semibold text-gray-800">{p.accepts_pets ? 'Accepte' : 'Refuse'}</p>
                      </div>
                    )}
                    {p.accepts_smokers !== undefined && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Fumeurs</p>
                        <p className="text-sm font-semibold text-gray-800">{p.accepts_smokers ? 'Accepte' : 'Refuse'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Member since */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Informations</h3>
                <InfoRow
                  label="Membre depuis"
                  value={profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                    : null}
                />
                <InfoRow label="Annonces actives" value={profile.listings?.filter(l => l.status === 'active').length} />
                <InfoRow label="Occupation" value={p.occupation === 'self_employed' ? 'Indépendant' : p.occupation} />
              </div>
            </div>
          )}

          {/* Tab: Listings */}
          {activeTab === 'listings' && (
            <div className="space-y-3">
              {profile.listings?.length > 0 ? (
                profile.listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <HomeIcon className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Aucune annonce publiée</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Reviews */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <ReviewsList userId={profile.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}