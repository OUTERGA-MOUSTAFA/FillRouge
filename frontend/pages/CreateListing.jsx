import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsService } from '../src/services/listings';
import { useAuthStore } from '../src/store/authStore';
import { 
  PhotoIcon, XMarkIcon, MapPinIcon, 
  CurrencyDollarIcon, HomeIcon, BedIcon,
  WifiIcon, FireIcon, DevicePhoneMobileIcon,
  TruckIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const citiesList = [
  'Agadir', 'Tanger', 'Fès', 'Meknès', 'Marrakech', 
  'Casablanca', 'Rabat', 'Essaouira', 'Tétouan', 'Oujda', 
  'Kenitra', 'Safi', 'El Jadida', 'Nador', 'Tetouan'
];

const amenitiesList = [
  { id: 'wifi', name: 'WiFi', icon: WifiIcon },
  { id: 'ac', name: 'Air Conditioning', icon: FireIcon },
  { id: 'heating', name: 'Heating', icon: FireIcon },
  { id: 'washing_machine', name: 'Washing Machine', icon: DevicePhoneMobileIcon },
  { id: 'kitchen', name: 'Kitchen Access', icon: HomeIcon },
  { id: 'lift', name: 'Lift', icon: TruckIcon },
  { id: 'parking', name: 'Parking', icon: TruckIcon },
  { id: 'pets', name: 'Pets Allowed', icon: HomeIcon },
];

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    language: 'fr',
    
    // Location
    city: '',
    neighborhood: '',
    street: '',
    building_info: '',
    
    // Pricing & Availability
    price: '',
    currency: 'MAD',
    availability_type: 'long_term',
    available_from: '',
    available_to: '',
    
    // Room Details
    property_type: 'room', // room, apartment, house
    room_type: 'private', // private, shared, entire
    bed_type: 'single', // single, double, bunk
    furnished: false,
    bathroom: 'private', // private, shared
    amenities: [],
    
    // Preferences
    preferred_gender: 'any',
    smoking_allowed: false,
    pets_allowed: false,
    guests_allowed: true,
    household_description: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
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

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
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
    submitData.append('type', formData.property_type === 'room' ? 'room' : 'apartment');
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('city', formData.city);
    submitData.append('neighborhood', formData.neighborhood || '');
    submitData.append('address', formData.street || '');
    submitData.append('available_from', formData.available_from);
    if (formData.available_to) submitData.append('available_until', formData.available_to);
    submitData.append('furnished', formData.furnished);
    submitData.append('amenities', JSON.stringify(formData.amenities));
    submitData.append('bedrooms', formData.room_type === 'private' ? 1 : 2);
    submitData.append('bathrooms', formData.bathroom === 'private' ? 1 : 2);
    
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

  const steps = [
    { number: 1, title: 'Basic Info', icon: HomeIcon },
    { number: 2, title: 'Location', icon: MapPinIcon },
    { number: 3, title: 'Pricing', icon: CurrencyDollarIcon },
    { number: 4, title: 'Details', icon: BedIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post a Room Listing</h1>
          <p className="text-gray-600 mt-2">Share details about your room so the right roommate can find it.</p>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div key={step.number} className="flex-1 text-center">
                <div className={`relative flex justify-center`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.number 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.number ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  {step.number < 4 && (
                    <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      currentStep > step.number ? 'bg-primary-500' : 'bg-gray-200'
                    }`} style={{ transform: 'translateY(-50%)' }} />
                  )}
                </div>
                <p className="text-xs mt-2 text-gray-500">{step.title}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="card p-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">Basic Information</h2>
              
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Property Type *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'room', label: 'Room', icon: BedIcon },
                    { id: 'apartment', label: 'Apartment', icon: HomeIcon },
                    { id: 'house', label: 'House', icon: HomeIcon },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, property_type: type.id })}
                      className={`p-4 border-2 rounded-xl text-center transition-all ${
                        formData.property_type === type.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Cozy room in Casablanca city center"
                />
              </div>

              {/* Description */}
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
                  placeholder="Describe your room, the neighborhood, and what makes it special..."
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="input w-48"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                  <option value="ar">Tamzight</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Location Details */}
          {currentStep === 2 && (
            <div className="card p-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">Location Details</h2>
              
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <select
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">-- Select City --</option>
                  {citiesList.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Neighborhood */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Neighborhood
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Maarif, Gauthier, Medina"
                />
              </div>

              {/* Map Preview */}
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <MapPinIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Map location preview</p>
                <button type="button" className="text-primary-600 text-sm mt-1">
                  Set on Map
                </button>
              </div>

              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street (Optional)
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="input"
                  placeholder="Street name"
                />
              </div>

              {/* Building Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apartment/Building Info (Optional)
                </label>
                <input
                  type="text"
                  name="building_info"
                  value={formData.building_info}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Apartment 3B, Building with green door"
                />
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Availability */}
          {currentStep === 3 && (
            <div className="card p-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">Pricing & Availability</h2>
              
              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Price *
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="MAD">MAD</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              {/* Availability Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Type *
                </label>
                <div className="flex gap-4">
                  {[
                    { id: 'short_term', label: 'Short-term (tourists)' },
                    { id: 'long_term', label: 'Long-term' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, availability_type: type.id })}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.availability_type === type.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available From / To */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available From *
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
                    Available To (Optional)
                  </label>
                  <input
                    type="date"
                    name="available_to"
                    value={formData.available_to}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Room Details & Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Room Details */}
              <div className="card p-8 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">Room Details</h2>
                
                {/* Room Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'private', label: 'Private Room' },
                      { id: 'shared', label: 'Shared Room' },
                      { id: 'entire', label: 'Entire Place' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, room_type: type.id })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.room_type === type.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bed Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bed Type
                  </label>
                  <div className="flex gap-3">
                    {['single', 'double', 'bunk'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, bed_type: type })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.bed_type === type
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Furnished & Bathroom */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Furnished
                    </label>
                    <div className="flex gap-3">
                      {['yes', 'no'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFormData({ ...formData, furnished: option === 'yes' })}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.furnished === (option === 'yes')
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option === 'yes' ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathroom
                    </label>
                    <div className="flex gap-3">
                      {['private', 'shared'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, bathroom: type })}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.bathroom === type
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {type === 'private' ? 'Private' : 'Shared'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {amenitiesList.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                        <button
                          key={amenity.id}
                          type="button"
                          onClick={() => handleAmenityToggle(amenity.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            formData.amenities.includes(amenity.id)
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {amenity.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="card p-8 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">Preferences</h2>
                
                {/* Preferred Roommate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Roommate
                  </label>
                  <div className="flex gap-3">
                    {['any', 'male', 'female'].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => setFormData({ ...formData, preferred_gender: gender })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.preferred_gender === gender
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {gender === 'any' ? 'Any' : gender === 'male' ? 'Male' : 'Female'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Smoking Allowed</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, smoking_allowed: !formData.smoking_allowed })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.smoking_allowed ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.smoking_allowed ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Pets Allowed</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, pets_allowed: !formData.pets_allowed })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.pets_allowed ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.pets_allowed ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Guests Allowed</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, guests_allowed: !formData.guests_allowed })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.guests_allowed ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.guests_allowed ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* About Household */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About the Household
                  </label>
                  <textarea
                    name="household_description"
                    rows="4"
                    value={formData.household_description}
                    onChange={handleChange}
                    className="input"
                    placeholder="Tell potential roommates about your lifestyle, daily routine, house rules..."
                  />
                </div>
              </div>

              {/* Upload Photos */}
              <div className="card p-8">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-3 mb-4">Upload Photos</h2>
                
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
                    <span className="text-gray-600">Drag and drop photos here or click to upload</span>
                    <span className="text-xs text-gray-400 mt-1">Upload up to 10 photos</span>
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
                  {photos.length} / 10 photos uploaded
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary flex-1"
              >
                Previous
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Publishing...' : 'Publish Listing'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}