import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../src/store/authStore';
import { usersService } from '../src/services/users';
import { authService } from '../src/services/auth';
import VerificationBadges from '../src/components/profile/VerificationBadges';
import ReviewsList from '../src/components/profile/ReviewsList';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuthStore();
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container-custom py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div>
          <div className="card p-6 text-center">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.full_name}
                className="h-32 w-32 rounded-full mx-auto object-cover"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto flex items-center justify-center">
                <span className="text-4xl text-gray-500">{profile.full_name?.[0]}</span>
              </div>
            )}
            <h2 className="text-xl font-bold mt-4">{profile.full_name}</h2>
            <p className="text-gray-500">{profile.email}</p>
            {profile.phone && <p className="text-gray-500 text-sm">{profile.phone}</p>}
            
            <VerificationBadges badges={profile.verification_badges || []} />
            
            <div className="mt-4 space-y-2">
              <Link to="/profile/edit" className="btn-secondary w-full block text-center">
                Modifier le profil
              </Link>
              <Link to="/my-listings" className="btn-secondary w-full block text-center">
                Mes annonces
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="card p-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Membre depuis</span>
                <span>{new Date(profile.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Annonces</span>
                <span>{profile.listings_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Avis</span>
                <span>{profile.reviews_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Note moyenne</span>
                <span>{profile.average_rating || 0}/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="border-b mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`pb-3 font-medium ${activeTab === 'info' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
              >
                Informations
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 font-medium ${activeTab === 'reviews' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
              >
                Avis reçus
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`pb-3 font-medium ${activeTab === 'security' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
              >
                Sécurité
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Bio */}
              {profile.profile?.bio && (
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">À propos</h3>
                  <p className="text-gray-600">{profile.profile.bio}</p>
                </div>
              )}

              {/* Interests */}
              {profile.profile?.interests?.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Centres d'intérêt</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.profile.interests.map((interest) => (
                      <span key={interest} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle */}
              {profile.profile && (
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Mode de vie</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {profile.profile.smoking && (
                      <div>
                        <span className="text-gray-500">Tabac:</span>
                        <span className="ml-2">
                          {profile.profile.smoking === 'yes' ? 'Oui' : profile.profile.smoking === 'no' ? 'Non' : 'Occasionnel'}
                        </span>
                      </div>
                    )}
                    {profile.profile.pets && (
                      <div>
                        <span className="text-gray-500">Animaux:</span>
                        <span className="ml-2">
                          {profile.profile.pets === 'yes' ? 'Oui' : profile.profile.pets === 'no' ? 'Non' : 'Peut-être'}
                        </span>
                      </div>
                    )}
                    {profile.profile.sleep_schedule && (
                      <div>
                        <span className="text-gray-500">Sommeil:</span>
                        <span className="ml-2">
                          {profile.profile.sleep_schedule === 'early_bird' ? 'Lève-tôt' : profile.profile.sleep_schedule === 'night_owl' ? 'Couche-tard' : 'Flexible'}
                        </span>
                      </div>
                    )}
                    {profile.profile.cleanliness && (
                      <div>
                        <span className="text-gray-500">Propreté:</span>
                        <span className="ml-2">
                          {profile.profile.cleanliness === 'very_clean' ? 'Très propre' : 'Relax'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Budget */}
              {(profile.budget_min || profile.budget_max) && (
                <div className="card p-6">
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
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="card p-6">
              <ReviewsList userId={profile.id} />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Vérifications</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                    </div>
                    {profile.email_verified_at ? (
                      <span className="text-green-600">✓ Vérifié</span>
                    ) : (
                      <button className="text-primary-600 text-sm">Vérifier</button>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-sm text-gray-500">{profile.phone || 'Non renseigné'}</p>
                    </div>
                    {profile.phone_verified_at ? (
                      <span className="text-green-600">✓ Vérifié</span>
                    ) : (
                      <button className="text-primary-600 text-sm">Vérifier</button>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Identité (CIN)</p>
                      <p className="text-sm text-gray-500">Document officiel</p>
                    </div>
                    {profile.profile?.is_identity_verified ? (
                      <span className="text-green-600">✓ Vérifié</span>
                    ) : (
                      <button className="text-primary-600 text-sm">Soumettre</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Authentification à deux facteurs</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">2FA</p>
                    <p className="text-sm text-gray-500">Sécurisez votre compte</p>
                  </div>
                  <button className="btn-primary text-sm">
                    {profile.two_factor_enabled ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}