import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsService } from '../src/services/listings';
import { useAuthStore } from '../src/store/authStore';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const citiesList = [
  'Agadir', 'Tanger', 'Fès', 'Meknès', 'Marrakech', 'Casablanca', 
  'Rabat', 'Essaouira', 'Tétouan', 'Oujda', 'Kenitra', 'Safi'
];

const amenitiesList = [
  'WiFi', 'Air Conditioning', 'Heating', 'Washing Machine', 
  'Kitchen Access', 'Lift', 'Parking', 'Pets Allowed', 'Furnished'
];

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    type: 'room',
    title: '',
    description: '',
    price: '',
    price_is_negotiable: false,
    available_from: '',
    available_until: '',
    city: '',
    neighborhood: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    furnished: false,
    amenities: [],
    preferred_gender: 'any',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 10) {
      toast.error('Maximum 10 photos');
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (photos.length < 3) {
      toast.error('Veuillez ajouter au moins 3 photos');
      return;
    }
    
    if (!formData.title || !formData.description || !formData.price || !formData.city) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setLoading(true);
    
    const submitData = new FormData();
    submitData.append('type', formData.type);
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('price_is_negotiable', formData.price_is_negotiable);
    submitData.append('available_from', formData.available_from);
    if (formData.available_until) submitData.append('available_until', formData.available_until);
    submitData.append('city', formData.city);
    if (formData.neighborhood) submitData.append('neighborhood', formData.neighborhood);
    if (formData.address) submitData.append('address', formData.address);
    if (formData.bedrooms) submitData.append('bedrooms', formData.bedrooms);
    if (formData.bathrooms) submitData.append('bathrooms', formData.bathrooms);
    submitData.append('furnished', formData.furnished);
    submitData.append('amenities', JSON.stringify(formData.amenities));
    
    photos.forEach(photo => {
      submitData.append('photos[]', photo);
    });
    
    try {
      await listingsService.create(submitData);
      toast.success('Annonce créée avec succès');
      navigate('/my-listings');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la création';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-4xl">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Publier une annonce</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informations de base</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de l'annonce *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ex: Chambre cosy au centre de Casablanca"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                  placeholder="Décrivez votre chambre, le quartier, les avantages..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'annonce *
                </label>
                <div className="flex gap-4">
                  {['room', 'apartment', 'looking_for_roommate'].map(type => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={formData.type === type}
                        onChange={handleChange}
                      />
                      <span>{type === 'room' ? 'Chambre' : type === 'apartment' ? 'Appartement' : 'Cherche colocataire'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Localisation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <select
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
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
                  value={formData.neighborhood}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ex: Gauthier, Agdal..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse complète (optionnel)
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input"
                  placeholder="Numéro, rue, immeuble..."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Availability */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Prix et disponibilité</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix mensuel (MAD) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="input"
                  placeholder="3000"
                />
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="price_is_negotiable"
                    checked={formData.price_is_negotiable}
                    onChange={handleChange}
                  />
                  <span className="text-sm text-gray-700">Prix négociable</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponible à partir de *
                </label>
                <input
                  type="date"
                  name="available_from"
                  required
                  value={formData.available_from}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponible jusqu'à (optionnel)
                </label>
                <input
                  type="date"
                  name="available_until"
                  value={formData.available_until}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Room Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Détails de la chambre</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de chambres
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="input"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salles de bain
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="input"
                  placeholder="1"
                />
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="furnished"
                    checked={formData.furnished}
                    onChange={handleChange}
                  />
                  <span className="text-sm text-gray-700">Meublé</span>
                </label>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Commodités</h2>
            <div className="flex flex-wrap gap-3">
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Préférences</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre préféré du colocataire
              </label>
              <div className="flex gap-4">
                {['any', 'male', 'female'].map(gender => (
                  <label key={gender} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="preferred_gender"
                      value={gender}
                      checked={formData.preferred_gender === gender}
                      onChange={handleChange}
                    />
                    <span>{gender === 'any' ? 'Peu importe' : gender === 'male' ? 'Homme' : 'Femme'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Photos */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Photos (minimum 3, maximum 10)</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                <span className="text-gray-600">Cliquez pour uploader des photos</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG jusqu'à 5MB</span>
              </label>
            </div>
            
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {photos.length} / 10 photos uploadées
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Publication...' : 'Publier l\'annonce'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-listings')}
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