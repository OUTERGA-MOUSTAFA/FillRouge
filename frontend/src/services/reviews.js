import api from './api';

export const reviewsService = {
  getMyReviews: async () => {
    const response = await api.get('/my-reviews');
    return response.data;
  },
  
  create: async (userId, rating, comment, listingId = null) => {
    const response = await api.post(`/reviews/${userId}`, { rating, comment, listing_id: listingId });
    return response.data;
  },
  
  update: async (reviewId, rating, comment) => {
    const response = await api.put(`/reviews/${reviewId}`, { rating, comment });
    return response.data;
  },
  
  delete: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
  
  getUserReviews: async (userId) => {
    const response = await api.get(`/users/${userId}/reviews`);
    return response.data;
  },
};