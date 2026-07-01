import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../src/store/authStore';
import { listingsService } from '../src/services/listings';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    room_type: 'private',
    city: '',
    address: '',
    available_from: '',
    duration: 'short',
    max_tenants: 1,
    is_furnished: false,
    has_wifi: false,
    has_kitchen: false,
    has_heating: false,
    has_air_conditioning: false,
    has_parking: false,
    has_balcony: false,
    images: [],
  });
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const villes = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger',
    'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Essaouira'
  ];

  useEffect(() => {
    fetchListing();
  }, [id]);


  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (typeof photo === 'string') return photo;
    if (typeof photo === 'object' && photo.url) return photo.url;
    return null;
  };


  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await listingsService.getById(id);

      if (response.data.user_id !== user?.id && user?.role !== 'admin') {
        toast.error(t('listingForm.edit.toastNotAuthorized'));
        navigate('/MyListings');
        return;
      }

      const listing = response.data;

      // Parse amenities array from DB into individual boolean flags
      const amenities = listing.amenities ?? [];

      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price || '',
        room_type: listing.type || 'private',   // DB: "type"
        city: listing.city || '',
        address: listing.address || '',
        available_from: listing.available_from
          ? listing.available_from.split('T')[0]
          : '',
        duration: listing.duration || 'short',
        max_tenants: listing.max_tenants || 1,
        is_furnished: listing.furnished ?? false,        // DB: "furnished"
        has_wifi: amenities.includes('wifi'),
        has_kitchen: amenities.includes('kitchen'),
        has_heating: amenities.includes('heating'),
        has_air_conditioning: amenities.includes('air_conditioning'),
        has_parking: amenities.includes('parking'),
        has_balcony: amenities.includes('balcony'),
        images: [],
      });

      // DB "photos" is the array of image URLs, "main_photo" is the cover
      const photos = listing.photos ?? [];
      setExistingImages(photos);

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(t('listingForm.edit.toastLoadError'));
      navigate('/MyListings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length + imagePreview.length > 10) {
      toast.error(t('listingForm.edit.toastMaxImages'));
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('listingForm.edit.toastImageTooLarge', { name: file.name }));
        return;
      }
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreview[index]);
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index];
    setImagesToDelete(prev => [...prev, imageToRemove]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(t('listingForm.edit.toastTitleRequired'));
      return;
    }
    if (!formData.description.trim()) {
      toast.error(t('listingForm.edit.toastDescriptionRequired'));
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error(t('listingForm.edit.toastPriceRequired'));
      return;
    }
    if (!formData.city) {
      toast.error(t('listingForm.edit.toastCityRequired'));
      return;
    }

    if (existingImages.length === 0 && formData.images.length === 0) {
      toast.error(t('listingForm.edit.toastImageRequired'));
      return;
    }

    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('room_type', formData.room_type);
      submitData.append('city', formData.city);
      submitData.append('address', formData.address);
      submitData.append('available_from', formData.available_from);
      submitData.append('duration', formData.duration);
      submitData.append('max_tenants', formData.max_tenants);
      submitData.append('is_furnished', formData.is_furnished);
      submitData.append('has_wifi', formData.has_wifi);
      submitData.append('has_kitchen', formData.has_kitchen);
      submitData.append('has_heating', formData.has_heating);
      submitData.append('has_air_conditioning', formData.has_air_conditioning);
      submitData.append('has_parking', formData.has_parking);
      submitData.append('has_balcony', formData.has_balcony);
      submitData.append('_method', 'PUT');

      formData.images.forEach(image => {
        submitData.append('images[]', image);
      });

      imagesToDelete.forEach(image => {
        // Extraire le public_id si c'est un objet Cloudinary, sinon utiliser tel quel
        const publicId = (typeof image === 'object' && image.public_id)
          ? image.public_id
          : image;
        submitData.append('deleted_images[]', publicId);
      });

      await listingsService.update(id, submitData);
      toast.success(t('listingForm.edit.toastSuccess'));
      navigate('/MyListings');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || t('listingForm.edit.toastUpdateError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009966]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/MyListings')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeftIcon className="h-5 w-5" />
            {t('listingForm.edit.backToListings')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('listingForm.edit.title')}</h1>
          <div className="w-20"></div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('listingForm.edit.titleLabel')}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009966] focus:border-transparent"
              placeholder={t('listingForm.edit.titlePlaceholder')}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('listingForm.edit.descriptionLabel')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009966] focus:border-transparent"
              placeholder={t('listingForm.edit.descriptionPlaceholder')}
            />
          </div>

          {/* Prix et Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('listingForm.edit.priceLabel')}
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                  placeholder={t('listingForm.edit.pricePlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('listingForm.edit.roomTypeLabel')}
              </label>
              <select
                name="room_type"
                value={formData.room_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009966] focus:border-transparent"
              >
                <option value="private">{t('listingForm.edit.roomType.private')}</option>
                <option value="shared">{t('listingForm.edit.roomType.shared')}</option>
                <option value="entire">{t('listingForm.edit.roomType.entire')}</option>
              </select>
            </div>
          </div>

          {/* Localisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('listingForm.edit.cityLabel')}
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                >
                  <option value="">{t('listingForm.edit.selectCity')}</option>
                  {villes.map(ville => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('listingForm.edit.addressLabel')}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                placeholder={t('listingForm.edit.addressPlaceholder')}
              />
            </div>
          </div>

          {/* Disponibilité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('listingForm.edit.availableFromLabel')}
              </label>
              <input
                type="date"
                name="available_from"
                value={formData.available_from}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009966] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('listingForm.edit.durationLabel')}
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009966] focus:border-transparent"
              >
                <option value="short">{t('listingForm.edit.duration.short')}</option>
                <option value="medium">{t('listingForm.edit.duration.medium')}</option>
                <option value="long">{t('listingForm.edit.duration.long')}</option>
              </select>
            </div>
          </div>

          {/* Nombre de colocataires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('listingForm.edit.maxTenantsLabel')}
            </label>
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-gray-400" />
              <input
                type="number"
                name="max_tenants"
                value={formData.max_tenants}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009966] focus:border-transparent"
              />
            </div>
          </div>

          {/* Équipements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('listingForm.edit.amenitiesLabel')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'is_furnished', labelKey: 'furnished' },
                { name: 'has_wifi', labelKey: 'wifi' },
                { name: 'has_kitchen', labelKey: 'kitchen' },
                { name: 'has_heating', labelKey: 'heating' },
                { name: 'has_air_conditioning', labelKey: 'ac' },
                { name: 'has_parking', labelKey: 'parking' },
                { name: 'has_balcony', labelKey: 'balcony' },
              ].map(amenity => (
                <label key={amenity.name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={amenity.name}
                    checked={formData[amenity.name]}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-[#009966] focus:ring-[#009966]"
                  />
                  <span className="text-sm text-gray-700">{t(`listingForm.amenities.${amenity.labelKey}`)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images existantes */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('listingForm.edit.currentImages')}
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getPhotoUrl(image)}
                      alt={`Image ${index + 1}`}
                      className="h-24 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nouvelles images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('listingForm.edit.addImages')}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">{t('listingForm.edit.clickToAddImages')}</span>
                <span className="text-xs text-gray-400">{t('listingForm.edit.imageFormats')}</span>
              </label>
            </div>

            {/* Aperçu des nouvelles images */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-3">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Aperçu ${index + 1}`}
                      className="h-24 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#009966] text-white py-2 rounded-lg hover:bg-[#00734d] transition disabled:opacity-50"
            >
              {submitting ? t('listingForm.edit.saving') : t('listingForm.edit.saveChanges')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/MyListings')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              {t('listingForm.edit.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}