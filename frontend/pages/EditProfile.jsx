import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../src/store/authStore';
import { authService } from '../src/services/auth';
import { usersService } from '../src/services/users';
import { 
  UserIcon, PhoneIcon, CalendarIcon, BriefcaseIcon, 
  MapPinIcon, CurrencyDollarIcon, CameraIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const citiesList = [
  'Agadir', 'Tanger', 'Fès', 'Meknès', 'Marrakech', 
  'Casablanca', 'Rabat', 'Essaouira', 'Tétouan', 'Oujda'
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    gender: '',
    birth_date: '',
    profession: '',
    city: '',
    neighborhood: '',
    budget_min: '',
    budget_max: '',
    bio: '',
  });

  // ✅ Utiliser useCallback pour éviter les re-rendus infinis
  const loadUserData = useCallback(() => {
    if (user && !initialized) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        gender: user.gender || '',
        birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
        profession: user.profession || '',
        city: user.profile?.city || '',
        neighborhood: user.profile?.neighborhood || '',
        budget_min: user.budget_min || '',
        budget_max: user.budget_max || '',
        bio: user.profile?.bio || '',
      });
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
      setInitialized(true);
    }
  }, [user, initialized]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La photo ne doit pas dépasser 5MB');
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authService.updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        gender: formData.gender,
        birth_date: formData.birth_date,
        profession: formData.profession,
        budget_min: formData.budget_min,
        budget_max: formData.budget_max,
      });
      
      if (avatar) {
        await authService.uploadAvatar(avatar);
      }
      
      await usersService.updateProfileDetails({
        city: formData.city,
        neighborhood: formData.neighborhood,
        bio: formData.bio,
      });
      
      toast.success('Profil mis à jour avec succès');
      navigate('/profile');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Modifier mon profil</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                    <UserIcon className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <label className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md cursor-pointer">
                  <CameraIcon className="h-4 w-4 text-gray-500" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="text-sm text-gray-500">Photo de profil</p>
                <p className="text-xs text-gray-400">JPG, PNG max 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="">Sélectionner</option>
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                      <option value="other">Autre</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profession
                  </label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <div className="relative">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="">Sélectionner une ville</option>
                      {citiesList.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quartier
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget minimum (MAD/mois)
                </label>
                <input
                  type="number"
                  name="budget_min"
                  value={formData.budget_min}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
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
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">À propos</h2>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              placeholder="Décrivez-vous, vos hobbies, ce que vous recherchez chez un colocataire..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}