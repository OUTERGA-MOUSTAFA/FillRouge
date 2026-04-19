import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPinIcon, CalendarIcon, HomeIcon, UserIcon,
  ChatBubbleLeftRightIcon, HeartIcon, ShareIcon,
  FlagIcon, CheckCircleIcon, FireIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { listingsService } from '../src/services/listings';
import { useAuthStore } from '../src/store/authStore';
import toast from 'react-hot-toast';

// Icônes pour les commodités
const amenityIcons = {
  'wifi': (props) => <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c6.98-6.98 18.172-6.98 25.152 0" /></svg>,
  'air conditioning': (props) => <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.22-1.113-.615-1.53a15.04 15.04 0 0 0-2.084-1.58 2.25 2.25 0 0 0-1.426-.48H5.25a2.25 2.25 0 0 0-2.25 2.25v7.5m0 0v3.75c0 .621.504 1.125 1.125 1.125H7.5m-4.5 0H7.5" /></svg>,
  'parking': (props) => <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.22-1.113-.615-1.53a15.04 15.04 0 0 0-2.084-1.58 2.25 2.25 0 0 0-1.426-.48H5.25a2.25 2.25 0 0 0-2.25 2.25v7.5m0 0v3.75c0 .621.504 1.125 1.125 1.125H7.5m-4.5 0H7.5" /></svg>,
  'furnished': HomeIcon,
  'kitchen': (props) => <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 3.75H9m4.5 0h-9M9 3.75V12m-2.25 0h10.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /></svg>,
  'workspace': (props) => <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>,
};

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const { user } = useAuthStore();

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin' || user?.is_admin === true;

  useEffect(() => {
    fetchListing();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const response = await listingsService.getOne(id);
      setListing(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors du chargement de l\'annonce';
      toast.error(message);
      navigate('/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour contacter l\'hôte');
      navigate('/login');
      return;
    }
    navigate(`/messages/${listing.user_id}`);
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast.error('Veuillez sélectionner une raison');
      return;
    }
    try {
      // Ici tu peux ajouter l'appel API pour signaler l'annonce
      // await reportsService.create({ listing_id: id, reason: reportReason, description: reportDescription });
      toast.success('Signalement envoyé à l\'équipe de modération');
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors du signalement';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BBA7]"></div>
      </div>
    );
  }

  if (!listing) return null;

  const photos = listing.photos || [];
  const mainPhoto = listing.main_photo || photos[0];

  return (
    <div className="bg-gray-100 min-h-screen px-4">
      {/* Gallery Section */}
      <div className="bg-gray-100 border-b border-b-[#009966]">
        <div className="container-custom py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden h-96 lg:h-[500px]">
              <img
                src={photos[selectedPhoto] || mainPhoto}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {photos.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(0, 5).map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhoto(index)}
                    className={`rounded-xl overflow-hidden h-28 lg:h-[calc(500px/3-8px)] ${
                      selectedPhoto === index ? 'ring-2 ring-[#00BBA7]' : ''
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                  <div className="flex items-center text-gray-500 mb-4">
                    <MapPinIcon className="h-5 w-5 mr-1" />
                    <span>
                      {listing.neighborhood ? `${listing.neighborhood}, ` : ''}
                      {listing.city}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#009966]">
                    {listing.price.toLocaleString()} MAD
                  </div>
                  <div className="text-sm text-gray-500">/mois</div>
                  {listing.price_is_negotiable && (
                    <span className="text-xs text-green-600">Prix négociable</span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {listing.is_featured && (
                  <span className="inline-flex items-center px-3 py-1 bg-[#ccefeb] text-[#00734d] rounded-full text-sm">
                    <FireIcon className="h-4 w-4 mr-1" />
                    Mis en avant
                  </span>
                )}
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Disponible dès {new Date(listing.available_from).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{listing.description}</p>
            </div>

            {listing.amenities && listing.amenities.length > 0 && (
              <div className="bg-white rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Commodités</h2>
                <div className="flex flex-wrap gap-3">
                  {listing.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity.toLowerCase()];
                    return (
                      <span
                        key={amenity}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
                      >
                        {Icon && <Icon className="h-5 w-5 mr-2" />}
                        {amenity}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Host Information */}
          <div>
            <div className="bg-white rounded-xl p-6 mb-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hébergé par</h2>
              <div className="flex items-center mb-4">
                {listing.user?.avatar ? (
                  <img
                    className="h-16 w-16 rounded-full object-cover"
                    src={listing.user.avatar}
                    alt={listing.user.full_name}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="ml-4">
                  <Link
                    to={`/users/${listing.user_id}`}
                    className="font-semibold text-gray-900 hover:text-[#009966]"
                  >
                    {listing.user?.full_name}
                  </Link>
                  {listing.user?.is_premium && (
                    <div className="flex items-center text-yellow-600 text-sm">
                      <ShieldCheckIcon className="h-4 w-4 mr-1" />
                      Membre Premium
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{listing.user?.average_rating || 0} / 5</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleContact}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  Contacter l'hôte
                </button>
                
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <HeartIcon className="h-5 w-5" />
                  Ajouter aux favoris
                </button>
                
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <ShareIcon className="h-5 w-5" />
                  Partager
                </button>
                
                {/* Le bouton Signaler n'apparaît que pour les admins */}
                {isAdmin && (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="w-full text-red-600 hover:text-red-700 text-sm flex items-center justify-center gap-2"
                  >
                    <FlagIcon className="h-4 w-4" />
                    Signaler l'annonce
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal - accessible uniquement par les admins */}
      {showReportModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Signaler cette annonce</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du signalement
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="input"
                >
                  <option value="">Sélectionner une raison</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Contenu inapproprié</option>
                  <option value="fake">Fausse annonce</option>
                  <option value="fraud">Fraude</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnelle)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows="3"
                  className="input"
                  placeholder="Décrivez le problème..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReport}
                  className="flex-1 btn-primary"
                >
                  Signaler
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}