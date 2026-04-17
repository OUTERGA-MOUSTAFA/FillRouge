import api from './api';

export const usersService = {
  uploadIdDocument: async (file, documentType) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', documentType);
    const response = await api.post('/auth/id-document', formData);
    return response.data;
  },

   // Récupérer le profil d'un utilisateur
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  // Mettre à jour les détails du profil (bio, interests, etc.)
  updateProfileDetails: async (data) => {
    const response = await api.put('/auth/profile-details', data);
    return response.data;
  },
  
  // Obtenir les recommandations
  getRecommendations: async () => {
    const response = await api.get('/recommendations');
    return response.data;
  },
  
  // Obtenir le score de compatibilité
  getCompatibility: async (userId) => {
    const response = await api.get(`/users/${userId}/compatibility`);
    return response.data;
  },
  
  // Rechercher des utilisateurs
  search: async (params) => {
    const response = await api.get('/search/users', { params });
    return response.data;
  },
  
  // Signaler un utilisateur
  reportUser: async (userId, reason, description) => {
    const response = await api.post(`/users/${userId}/report`, { reason, description });
    return response.data;
  },
};