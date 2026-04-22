import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { adminService } from '../../src/services/admin';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    plan: '',
    page: 1,
    per_page: 20,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [pagination, setPagination] = useState(null);
  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Fonction fetchUsers optimisée avec annulation
  const fetchUsers = useCallback(async () => {
    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const response = await adminService.getUsers(filters, {
        signal: abortControllerRef.current.signal
      });
      
      setUsers(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page,
        from: response.data.from,
        to: response.data.to
      });
    } catch (error) {
      // Ignorer les erreurs d'annulation
      if (error.name !== 'AbortError' && error.code !== 'ERR_CANCELED') {
        console.error('Fetch error:', error);
        toast.error('Erreur lors du chargement des utilisateurs');
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Effet avec debounce pour la recherche
  useEffect(() => {
    // Clear le timeout précédent
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce de 500ms pour la recherche
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers();
    }, 500);

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchUsers]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/R';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return 'N/R';
    }
  };

  // Gestionnaire de changement de filtre avec reset page
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value,
      page: key === 'per_page' ? 1 : (key !== 'page' ? 1 : prev.page)
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.last_page) {
      setFilters(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSuspend = async (userId, days) => {
    if (!confirm(`Suspendre cet utilisateur pour ${days} jours ?`)) return;
    try {
      await adminService.suspendUser(userId, days, 'Comportement inapproprié');
      toast.success('Utilisateur suspendu avec succès');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la suspension');
    }
  };

  const handleUnsuspend = async (userId) => {
    try {
      await adminService.unsuspendUser(userId);
      toast.success('Suspension levée avec succès');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la réactivation');
    }
  };

  const handleVerify = async (userId) => {
    try {
      await adminService.verifyUser(userId);
      toast.success('Utilisateur vérifié avec succès');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la vérification');
    }
  };

  // Composant de pagination amélioré
  const PaginationComponent = () => {
    if (!pagination || pagination.last_page <= 1) return null;

    const currentPage = pagination.current_page;
    const lastPage = pagination.last_page;
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(lastPage, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-600">
          Affichage de {pagination.from || ((currentPage - 1) * pagination.per_page + 1)} à{' '}
          {pagination.to || Math.min(currentPage * pagination.per_page, pagination.total)} sur{' '}
          {pagination.total} utilisateurs
        </div>
        
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            «
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Précédent
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 rounded border hover:bg-gray-50 transition-colors"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded border transition-colors ${
                currentPage === page
                  ? 'bg-[#00BBA7] text-white border-[#00BBA7]'
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          {endPage < lastPage && (
            <>
              {endPage < lastPage - 1 && <span className="px-2">...</span>}
              <button
                onClick={() => handlePageChange(lastPage)}
                className="px-3 py-1 rounded border hover:bg-gray-50 transition-colors"
              >
                {lastPage}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Suivant
          </button>
          <button
            onClick={() => handlePageChange(lastPage)}
            disabled={currentPage === lastPage}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            »
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Afficher :</span>
          <select
            value={filters.per_page}
            onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
            className="input py-1 w-20 text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    );
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
                placeholder="Rechercher par nom, email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input w-40"
          >
            <option value="">Tous les statuts</option>
            <option value="verified">Vérifiés</option>
            <option value="unverified">Non vérifiés</option>
            <option value="suspended">Suspendus</option>
          </select>
          <select
            value={filters.plan}
            onChange={(e) => handleFilterChange('plan', e.target.value)}
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BBA7] mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Chargement...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.avatar ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt={user.full_name} />
                        ) : (
                          <UserCircleIcon className="h-10 w-10 text-gray-400" />
                        )}
                        <div className="ml-4">
                          <Link to={`/admin/users/${user.id}`} className="text-sm font-medium text-gray-900 hover:text-[#009966]">
                            {user.full_name}
                          </Link>
                          <div className="text-sm text-gray-500">
                            {calculateAge(user.birth_date)} ans
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.subscription_plan === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                        user.subscription_plan === 'standard' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.subscription_plan || 'free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email_verified_at ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          ✓ Vérifié
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          ✗ Non vérifié
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.suspended_until && new Date(user.suspended_until) > new Date() ? (
                        <span className="text-red-600 text-sm">
                          Suspendu
                        </span>
                      ) : (
                        <span className="text-green-600 text-sm">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-3">
                        <Link
                          to={`/admin/users/${user.id}`}
                          className="text-[#009966] hover:text-[#004d33] font-medium"
                        >
                          Voir
                        </Link>
                        {!user.email_verified_at && (
                          <button
                            onClick={() => handleVerify(user.id)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Vérifier
                          </button>
                        )}
                        {user.suspended_until && new Date(user.suspended_until) > new Date() ? (
                          <button
                            onClick={() => handleUnsuspend(user.id)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Réactiver
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspend(user.id, 30)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Suspendre
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationComponent />
      </div>
    </div>
  );
}