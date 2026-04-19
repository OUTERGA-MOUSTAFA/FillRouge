import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPinIcon, BriefcaseIcon, HeartIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { usersService } from '../src/services/users';  // ← chemin corrigé
import { useAuthStore } from '../src/store/authStore';  // ← chemin corrigé
import CompatibilityScore from '../src/components/profile/CompatibilityScore';
import VerificationBadges from '../src/components/profile/VerificationBadges';
import ReviewsList from '../src/components/profile/ReviewsList';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const isOwnProfile = user?.id === parseInt(id);

  useEffect(() => {
    fetchProfile();
    if (!isOwnProfile && user) {
      fetchCompatibility();
    }
  }, [id, user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await usersService.getProfile(id);
      setProfile(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur chargement du profil';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompatibility = async () => {
    try {
      const response = await usersService.getCompatibility(id);
      setCompatibility(response.data);
    } catch (error) {
      console.error('Error fetching compatibility:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BBA7]"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container-custom py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div>
          {/* Profile Card */}
          <div className="card p-6 text-center mb-6">
            {profile.avatar ? (
              <img className="h-32 w-32 rounded-full mx-auto object-cover" src={profile.avatar} alt="" />
            ) : (
              <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto flex items-center justify-center">
                <span className="text-4xl text-gray-500">{profile.full_name?.[0]}</span>
              </div>
            )}
            <h2 className="text-xl font-bold mt-4">{profile.full_name}</h2>
            <p className="text-gray-500">{profile.age} ans • {profile.gender === 'male' ? 'Homme' : profile.gender === 'female' ? 'Femme' : 'Autre'}</p>
            
            {profile.profession && (
              <p className="text-gray-600 mt-2 flex items-center justify-center gap-1">
                <BriefcaseIcon className="h-4 w-4" /> {profile.profession}
              </p>
            )}
            
            <VerificationBadges badges={profile.verification_badges || []} />
            
            {!isOwnProfile && user && (
              <div className="flex gap-3 mt-4">
                <Link to={`/messages/${profile.id}`} className="flex-1 btn-primary">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-1" />
                  Envoyer message
                </Link>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <HeartIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            )}
          </div>

          {/* Compatibility Score */}
          {compatibility && (
            <div className="card p-6 mb-6">
              <CompatibilityScore score={compatibility.compatibility_score} />
              {compatibility.common_interests?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Intérêts communs</h4>
                  <div className="flex flex-wrap gap-2">
                    {compatibility.common_interests.map((interest) => (
                      <span key={interest} className="px-2 py-1 bg-[#ccefeb] text-[#00734d] rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lifestyle */}
          {profile.profile && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Mode de vie</h3>
              <div className="space-y-3 text-sm">
                {profile.profile.smoking && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tabac:</span>
                    <span>{profile.profile.smoking === 'yes' ? 'Oui' : profile.profile.smoking === 'no' ? 'Non' : 'Occasionnel'}</span>
                  </div>
                )}
                {profile.profile.pets && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Animaux:</span>
                    <span>{profile.profile.pets === 'yes' ? 'Oui' : profile.profile.pets === 'no' ? 'Non' : 'Peut-être'}</span>
                  </div>
                )}
                {profile.profile.sleep_schedule && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sommeil:</span>
                    <span>{profile.profile.sleep_schedule === 'early_bird' ? 'Lève-tôt' : profile.profile.sleep_schedule === 'night_owl' ? 'Couche-tard' : 'Flexible'}</span>
                  </div>
                )}
                {profile.profile.cleanliness && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Propreté:</span>
                    <span>{profile.profile.cleanliness === 'very_clean' ? 'Très propre' : 'Relax'}</span>
                  </div>
                )}
                {profile.profile.social_level && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Social:</span>
                    <span>{profile.profile.social_level === 'extrovert' ? 'Extraverti' : profile.profile.social_level === 'introvert' ? 'Introverti' : 'Ambiverti'}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          {/* Bio */}
          {profile.profile?.bio && (
            <div className="card p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">À propos</h3>
              <p className="text-gray-600">{profile.profile.bio}</p>
            </div>
          )}

          {/* Interests */}
          {profile.profile?.interests?.length > 0 && (
            <div className="card p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Centres d'intérêt</h3>
              <div className="flex flex-wrap gap-2">
                {profile.profile.interests.map((interest) => (
                  <span key={interest} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Budget */}
          {(profile.budget_min || profile.budget_max) && (
            <div className="card p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Budget</h3>
              <p className="text-gray-600">
                {profile.budget_min && profile.budget_max 
                  ? `${profile.budget_min} - ${profile.budget_max} MAD/mois`
                  : profile.budget_min 
                    ? `À partir de ${profile.budget_min} MAD/mois`
                    : `Jusqu'à ${profile.budget_max} MAD/mois`}
              </p>
            </div>
          )}

          {/* Reviews */}
          <div className="card p-6">
            <ReviewsList userId={profile.id} />
          </div>
        </div>
      </div>
    </div>
  );
}