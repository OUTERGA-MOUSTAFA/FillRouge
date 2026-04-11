import api from './api';

export const matchesService = {
  getMatches: async () => {
    const response = await api.get('/matches');
    return response.data;
  },
  
  accept: async (userId) => {
    const response = await api.post(`/matches/${userId}/accept`);
    return response.data;
  },
  
  decline: async (userId) => {
    const response = await api.post(`/matches/${userId}/decline`);
    return response.data;
  },
  
  block: async (userId) => {
    const response = await api.post(`/matches/${userId}/block`);
    return response.data;
  },
};