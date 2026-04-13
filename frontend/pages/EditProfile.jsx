import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../src/store/authStore';
import { authService } from '../src/services/auth';
import { usersService } from '../src/services/users';
import toast from 'react-hot-toast';

const interestsList = [
  'Cooking', 'Fitness', 'Tech', 'Travel', 'Study', 'Remote Work',
  'Music', 'Sports', 'Reading', 'Art', 'Gaming', 'Outdoors', 'Photography'
];

const citiesList = [
  'Agadir', 'Tanger', 'Fès', 'Meknès', 'Marrakech', 'Casablanca', 
  'Rabat', 'Essaouira', 'Tétouan', 'Oujda', 'Kenitra', 'Safi'
];

export default function EditProfile() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    gender: '',
    birth_date: '',
    profession: '',
    budget_min: '',
    budget_max: '',
  });
  const [profileData, setProfileData] = useState({
    bio: '',
    interests: [],
    smoking: '',
    pets: '',
    sleep_schedule: '',
    cleanliness: '',
    social_level: '',
    preferred_gender: '',
    city: '',
    neighborhood: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authService.getMe();
      const userData = response.data;
      setProfile(userData);
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        gender: userData.gender || '',
        birth_date: userData.birth_date ? userData.birth_date.split('T')[0] : '',
        profession: userData.profession || '',
        budget_min: userData.budget_min || '',
        budget_max: userData.budget_max || '',
      });
      setProfileData({
        bio: userData.profile?.bio || '',
        interests: userData.profile?.interests || [],
        smoking: userData.profile?.smoking || '',
        pets: userData.profile?.pets || '',
        sleep_schedule: userData.profile?.sleep_schedule || '',
        cleanliness: userData.profile?.cleanliness || '',
        social_level: userData.profile?.social_level || '',
        preferred_gender: userData.profile?.preferred_gender || '',
        city: userData.profile?.city || '',
        neighborhood: userData.profile?.neighborhood || '',
      });
    } catch (error) {
      toast.error('Erreur chargement du profil');
      navigate('/profile');
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleInterestToggle = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Mettre à jour les informations de base
      await authService.updateProfile(formData);
      
      // Mettre à jour les détails du profil
      await usersService.updateProfileDetails(profileData);
      
      toast.success('Profil mis à jour avec succès');
      navigate('/profile');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 max-w-3xl">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier mon profil</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleFormChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="input"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                  className="input"
                >
                  <option value="">Sélectionner</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleFormChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleFormChange}
                  className="input"
                  placeholder="Étudiant, Développeur, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <select
                  name="city"
                  value={profileData.city}
                  onChange={handleProfileChange}
                  className="input"
                >
                  <option value="">Sélectionner une ville</option>
                  {citiesList.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quartier
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={profileData.neighborhood}
                  onChange={handleProfileChange}
                  className="input"
                  placeholder="Gauthier, Agdal, etc."
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Budget</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget minimum (MAD/mois)
                </label>
                <input
                  type="number"
                  name="budget_min"
                  value={formData.budget_min}
                  onChange={handleFormChange}
                  className="input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget maximum (MAD/mois)
                </label>
                <input
                  type="number"
                  name="budget_max"
                  value={formData.budget_max}
                  onChange={handleFormChange}
                  className="input"
                  placeholder="10000"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">À propos</h2>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleProfileChange}
              rows="4"
              className="input"
              placeholder="Décrivez-vous, vos hobbies, ce que vous recherchez chez un colocataire..."
            />
          </div>

          {/* Interests */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Centres d'intérêt</h2>
            <div className="flex flex-wrap gap-2">
              {interestsList.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    profileData.interests.includes(interest)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Lifestyle Preferences */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Préférences de vie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tabac
                </label>
                <select
                  name="smoking"
                  value={profileData.smoking}
                  onChange={handleProfileChange}
                  className="input"
                >
                  <option value="">Sélectionner</option>
                  <option value="no">Non-fumeur</option>
                  <option value="occasionally">Occasionnel</option>
                  <option value="yes">Fumeur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Animaux
                </label>
                <select
                  name="pets"
                  value={profileData.pets}
                  onChange={handleProfileChange}
                  className="input"
                >
                  <option value="">Sélectionner</option>
                  <option value="no">Pas d'animaux</option>
                  <option value="maybe">Peut-être</option>
                  <option value="yes">Accepte les animaux</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horaire de sommeil
                </label>
                <select
                  name="sleep_schedule"
                  value={profileData.sleep_schedule}
                  onChange={handleProfileChange}
                  className="input"
                >
                  <option value="">Sélectionner</option>
                  <option value="early_bird">Lève-tôt (avant 23h)</option>
                  <option value="flexible">Flexible</option>
                  <option value="night_owl">Couche-tard (après minuit)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau de propreté
                </label>
                <select
                  name="cleanliness"
                  value={profileData.cleanliness}
                  onChange={handleProfileChange}
                  className="input"
                >
                  <option value="">Sélectionner</option>
                  <option value="relaxed">Relax</option>
                  <option value="moderate">Modéré</option>
                  <option value="very_clean">Très propre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau social
                </label>
                <select
                  name="social_level"
                  value={profileData.social_level}
                  onChange={handleProfileChange}
                  className="input"
                >
                  <option value="">Sélectionner</option>
                  <option value="introvert">Introverti</option>
                  <option value="ambivert">Ambiverti</option>
                  <option value="extrovert">Extraverti</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre préféré pour coloc
                </label>
                <select
                  name="preferred_gender"
                  value={profileData.preferred_gender}
                  onChange={handleProfileChange}
                  className="input"
                >
                  <option value="">Sélectionner</option>
                  <option value="any">Peu importe</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}