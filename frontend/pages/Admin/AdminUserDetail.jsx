import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../src/services/admin'; 
import toast from 'react-hot-toast';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUser(id);
      setUser(response.data);
    } catch (error) {
      toast.error('Erreur chargement utilisateur');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BBA7]"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <Link to="/admin/users" className="text-[#009966] hover:text-[#004d33]">
          ← Retour à la liste
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* User Info */}
        <div className="lg:col-span-2">
          <div className="card p-6 mb-8">
            <div className="flex items-center mb-6">
              {user.avatar ? (
                <img className="h-20 w-20 rounded-full" src={user.avatar} alt="" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">{user.full_name?.[0]}</span>
                </div>
              )}
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                <p className="text-gray-500">{user.email} • {user.phone || 'Pas de téléphone'}</p>
                <div className="flex gap-2 mt-2">
                  {user.is_premium && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Premium</span>
                  )}
                  {user.email_verified_at && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Email vérifié</span>
                  )}
                  {user.profile?.is_identity_verified && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Identité vérifiée</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Annonces</p>
                  <p className="text-xl font-bold">{user.stats.total_listings}</p>
                  <p className="text-xs text-gray-400">{user.stats.active_listings} actives</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Messages</p>
                  <p className="text-xl font-bold">{user.stats.total_messages_sent + user.stats.total_messages_received}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Avis</p>
                  <p className="text-xl font-bold">{user.stats.total_reviews}</p>
                  <p className="text-xs text-gray-400">Note: {user.stats.average_rating}/5</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Signalements</p>
                  <p className="text-xl font-bold text-red-600">{user.stats.total_reports}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Dernières annonces</h3>
            <div className="space-y-4">
              {user.listings.map((listing) => (
                <div key={listing.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="font-medium">{listing.title}</p>
                    <p className="text-sm text-gray-500">{listing.city} • {listing.price} MAD/mois</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {listing.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Panel */}
        <div>
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              {!user.email_verified_at && (
                <button className="btn-primary w-full">Vérifier l'utilisateur</button>
              )}
              {user.suspended_until ? (
                <button className="btn-primary w-full bg-green-500 hover:bg-green-600">
                  Lever la suspension
                </button>
              ) : (
                <button className="btn-primary w-full bg-red-500 hover:bg-red-600">
                  Suspendre l'utilisateur
                </button>
              )}
              <button className="btn-secondary w-full">
                Envoyer un message
              </button>
              <button className="btn-secondary w-full text-red-600 hover:bg-red-50">
                Supprimer le compte
              </button>
            </div>
          </div>

          {/* Suspension Info */}
          {user.suspended_until && (
            <div className="card p-6 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Suspendu</h3>
              <p className="text-sm text-red-600">Jusqu'au: {new Date(user.suspended_until).toLocaleDateString()}</p>
              {user.suspension_reason && (
                <p className="text-sm text-red-600 mt-2">Raison: {user.suspension_reason}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}