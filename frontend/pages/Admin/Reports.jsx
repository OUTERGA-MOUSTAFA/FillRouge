import { useState, useEffect } from 'react';
import { adminService } from '../../src/services/admin';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'pending',
    type: '',
    page: 1,
  });
  const [pagination, setPagination] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await adminService.getReports(filters);
      setReports(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      toast.error('Erreur chargement des signalements');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId, action, note) => {
    try {
      await adminService.resolveReport(reportId, action, note);
      toast.success('Signalement traité');
      setActionModalOpen(false);
      fetchReports();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const getTypeIcon = (report) => {
    if (report.reported_user_id) return '👤';
    if (report.listing_id) return '🏠';
    if (report.message_id) return '💬';
    return '📋';
  };

  const getReasonText = (reason) => {
    const reasons = {
      spam: 'Spam',
      inappropriate_behavior: 'Comportement inapproprié',
      fake_profile: 'Faux profil',
      harassment: 'Harcèlement',
      other: 'Autre',
    };
    return reasons[reason] || reason;
  };

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Signalements</h1>
        <p className="text-gray-600">En attente: {pagination?.total || 0}</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="input w-40"
          >
            <option value="pending">En attente</option>
            <option value="resolved">Résolus</option>
            <option value="rejected">Rejetés</option>
            <option value="">Tous</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="input w-40"
          >
            <option value="">Tous les types</option>
            <option value="user">Utilisateurs</option>
            <option value="listing">Annonces</option>
            <option value="message">Messages</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : reports.map((report) => (
          <div key={report.id} className="card p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{getTypeIcon(report)}</div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Signalement #{report.id}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status === 'pending' ? 'En attente' : report.status === 'resolved' ? 'Résolu' : 'Rejeté'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Raison:</span> {getReasonText(report.reason)}
                  </p>
                  {report.description && (
                    <p className="text-gray-500 text-sm mb-2">{report.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Signalé par {report.reporter?.full_name} • {new Date(report.created_at).toLocaleDateString()}
                  </p>
                  {report.reported_user && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Utilisateur signalé:</span> {report.reported_user.full_name}
                    </p>
                  )}
                  {report.listing && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Annonce signalée:</span> {report.listing.title}
                    </p>
                  )}
                </div>
              </div>
              
              {report.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setActionModalOpen(true);
                    }}
                    className="btn-primary text-sm"
                  >
                    Traiter
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="mt-6 flex justify-between items-center">
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

      {/* Action Modal */}
      {actionModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Traiter le signalement</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleResolve(selectedReport.id, 'ignore', 'Signalement ignoré')}
                className="w-full btn-secondary"
              >
                Ignorer (pas d'action)
              </button>
              <button
                onClick={() => handleResolve(selectedReport.id, 'warning', 'Avertissement envoyé')}
                className="w-full btn-secondary"
              >
                Envoyer un avertissement
              </button>
              {selectedReport.reported_user_id && (
                <button
                  onClick={() => handleResolve(selectedReport.id, 'suspend_user', 'Utilisateur suspendu')}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Suspendre l'utilisateur
                </button>
              )}
              {selectedReport.listing_id && (
                <button
                  onClick={() => handleResolve(selectedReport.id, 'delete_listing', 'Annonce supprimée')}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Supprimer l'annonce
                </button>
              )}
              {selectedReport.message_id && (
                <button
                  onClick={() => handleResolve(selectedReport.id, 'delete_message', 'Message supprimé')}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Supprimer le message
                </button>
              )}
              <button
                onClick={() => setActionModalOpen(false)}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}