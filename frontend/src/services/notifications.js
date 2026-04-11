import api from './api';

export const notificationsService = {
  getAll: async (page = 1) => {
    const response = await api.get('/notifications', { params: { page } });
    return response.data;
  },
  
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  
  delete: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
  
  updatePreferences: async (preferences) => {
    const response = await api.put('/auth/notification-preferences', preferences);
    return response.data;
  },
};