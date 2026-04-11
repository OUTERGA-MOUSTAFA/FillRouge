import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { adminService } from '../../services/admin';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    plan: '',
    page: 1,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers(filters);
      setUsers(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      toast.error('Erreur chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId, days) => {
    if (!confirm(`Suspendre cet utilisateur pour ${days} jours ?`)) return;
    try {
      await adminService.suspendUser(userId, days, 'Comportement inapproprié');
      toast.success('Utilisateur suspendu');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleUnsuspend = async (userId) => {
    try {
      await adminService.unsuspendUser(userId);
      toast.success('Suspension levée');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleVerify = async (userId) => {
    try {
      await adminService.verifyUser(userId);
      toast.success('Utilisateur vérifié');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-600">Total: {pagination?.total || 0} utilisateurs</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="input w-40"
          >
            <option value="">Tous</option>
            <option value="verified">Vérifiés</option>
            <option value="unverified">Non vérifiés</option>
            <option value="suspended">Suspendus</option>
          </select>
          <select
            value={filters.plan}
            onChange={(e) => setFilters({ ...filters, plan: e.target.value, page: 1 })}
            className="input w-40"
          >
            <option value="">Tous les plans</option>
            <option value="free">Gratuit</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vérifié</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.avatar ? (
                        <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                      ) : (
                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      )}
                      <div className="ml-4">
                        <Link to={`/admin/users/${user.id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600">
                          {user.full_name}
                        </Link>
                        <div className="text-sm text-gray-500">{user.age} ans</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.subscription_plan === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                      user.subscription_plan === 'standard' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.subscription_plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.email_verified_at ? (
                      <span className="text-green-600">✓ Vérifié</span>
                    ) : (
                      <span className="text-red-600">✗ Non vérifié</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.suspended_until ? (
                      <span className="text-red-600">Suspendu</span>
                    ) : (
                      <span className="text-green-600">Actif</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        Voir
                      </Link>
                      {!user.email_verified_at && (
                        <button
                          onClick={() => handleVerify(user.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Vérifier
                        </button>
                      )}
                      {user.suspended_until ? (
                        <button
                          onClick={() => handleUnsuspend(user.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Réactiver
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(user.id, 30)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Suspendre
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.current_page} sur {pagination.last_page}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === pagination.last_page}
              className="btn-secondary disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}