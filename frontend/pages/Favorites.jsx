import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { favoritesService } from '../src/services/favorites';
import ListingCard from '../src/components/listings/ListingCard';
import toast from 'react-hot-toast';

export default function Favorites() {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoritesService.list();
      setFavorites(res.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || t('favorites.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (listingId) => {
    setRemovingId(listingId);
    // Retrait optimiste
    const previous = favorites;
    setFavorites((prev) => prev.filter((l) => l.id !== listingId));
    try {
      await favoritesService.toggle(listingId);
      toast.success(t('favorites.removed'));
    } catch (error) {
      setFavorites(previous); // rollback
      toast.error(error.response?.data?.message || t('favorites.error'));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-r from-[#009966] to-[#00BBA7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
              <HeartSolid className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('favorites.title')}</h1>
              <p className="text-white/80 text-sm mt-0.5">
                {t('favorites.subtitle', { count: favorites.length })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          /* ── Skeleton ── */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          /* ── Empty state ── */
          <div className="bg-white rounded-2xl border border-gray-100 py-16 px-6 text-center max-w-lg mx-auto mt-6">
            <div className="h-16 w-16 rounded-full bg-[#e6f7f5] flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="h-8 w-8 text-[#009966]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('favorites.emptyTitle')}</h2>
            <p className="text-gray-500 text-sm mt-1 mb-6">{t('favorites.emptyText')}</p>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#009966] text-white rounded-xl text-sm font-semibold hover:bg-[#00734d] transition-colors shadow-sm"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              {t('favorites.browse')}
            </Link>
          </div>
        ) : (
          /* ── Grid ── */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((listing) => (
              <div key={listing.id} className="relative group">
                <ListingCard listing={listing} featured={listing.is_featured} />
                {/* Bouton retirer (au-dessus de la carte-lien) */}
                <button
                  onClick={() => handleRemove(listing.id)}
                  disabled={removingId === listing.id}
                  title={t('favorites.remove')}
                  className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white/95 backdrop-blur shadow-md flex items-center justify-center text-red-500 hover:bg-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <HeartSolid className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
