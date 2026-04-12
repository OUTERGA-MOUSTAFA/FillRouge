import { useState, useEffect } from 'react';
import { FunnelIcon, MapIcon } from '@heroicons/react/24/outline';
import ListingCard from '../components/listings/ListingCard';
import ListingFilters from '../components/listings/ListingFilters';
import { listingsService } from '../services/listings';
import toast from 'react-hot-toast';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // list or map

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await listingsService.getAll(filters);
      setListings(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des annonces', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters) => {
    fetchListings(filters);
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Annonces de colocation</h1>
          <p className="text-gray-600 mt-1">{listings.length} annonces disponibles</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5" />
            Filtres
          </button>
          
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700'}`}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 ${viewMode === 'map' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700'}`}
            >
              <MapIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
          <p className="text-gray-500">Carte interactive - À venir</p>
        </div>
      )}

      {/* Filters Modal */}
      <ListingFilters
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  );
}