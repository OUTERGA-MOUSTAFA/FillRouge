import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PencilIcon, TrashIcon, EyeIcon, PlusIcon,
  ChatBubbleLeftRightIcon, SparklesIcon, PowerIcon,
  DocumentTextIcon, CheckCircleIcon, PhotoIcon,
} from '@heroicons/react/24/outline';
import { listingsService } from '../src/services/listings';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function MyListings() {
  const { t } = useTranslation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await listingsService.myListings();
      setListings(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || t('myListings.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await listingsService.toggleStatus(id);
      toast.success(currentStatus === 'active' ? t('myListings.listingDeactivated') : t('myListings.listingActivated'));
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.message || t('myListings.error'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('myListings.confirmDelete'))) return;
    try {
      await listingsService.delete(id);
      toast.success(t('myListings.listingDeleted'));
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.message || t('myListings.error'));
    }
  };

  const handleMakeFeatured = async (id) => {
    try {
      await listingsService.makeFeatured(id);
      toast.success(t('myListings.listingFeatured'));
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.message || t('myListings.error'));
    }
  };

  // Statistiques synthétiques
  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    views: listings.reduce((sum, l) => sum + (l.views_count || 0), 0),
  };

  const StatCard = ({ icon: Icon, value, label, tone }) => (
    <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-r from-[#009966] to-[#00BBA7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('myListings.title')}</h1>
              <p className="text-white/80 text-sm mt-1">{t('myListings.subtitle')}</p>
            </div>
            <Link
              to="/listings/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#009966] rounded-xl text-sm font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm shrink-0"
            >
              <PlusIcon className="h-5 w-5" />
              {t('myListings.newListing')}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Stats ── */}
        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            <StatCard icon={DocumentTextIcon} value={stats.total} label={t('myListings.statTotal')} tone="bg-[#e6f7f5] text-[#009966]" />
            <StatCard icon={CheckCircleIcon} value={stats.active} label={t('myListings.statActive')} tone="bg-green-50 text-green-600" />
            <StatCard icon={EyeIcon} value={stats.views} label={t('myListings.statViews')} tone="bg-blue-50 text-blue-600" />
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          /* ── Empty state ── */
          <div className="bg-white rounded-2xl border border-gray-100 py-16 px-6 text-center max-w-lg mx-auto">
            <div className="h-16 w-16 rounded-full bg-[#e6f7f5] flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="h-8 w-8 text-[#009966]" />
            </div>
            <p className="text-gray-600 mb-6">{t('myListings.noListings')}</p>
            <Link
              to="/listings/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#009966] text-white rounded-xl text-sm font-semibold hover:bg-[#00734d] transition-colors shadow-sm"
            >
              <PlusIcon className="h-4 w-4" />
              {t('myListings.createFirstListing')}
            </Link>
          </div>
        ) : (
          /* ── Listing cards ── */
          <div className="space-y-4">
            {listings.map((listing) => {
              const isActive = listing.status === 'active';
              const photo = listing.main_photo || listing.photos?.[0];
              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="sm:w-52 h-44 sm:h-auto bg-gray-100 shrink-0 relative">
                      {photo ? (
                        <img src={photo} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <PhotoIcon className="h-10 w-10" />
                        </div>
                      )}
                      {listing.is_featured && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-amber-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                          ⭐ {t('myListings.featured')}
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate">{listing.title}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {listing.city} · <span className="font-semibold text-[#009966]">{listing.price?.toLocaleString()}</span> {t('myListings.perMonth')}
                          </p>
                        </div>
                        <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                          isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {isActive ? t('myListings.statusActive') : t('myListings.statusInactive')}
                        </span>
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1.5"><EyeIcon className="h-4 w-4" /> {listing.views_count || 0}</span>
                        <span className="inline-flex items-center gap-1.5"><ChatBubbleLeftRightIcon className="h-4 w-4" /> {listing.contacts_count || 0}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                        <Link
                          to={`/listings/${listing.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" /> {t('myListings.view')}
                        </Link>
                        <Link
                          to={`/listings/${listing.id}/edit`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" /> {t('myListings.edit')}
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(listing.id, listing.status)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <PowerIcon className="h-4 w-4" /> {isActive ? t('myListings.deactivate') : t('myListings.activate')}
                        </button>
                        {!listing.is_featured && (
                          <button
                            onClick={() => handleMakeFeatured(listing.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                          >
                            <SparklesIcon className="h-4 w-4" /> {t('myListings.makeFeatured')}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-auto"
                        >
                          <TrashIcon className="h-4 w-4" /> {t('myListings.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
