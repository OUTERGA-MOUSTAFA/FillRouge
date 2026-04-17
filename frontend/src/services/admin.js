import api from './api';

export const adminService = {
  // Dashboard
  getStats: async (period = 'month') => {
    const response = await api.get('/auth/admin/stats', { params: { period } });
    return response.data;
  },
  
  getAdvancedStats: async (startDate, endDate) => {
    const response = await api.get('/auth/admin/stats/advanced', { params: { start_date: startDate, end_date: endDate } });
    return response.data;
  },
  
  // Users
  getUsers: async (params) => {
    const response = await api.get('/auth/admin/users', { params });
    return response.data;
  },
  
  getUser: async (userId) => {
    const response = await api.get(`/auth/admin/users/${userId}`);
    return response.data;
  },
  
  suspendUser: async (userId, days, reason) => {
    const response = await api.put(`/auth/admin/users/${userId}/suspend`, { days, reason });
    return response.data;
  },
  
  unsuspendUser: async (userId) => {
    const response = await api.put(`/auth/admin/users/${userId}/unsuspend`);
    return response.data;
  },
  
  verifyUser: async (userId) => {
    const response = await api.put(`/auth/admin/users/${userId}/verify`);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/auth/admin/users/${userId}`);
    return response.data;
  },
  
  // Listings
  getListings: async (params) => {
    const response = await api.get('/auth/admin/listings', { params });
    return response.data;
  },
  
  deleteListing: async (listingId) => {
    const response = await api.delete(`/auth/admin/listings/${listingId}`);
    return response.data;
  },
  
  // Reports
  getReports: async (params) => {
    const response = await api.get('/auth/admin/reports', { params });
    return response.data;
  },
  
  resolveReport: async (reportId, action, note) => {
    const response = await api.put(`/auth/admin/reports/${reportId}/resolve`, { action, note });
    return response.data;
  },
  
  // Income Verifications
  getIncomeVerifications: async (params) => {
    const response = await api.get('/auth/admin/income-verifications', { params });
    return response.data;
  },
  
  approveIncomeVerification: async (id, expiresInDays = 365) => {
    const response = await api.post(`/auth/admin/income-verifications/${id}/approve`, { expires_in_days: expiresInDays });
    return response.data;
  },
  
  rejectIncomeVerification: async (id, reason) => {
    const response = await api.post(`/auth/admin/income-verifications/${id}/reject`, { reason });
    return response.data;
  },

   getRecentListings: async () => {
    const response = await api.get('/auth/admin/recent-listings');
    return response.data;
  },
  
  getRecentUsers: async () => {
    const response = await api.get('/auth/admin/recent-users');
    return response.data;
  },
  
  getPendingReports: async () => {
    const response = await api.get('/auth/admin/pending-reports');
    return response.data;
  },
};