import api from './api';

export const listingsService = {
  getAll: async (params) => {
    const response = await api.get('/listings', { params });
    return response.data;
  },
  
  getOne: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/listings', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/listings/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },
  
  toggleStatus: async (id) => {
    const response = await api.post(`/listings/${id}/toggle-status`);
    return response.data;
  },
  
  makeFeatured: async (id, days = 7) => {
    const response = await api.post(`/listings/${id}/feature`, { days });
    return response.data;
  },
  
  myListings: async () => {
    const response = await api.get('/my-listings');
    return response.data;
  },
  
  search: async (params) => {
    const response = await api.get('/search/listings', { params });
    return response.data;
  },
};