import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { listingsService } from '../src/services/listings';
import toast from 'react-hot-toast';

export default function MyListings() {
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
      const message = error.response?.data?.message || 'Erreur chargement des annonces';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await listingsService.toggleStatus(id);
      toast.success(currentStatus === 'active' ? 'Annonce désactivée' : 'Annonce activée');
      fetchListings();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur';
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer définitivement cette annonce ?')) return;
    try {
      await listingsService.delete(id);
      toast.success('Annonce supprimée');
      fetchListings();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur';
      toast.error(message);
    }
  };

  const handleMakeFeatured = async (id) => {
    try {
      await listingsService.makeFeatured(id);
      toast.success('Annonce mise en avant !');
      fetchListings();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes annonces</h1>
        <Link to="/listings/create" className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nouvelle annonce
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 mb-4">Vous n'avez pas encore d'annonces</p>
          <Link to="/listings/create" className="btn-primary">
            Créer ma première annonce
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="card overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-48 h-48 bg-gray-200">
                  {listing.main_photo || listing.photos?.[0] ? (
                    <img
                      src={listing.main_photo || listing.photos[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Pas d'image
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                      <p className="text-gray-500 text-sm">
                        {listing.city} • {listing.price.toLocaleString()} MAD/mois
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          listing.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {listing.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        {listing.is_featured && (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            ⭐ Mis en avant
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Vues: {listing.views_count || 0}
                      </p>
                      <p className="text-sm text-gray-500">
                        Messages: {listing.contacts_count || 0}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="border-t md:border-t-0 md:border-l p-4 flex md:flex-col gap-2">
                  <Link
                    to={`/listings/${listing.id}`}
                    className="btn-secondary text-sm flex items-center justify-center gap-1"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Voir
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(listing.id, listing.status)}
                    className="btn-secondary text-sm flex items-center justify-center gap-1"
                  >
                    {listing.status === 'active' ? 'Désactiver' : 'Activer'}
                  </button>
                  <Link
                    to={`/listings/edit/${listing.id}`}
                    className="btn-secondary text-sm flex items-center justify-center gap-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Modifier
                  </Link>
                  {!listing.is_featured && (
                    <button
                      onClick={() => handleMakeFeatured(listing.id)}
                      className="btn-primary text-sm flex items-center justify-center gap-1"
                    >
                      Mettre en avant
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center justify-center gap-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}