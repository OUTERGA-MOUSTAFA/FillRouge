import { useState, useEffect } from 'react';
import { EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { adminService } from '../../src/services/admin';  // ← chemin corrigé
import toast from 'react-hot-toast';

export default function AdminIncomeVerifications() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const response = await adminService.getIncomeVerifications({ status: 'pending' });
      setVerifications(response.data.data || []);
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur chargement des demandes';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveIncomeVerification(id);
      toast.success('Demande approuvée');
      fetchVerifications();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur';
      toast.error(message);
    }
  };

  const handleReject = async (id) => {
    const reasonText = prompt('Raison du rejet :');
    if (!reasonText) return;
    try {
      await adminService.rejectIncomeVerification(id, reasonText);
      toast.success('Demande rejetée');
      fetchVerifications();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur';
      toast.error(message);
    }
  };

  const formatIncome = (income) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(income);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BBA7]"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vérifications des revenus</h1>
        <p className="text-gray-600">En attente: {verifications.length}</p>
      </div>

      <div className="space-y-4">
        {verifications.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-500">Aucune demande en attente</p>
          </div>
        ) : (
          verifications.map((verif) => (
            <div key={verif.id} className="card p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{verif.user?.full_name}</h3>
                    <span className="text-sm text-gray-500">{verif.user?.email}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Revenu déclaré:</span>
                      <span className="ml-2 font-medium">{formatIncome(verif.declared_income)}</span>
                    </div>
                    {verif.employer_name && (
                      <div>
                        <span className="text-gray-500">Employeur:</span>
                        <span className="ml-2">{verif.employer_name}</span>
                      </div>
                    )}
                    {verif.job_title && (
                      <div>
                        <span className="text-gray-500">Poste:</span>
                        <span className="ml-2">{verif.job_title}</span>
                      </div>
                    )}
                    {verif.employment_duration_months && (
                      <div>
                        <span className="text-gray-500">Ancienneté:</span>
                        <span className="ml-2">{verif.employment_duration_months} mois</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Soumis le {new Date(verif.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedDoc(verif.document_path);
                      setModalOpen(true);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-800"
                    title="Voir le document"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleApprove(verif.id)}
                    className="p-2 text-green-600 hover:text-green-800"
                    title="Approuver"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleReject(verif.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Rejeter"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Modal */}
      {modalOpen && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl p-4 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Document justificatif</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {selectedDoc.endsWith('.pdf') ? (
              <iframe src={selectedDoc} className="w-full h-96" title="Document" />
            ) : (
              <img src={selectedDoc} alt="Document" className="w-full rounded-lg" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}