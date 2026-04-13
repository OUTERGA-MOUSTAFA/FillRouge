import api from './api';

export const usersService = {

  updateProfileDetails: async (data) => {
    const response = await api.put('/auth/profile-details', data);
    return response.data;
  },

  search: async (params) => {
    const response = await api.get('/search/users', { params });
    return response.data;
  },
  
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  getRecommendations: async () => {
    const response = await api.get('/recommendations');
    return response.data;
  },
  
  getCompatibility: async (userId) => {
    const response = await api.get(`/users/${userId}/compatibility`);
    return response.data;
  },
  
  reportUser: async (userId, reason, description) => {
    const response = await api.post(`/users/${userId}/report`, { reason, description });
    return response.data;
  },
  
  updateProfileDetails: async (data) => {
    const response = await api.put('/auth/profile-details', data);
    return response.data;
  },
  
  uploadIdDocument: async (file, documentType) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', documentType);
    const response = await api.post('/auth/id-document', formData);
    return response.data;
  },
};