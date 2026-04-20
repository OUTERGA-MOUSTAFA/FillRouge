import { useState, useEffect } from 'react';
import MapComponent from './MapComponent';
import { listingsService } from '../../services/listings';
import toast from 'react-hot-toast';

export default function MapWithListings({ filters = {}, onListingSelect }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [filters, bounds]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = { ...filters, per_page: 100 };
      if (bounds) {
        // Ajouter les limites de la carte
        params.north = bounds.getNorth();
        params.south = bounds.getSouth();
        params.east = bounds.getEast();
        params.west = bounds.getWest();
      }
      const response = await listingsService.getAll(params);
      setListings(response.data.data || []);
    } catch (error) {
      toast.error('Erreur chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (listing) => {
    setSelectedListing(listing);
    if (onListingSelect) {
      onListingSelect(listing);
    }
  };

  const handleBoundsChange = (newBounds) => {
    setBounds(newBounds);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Carte */}
      <div className="lg:col-span-2">
        <MapComponent
          listings={listings}
          onMarkerClick={handleMarkerClick}
          onBoundsChange={handleBoundsChange}
          height="600px"
          showSearch={true}
          showUserLocation={true}
        />
      </div>
      
      {/* Liste des annonces */}
      <div className="bg-white rounded-xl shadow-sm p-4 h-[600px] overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-4">
          Annonces à proximité ({listings.length})
        </h3>
        
        {listings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucune annonce dans cette zone
          </p>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedListing?.id === listing.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleMarkerClick(listing)}
              >
                <div className="flex gap-3">
                  {listing.main_photo && (
                    <img
                      src={listing.main_photo}
                      alt={listing.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-clamp-1">
                      {listing.title}
                    </h4>
                    <p className="text-sm text-gray-500">{listing.city}</p>
                    <p className="text-primary-600 font-semibold mt-1">
                      {listing.price.toLocaleString()} MAD
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}