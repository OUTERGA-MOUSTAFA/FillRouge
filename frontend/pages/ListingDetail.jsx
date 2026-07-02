import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPinIcon, CalendarIcon, HomeIcon, UserIcon,
  ChatBubbleLeftRightIcon, HeartIcon, ShareIcon,
  FlagIcon, ShieldCheckIcon, FireIcon, PencilIcon,
  StarIcon as StarOutline, CheckCircleIcon, EyeIcon,
  PhoneIcon, BoltIcon, XMarkIcon,
  ChevronLeftIcon, ChevronRightIcon, ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { listingsService } from '../src/services/listings';
import { favoritesService } from '../src/services/favorites';
import { messagesService } from '../src/services/messages';
import { useAuthStore } from '../src/store/authStore';
import api from '../src/services/api';
import toast from 'react-hot-toast';
import MapComponent from '../src/components/map/MapComponent';
import { useTranslation } from 'react-i18next';

// ─── Amenity config ────────────────────────────────────────────────────────────
const AMENITY_CONFIG = {
  wifi: { icon: '📶' },
  ac: { icon: '❄️' },
  parking: { icon: '🅿️' },
  tv: { icon: '📺' },
  kitchen: { icon: '🍳' },
  pets: { icon: '🐾' },
  workspace: { icon: '💻' },
  balcony: { icon: '🌿' },
  washing_machine: { icon: '🫧' },
  heating: { icon: '🔥' },
  furnished: { icon: '🛋️' },
  pool: { icon: '🏊' },
  gym: { icon: '🏋️' },
  elevator: { icon: '🛗' },
};

const TYPE_LABELS = {
  room: { icon: '🛏️', color: 'bg-blue-50 text-blue-700' },
  apartment: { icon: '🏢', color: 'bg-purple-50 text-purple-700' },
  looking_for_roommate: { icon: '🤝', color: 'bg-orange-50 text-orange-700' },
};

const STATUS_CONFIG = {
  active: { color: 'bg-green-50 text-green-700 border-green-200' },
  inactive: { color: 'bg-gray-50 text-gray-500 border-gray-200' },
  rented: { color: 'bg-blue-50 text-blue-700 border-blue-200' },
  expired: { color: 'bg-red-50 text-red-700 border-red-200' },
};

// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'h-8 w-8' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          {star <= (hovered || value)
            ? <StarIcon className={`${sz} text-amber-400`} />
            : <StarOutline className={`${sz} text-gray-300`} />}
        </button>
      ))}
    </div>
  );
}
// pour extraire l’URL d’une photo
const getPhotoUrl = (photo) => {
  if (!photo) return null;
  if (typeof photo === 'string') return photo;
  if (typeof photo === 'object' && photo.url) return photo.url;
  return null;
};


// ─── Photo gallery ─────────────────────────────────────────────────────────────
function PhotoGallery({ photos, mainPhoto, title }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  // const allPhotos = photos?.length ? photos : mainPhoto ? [mainPhoto] : [];
  const allPhotos = (() => {
    const raw = photos?.length ? photos : mainPhoto ? [mainPhoto] : [];
    return raw.map(getPhotoUrl).filter(Boolean); // Convertit chaque élément en URL
  })();

  if (!allPhotos.length) {
    return (
      <div className="h-[440px] bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400">
        <HomeIcon className="h-16 w-16 opacity-30" />
        <p className="text-sm">{t('listingDetail.photoGallery.noPhotos')}</p>
      </div>
    );
  }

  const goPrev = (e) => { e?.stopPropagation(); setSelected((p) => (p - 1 + allPhotos.length) % allPhotos.length); };
  const goNext = (e) => { e?.stopPropagation(); setSelected((p) => (p + 1) % allPhotos.length); };

  // Navigation clavier quand le plein écran est ouvert (← → Échap)
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, allPhotos.length]);

  return (
    <>
      {/* Visionneuse : image ENTIÈRE (object-contain) posée sur un fond flou
          de la même photo → plus de rognage ni de bandes noires. */}
      <div className="relative h-[320px] sm:h-[460px] bg-gray-900 overflow-hidden">
        {/* Fond flou */}
        <img
          src={allPhotos[selected]}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
        />
        <div className="absolute inset-0 bg-black/20" />

        {/* Image complète — clic = plein écran */}
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute inset-0 flex items-center justify-center cursor-zoom-in group"
        >
          <img
            src={allPhotos[selected]}
            alt={title}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.015]"
          />
        </button>

        {/* Indice plein écran */}
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
          <ArrowsPointingOutIcon className="h-3.5 w-3.5" /> {t('listingDetail.photoGallery.fullscreen')}
        </span>

        {/* Compteur */}
        <span className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
          {selected + 1} / {allPhotos.length}
        </span>

        {/* Flèches */}
        {allPhotos.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-gray-800 flex items-center justify-center hover:bg-white shadow-md transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-gray-800 flex items-center justify-center hover:bg-white shadow-md transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Miniatures */}
        {allPhotos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 max-w-[92%] overflow-x-auto px-2 py-1">
            {allPhotos.map((p, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setSelected(i); }}
                className={`h-12 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                  selected === i ? 'border-white scale-105 shadow-lg' : 'border-white/40 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Plein écran (lightbox) */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 z-10 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <img
            src={allPhotos[selected]}
            alt={title}
            className="max-h-[90vh] max-w-[92vw] object-contain select-none"
            onClick={(e) => e.stopPropagation()}
          />

          {allPhotos.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
                <ChevronRightIcon className="h-6 w-6" />
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm px-3 py-1 rounded-full">
                {selected + 1} / {allPhotos.length}
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ─── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, highlight }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="flex items-center gap-2 text-sm text-gray-500">
        <span className="text-base">{icon}</span>
        {label}
      </span>
      <span className={`text-sm font-medium ${highlight ? 'text-[#009966]' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Review modal ──────────────────────────────────────────────────────────────
function ReviewModal({ listing, onClose, onSubmit }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return toast.error(t('listingDetail.reviewModal.ratingRequired'));
    setLoading(true);
    try {
      await onSubmit({ rating, comment, listing_id: listing.id });
      toast.success(t('listingDetail.reviewModal.success'));
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || t('listingDetail.reviewModal.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('listingDetail.reviewModal.title')}</h3>
        <p className="text-sm text-gray-500 mb-5">
          {t('listingDetail.reviewModal.subtitle')}
        </p>
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">{t('listingDetail.reviewModal.overallRating')}</p>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-2">{t('listingDetail.reviewModal.commentOptional')}</p>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            placeholder={t('listingDetail.reviewModal.commentPlaceholder')}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966]"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
            {t('listingDetail.reviewModal.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            className="flex-1 py-2.5 rounded-xl bg-[#009966] text-white text-sm font-medium hover:bg-[#00734d] disabled:opacity-50"
          >
            {loading ? t('listingDetail.reviewModal.submitting') : t('listingDetail.reviewModal.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Rent modal ────────────────────────────────────────────────────────────────
function RentModal({ listing, onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    move_in_date: '',
    duration: '1_month',
    guests: 1,
    notes: '',
    showNotes: false,
    full_name: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const DURATIONS = [
    { value: '1_month', label: t('listingDetail.rentModal.duration1Month') },
    { value: '3_months', label: t('listingDetail.rentModal.duration3Months') },
    { value: '6_months', label: t('listingDetail.rentModal.duration6Months') },
    { value: 'long_term', label: t('listingDetail.rentModal.durationLongTerm') },
  ];

  const monthly = listing.price;
  const deposit = monthly;
  const fee = Math.round(monthly * 0.1);
  const total = monthly + deposit + fee;

  const handleSend = async () => {
    if (!form.move_in_date) return toast.error(t('listingDetail.rentModal.dateRequired'));
    setLoading(true);
    try {
      const typeLabel = listing.type === 'room' ? t('listingDetail.rentModal.typeRoom') : listing.type === 'apartment' ? t('listingDetail.rentModal.typeApartment') : t('listingDetail.rentModal.typeHousing');
      const msg = t('listingDetail.rentModal.message', {
        type: typeLabel,
        title: listing.title,
        date: new Date(form.move_in_date).toLocaleDateString('fr-FR'),
        duration: DURATIONS.find(d => d.value === form.duration)?.label,
        guests: form.guests,
        notes: form.notes ? t('listingDetail.rentModal.notesLine', { notes: form.notes }) : '',
      });

      await messagesService.send(listing.user_id, msg, [], listing.id);
      toast.success(t('listingDetail.rentModal.requestSent'));
      onClose();
      navigate(`/messages/${listing.user_id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || t('listingDetail.rentModal.sendError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('listingDetail.rentModal.title')}</h3>
            <p className="text-xs text-gray-400">{listing.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 grid sm:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-5">
            {/* Listing preview */}
            <div className="flex gap-3 p-3 bg-gradient-to-r from-[#009966]/5 to-transparent border border-[#009966]/10 rounded-xl">
              {(listing.main_photo || listing.photos?.[0]) && (
                <img src={getPhotoUrl(listing.main_photo) || getPhotoUrl(listing.photos?.[0])} className="h-16 w-20 rounded-lg object-cover shrink-0" alt="" />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{listing.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{listing.city}{listing.neighborhood ? `, ${listing.neighborhood}` : ''}</p>
                <p className="text-base font-bold text-[#009966] mt-1">{listing.price?.toLocaleString()} <span className="text-xs font-normal text-gray-400">MAD/mois</span></p>
              </div>
            </div>

            {/* Personal info */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <UserIcon className="h-4 w-4 text-[#009966]" /> {t('listingDetail.rentModal.yourInfo')}
              </p>
              {[
                { name: 'full_name', label: t('listingDetail.rentModal.fullName'), placeholder: t('listingDetail.rentModal.fullNamePlaceholder'), def: user?.full_name },
                { name: 'phone', label: t('listingDetail.rentModal.phone'), placeholder: t('listingDetail.rentModal.phonePlaceholder'), def: user?.phone },
                { name: 'email', label: t('listingDetail.rentModal.email'), placeholder: t('listingDetail.rentModal.emailPlaceholder'), def: user?.email },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    value={form[f.name] || f.def || ''}
                    onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966]"
                  />
                </div>
              ))}
            </div>

            {/* Stay details */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-[#009966]" /> {t('listingDetail.rentModal.stayDetails')}
              </p>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('listingDetail.rentModal.moveInDate')}</label>
                <input
                  type="date"
                  value={form.move_in_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(p => ({ ...p, move_in_date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">{t('listingDetail.rentModal.desiredDuration')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {DURATIONS.map(d => (
                    <button key={d.value} type="button"
                      onClick={() => setForm(p => ({ ...p, duration: d.value }))}
                      className={`py-2 px-3 rounded-lg text-sm border transition-all font-medium ${form.duration === d.value
                        ? 'bg-[#009966] text-white border-[#009966] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#009966]/50'
                        }`}
                    >{d.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('listingDetail.rentModal.guests')}</label>
                <input type="number" min={1} max={10} value={form.guests}
                  onChange={e => setForm(p => ({ ...p, guests: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966]"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" className="rounded"
                    onChange={e => setForm(p => ({ ...p, showNotes: e.target.checked }))} />
                  {t('listingDetail.rentModal.addCustomMessage')}
                </label>
                {form.showNotes && (
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder={t('listingDetail.rentModal.notesPlaceholder')}
                    rows={3}
                    className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <ShieldCheckIcon className="h-4 w-4 text-[#009966]" /> {t('listingDetail.rentModal.security')}
              </p>
              <div className="space-y-2">
                {[
                  { icon: '✅', text: t('listingDetail.rentModal.securityIdentity'), c: 'text-green-700' },
                  { icon: '✅', text: t('listingDetail.rentModal.securityBooking'), c: 'text-green-700' },
                  { icon: '⚠️', text: t('listingDetail.rentModal.securityNeverPay'), c: 'text-amber-600' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm mt-px">{item.icon}</span>
                    <span className={`text-xs ${item.c} leading-relaxed`}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">💰 {t('listingDetail.rentModal.costSummary')}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{t('listingDetail.rentModal.monthlyRent')}</span><span>{monthly.toLocaleString()} {t('listingDetail.mad')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('listingDetail.rentModal.deposit')}</span><span>{deposit.toLocaleString()} {t('listingDetail.mad')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('listingDetail.rentModal.serviceFee')}</span><span>{fee.toLocaleString()} {t('listingDetail.mad')}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                  <span>{t('listingDetail.rentModal.totalInitial')}</span>
                  <span className="text-[#009966]">{total} {t('listingDetail.mad')}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">{t('listingDetail.rentModal.noPaymentNote')}</p>
            </div>

            <button
              onClick={handleSend}
              disabled={loading || !form.move_in_date}
              className="w-full bg-[#009966] text-white py-3.5 rounded-xl font-semibold hover:bg-[#00734d] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              {loading ? t('listingDetail.rentModal.sending') : t('listingDetail.rentModal.sendRequest')}
            </button>
            <p className="text-xs text-center text-gray-400">{t('listingDetail.rentModal.noPaymentShort')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ListingDetail ────────────────────────────────────────────────────────
export default function ListingDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const isOwner = user && listing && user.id === listing.user_id;

  const isChercheur = user?.role === 'chercheur';

  useEffect(() => { fetchListing(); window.scrollTo(0, 0); }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const res = await listingsService.getOne(id);
      setListing(res.data);
      setFavorited(!!res.data.is_favorited);
      const revRes = await api.get(`/auth/users/${res.data.user_id}/reviews`);
      setReviews(revRes.data?.data?.reviews?.data || []);
    } catch {
      toast.error(t('listingDetail.loadError'));
      navigate('/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (data) => {
    await api.post(`/reviews/${listing.user_id}`, data);
    fetchListing();
  };

  // Ajoute/retire l'annonce des favoris (avec mise à jour optimiste + rollback).
  const handleToggleFavorite = async () => {
    if (!user) { navigate('/login'); return; }
    const next = !favorited;
    setFavorited(next);
    try {
      const res = await favoritesService.toggle(listing.id);
      setFavorited(res.favorited);
    } catch (error) {
      setFavorited(!next); // rollback
      toast.error(error.response?.data?.message || t('listingDetail.loadError'));
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009966]" />
      <p className="text-sm text-gray-400">{t('listingDetail.loading')}</p>
    </div>
  );

  if (!listing) return null;

  const type = TYPE_LABELS[listing.type] || { icon: '🏠', color: 'bg-gray-100 text-gray-700' };
  const typeLabel = TYPE_LABELS[listing.type] ? t(`listingDetail.types.${listing.type}`) : listing.type;
  const statusCfg = STATUS_CONFIG[listing.status] || STATUS_CONFIG.active;
  const statusKey = STATUS_CONFIG[listing.status] ? listing.status : 'active';
  const statusLabel = t(`listingDetail.status.${statusKey}`);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Photo Gallery ── */}
      <PhotoGallery photos={listing.photos} mainPhoto={listing.main_photo} title={listing.title} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-[#009966]">{t('listingDetail.breadcrumbHome')}</Link>
          <span>›</span>
          <Link to="/listings" className="hover:text-[#009966]">{t('listingDetail.breadcrumbListings')}</Link>
          <span>›</span>
          <span className="text-gray-600 truncate max-w-[200px]">{listing.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── Title card ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${type.color}`}>
                  {type.icon} {typeLabel}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
                  {statusLabel}
                </span>
                {listing.is_featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full border border-amber-200">
                    <FireIcon className="h-3 w-3" /> {t('listingDetail.featured')}
                  </span>
                )}
                {listing.is_urgent && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-200">
                    <BoltIcon className="h-3 w-3" /> {t('listingDetail.urgent')}
                  </span>
                )}
                {listing.user?.profile?.is_identity_verified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-200">
                    <ShieldCheckIcon className="h-3 w-3" /> {t('listingDetail.verified')}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">{listing.title}</h1>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-2">
                    <MapPinIcon className="h-4 w-4 text-[#009966] shrink-0" />
                    <span>{[listing.address, listing.neighborhood, listing.city].filter(Boolean).join(', ')}</span>
                  </div>
                  {avgRating && (
                    <div className="flex items-center gap-2 mt-2">
                      <StarRating value={Math.round(avgRating)} size="sm" />
                      <span className="text-sm text-gray-600 font-medium">{avgRating}</span>
                      <span className="text-xs text-gray-400">({t('listingDetail.reviewsCount', { count: reviews.length })})</span>
                    </div>
                  )}
                </div>
                <div className="sm:text-right shrink-0">
                  <div className="text-3xl font-bold text-[#009966]">
                    {listing.price?.toLocaleString()}
                    <span className="text-base font-normal text-gray-400 ml-1">MAD</span>
                  </div>
                  <p className="text-xs text-gray-400">{t('listingDetail.perMonth')}</p>
                  {listing.price_is_negotiable && (
                    <span className="inline-block mt-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      💬 {t('listingDetail.negotiable')}
                    </span>
                  )}
                </div>
              </div>

              {/* Key stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
                {[
                  { icon: '🛏️', label: t('listingDetail.stats.bedrooms'), val: listing.bedrooms ?? '—' },
                  { icon: '🚿', label: t('listingDetail.stats.bathrooms'), val: listing.bathrooms ?? '—' },
                  { icon: '👁️', label: t('listingDetail.stats.views'), val: listing.views_count?.toLocaleString() ?? 0 },
                  { icon: '📞', label: t('listingDetail.stats.contacts'), val: listing.contacts_count?.toLocaleString() ?? 0 },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-xl mb-1">{s.icon}</span>
                    <span className="text-lg font-bold text-gray-900">{s.val}</span>
                    <span className="text-xs text-gray-400">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Availability & Details ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#009966]" /> {t('listingDetail.availabilityDetails')}
              </h2>
              <div className="divide-y divide-gray-50">
                <InfoRow icon="📅" label={t('listingDetail.availableFrom')} value={listing.available_from ? new Date(listing.available_from).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null} highlight />
                <InfoRow icon="📆" label={t('listingDetail.availableUntil')} value={listing.available_until ? new Date(listing.available_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : t('listingDetail.notDefined')} />
                <InfoRow icon="🏠" label={t('listingDetail.typeLabel')} value={typeLabel} />
                <InfoRow icon="🛋️" label={t('listingDetail.furnishedLabel')} value={listing.furnished ? t('listingDetail.yes') : t('listingDetail.no')} />
                <InfoRow icon="🛏️" label={t('listingDetail.bedroomsLabel')} value={listing.bedrooms} />
                <InfoRow icon="🚿" label={t('listingDetail.bathroomsLabel')} value={listing.bathrooms} />
                {listing.is_featured && listing.featured_until && (
                  <InfoRow icon="⭐" label={t('listingDetail.featuredUntil')} value={new Date(listing.featured_until).toLocaleDateString('fr-FR')} />
                )}

                <InfoRow icon="🕒" label={t('listingDetail.publishedOn')} value={listing.created_at ? new Date(listing.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
                {/* {listing.updated_at !== listing.created_at && (
                  <InfoRow icon="✏️" label="Mise à jour le" value={listing.updated_at ? new Date(listing.updated_at).toLocaleDateString('fr-FR') : null} />
                )} */}
              </div>
            </div>

            {/* ── Description ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📝</span> {t('listingDetail.about')}
              </h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">{listing.description}</p>

              {listing.house_rules?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    🏠 {t('listingDetail.houseRules')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {listing.house_rules.map((rule, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                        {rule.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Amenities ── */}
            {listing.amenities?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>✨</span> {t('listingDetail.amenitiesCount', { count: listing.amenities.length })}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {listing.amenities.map((a) => {
                    const amenityKey = a.toLowerCase();
                    const cfg = AMENITY_CONFIG[amenityKey] || { icon: '✓' };
                    const amenityLabel = AMENITY_CONFIG[amenityKey] ? t(`listingDetail.amenities.${amenityKey}`) : a;
                    return (
                      <div key={a} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-[#009966]/5 hover:border-[#009966]/20 transition-colors">
                        <span className="text-xl">{cfg.icon}</span>
                        <span className="text-sm text-gray-700 font-medium">{amenityLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Location ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="h-5 w-5 text-[#009966]" /> {t('listingDetail.location')}
              </h2>

              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {[
                  { label: t('listingDetail.city'), value: listing.city, icon: '🏙️' },
                  { label: t('listingDetail.neighborhood'), value: listing.neighborhood, icon: '📍' },
                  { label: t('listingDetail.address'), value: listing.address, icon: '🏠' },
                  { label: t('listingDetail.coordinates'), value: listing.latitude ? `${listing.latitude}°N, ${listing.longitude}°E` : null, icon: '🌐' },
                ].filter(i => i.value).map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm text-gray-800 font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {Number(listing.latitude) && Number(listing.longitude) ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <MapComponent
                      listings={[{
                        ...listing,
                        latitude: Number(listing.latitude),
                        longitude: Number(listing.longitude),
                      }]}
                      center={[Number(listing.latitude), Number(listing.longitude)]}
                      zoom={15}
                      height="300px"
                      showSearch={false}
                      showUserLocation={true}
                    />
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${Number(listing.latitude)},${Number(listing.longitude)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-[#009966] font-medium hover:underline underline-offset-2"
                  >
                    {t('listingDetail.openInGoogleMaps')}
                  </a>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl h-44 flex flex-col items-center justify-center gap-2 text-gray-400 border border-gray-200">
                  <MapPinIcon className="h-8 w-8 text-[#009966]" />
                  <p className="font-semibold text-gray-700">{listing.city}{listing.neighborhood ? `, ${listing.neighborhood}` : ''}</p>
                  <p className="text-xs">{t('listingDetail.positionNotProvided')}</p>
                </div>
              )}
            </div>

            {/* ── Reviews ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {t('listingDetail.reviewsTitle')}
                  </h2>
                  {avgRating && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-gray-900">{avgRating}</span>
                      <div>
                        <StarRating value={Math.round(avgRating)} size="sm" />
                        <p className="text-xs text-gray-400 mt-0.5">{t('listingDetail.reviewsCount', { count: reviews.length })}</p>
                      </div>
                    </div>
                  )}
                </div>
                {isChercheur && !isOwner && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-4 py-2 text-sm bg-[#009966] text-white rounded-xl hover:bg-[#00734d] transition-colors font-medium"
                  >
                    {t('listingDetail.leaveReview')}
                  </button>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-300 gap-2">
                  <StarOutline className="h-10 w-10" />
                  <p className="text-sm text-gray-400">{t('listingDetail.noReviews')}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews.map((review) => (
                    <div key={review.id} className="group">
                      <div className="flex items-start gap-3">
                        {review.reviewer?.avatar ? (
                          <img src={review.reviewer.avatar} className="h-10 w-10 rounded-full object-cover shrink-0" alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#009966]/20 to-[#009966]/10 flex items-center justify-center text-sm font-bold text-[#009966] shrink-0">
                            {review.reviewer?.full_name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-gray-900 text-sm">{review.reviewer?.full_name}</p>
                            <span className="text-xs text-gray-400 shrink-0">
                              {new Date(review.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <StarRating value={review.rating} size="sm" />
                          {review.comment && (
                            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 border-b border-gray-50" />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">

            {/* Host card — sticky */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 lg:sticky lg:top-24">
              {/* Host info */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                <div className="relative">
                  {listing.user?.avatar ? (
                    <img src={listing.user.avatar} className="h-14 w-14 rounded-full object-cover border-2 border-gray-100" alt="" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#009966]/20 to-[#009966]/10 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-[#009966]" />
                    </div>
                  )}
                  <span className="absolute bottom-0.5 right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/users/${listing.user_id}`} className="font-bold text-gray-900 hover:text-[#009966] transition-colors text-sm block truncate">
                    {listing.user?.full_name}
                  </Link>
                  {listing.user?.is_premium && (
                    <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                      <ShieldCheckIcon className="h-3 w-3" /> {t('listingDetail.premium')}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs text-gray-600 font-medium">{listing.user?.average_rating || '0'}</span>
                    <span className="text-xs text-gray-400">/ 5</span>
                  </div>
                </div>
              </div>

              {/* Price summary */}
              <div className="mb-5 p-4 bg-gradient-to-br from-[#009966]/5 to-transparent rounded-xl border border-[#009966]/10">
                <div className="text-2xl font-bold text-[#009966]">
                  {listing.price?.toLocaleString()} MAD
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{t('listingDetail.perMonth')}{listing.price_is_negotiable ? t('listingDetail.negotiableSuffix') : ''}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {t('listingDetail.availableFromShort')} {listing.available_from ? new Date(listing.available_from).toLocaleDateString('fr-FR') : '—'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {isOwner && (
                  <Link
                    to={`/listings/${listing.id}/edit`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#009966] text-white rounded-xl font-semibold text-sm hover:bg-[#00734d] transition-colors shadow-sm"
                  >
                    <PencilIcon className="h-4 w-4" /> {t('listingDetail.editListing')}
                  </Link>
                )}
                {isChercheur && !isOwner && (
                  listing.has_requested ? (
                    <button
                      disabled
                      title={t('listingDetail.requestAlreadySentTitle')}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold text-sm cursor-not-allowed"
                    >
                      <CheckCircleIcon className="h-4 w-4" /> {t('listingDetail.requestAlreadySent')}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowRentModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#009966] text-white rounded-xl font-semibold text-sm hover:bg-[#00734d] transition-colors shadow-sm"
                    >
                      <HomeIcon className="h-4 w-4" /> {t('listingDetail.rentalRequest')}
                    </button>
                  )
                )}
                {!user && (
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#009966] text-white rounded-xl font-semibold text-sm hover:bg-[#00734d] transition-colors"
                  >
                    {t('listingDetail.loginToContact')}
                  </Link>
                )}
                {!isOwner && (
                  <button
                    onClick={handleToggleFavorite}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 border rounded-xl text-sm font-medium transition-all ${favorited ? 'border-red-300 text-red-500 bg-red-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <HeartIcon className={`h-4 w-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
                    {favorited ? t('listingDetail.saved') : t('listingDetail.addToFavorites')}
                  </button>
                )}
                <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors font-medium">
                  <ShareIcon className="h-4 w-4" /> {t('listingDetail.share')}
                </button>
                {!isOwner && user && (
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 text-red-500 text-sm hover:bg-red-50 rounded-xl transition-colors">
                    <FlagIcon className="h-4 w-4" /> {t('listingDetail.reportListing')}
                  </button>
                )}
              </div>

              {/* Stats mini */}
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-base font-bold text-gray-900">{listing.views_count ?? 0}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                    <EyeIcon className="h-3 w-3" /> {t('listingDetail.viewsLabel')}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-base font-bold text-gray-900">{listing.contacts_count ?? 0}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                    <PhoneIcon className="h-3 w-3" /> {t('listingDetail.contactsLabel')}
                  </span>
                </div>
              </div>

              {/* Safety notice */}
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-700 leading-relaxed">
                  🛡️ {t('listingDetail.safetyNotice')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      {showReviewModal && (
        <ReviewModal listing={listing} onClose={() => setShowReviewModal(false)} onSubmit={handleSubmitReview} />
      )}
      {showRentModal && (
        <RentModal listing={listing} onClose={() => setShowRentModal(false)} />
      )}
    </div>
  );
}