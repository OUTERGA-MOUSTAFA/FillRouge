import api from './api';

export const adminService = {
  // Dashboard
  getStats: async (period = 'month') => {
    const response = await api.get('/admin/stats', { params: { period } });
    return response.data;
  },

  getAdvancedStats: async (startDate, endDate) => {
    const response = await api.get('/admin/stats/advanced', { params: { start_date: startDate, end_date: endDate } });
    return response.data;
  },

  // users
  // getUsers: async (params) => {
  //   const response = await api.get('/admin/users', { params });
  //   return response.data;
  // },
  getUsers: async (params, options = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        cleanParams[key] = params[key];
      }
    });// clean prams

    const response = await api.get('/admin/users', {
      params: cleanParams,
      signal: options.signal // Pour pouvoir annuler la requête
    });
    return response.data;
  },


  getUser: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  suspendUser: async (userId, days, reason) => {
    const response = await api.put(`/admin/users/${userId}/suspend`, { days, reason });
    return response.data;
  },

  unsuspendUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/unsuspend`);
    return response.data;
  },

  verifyUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/verify`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Listings
  getListings: async (params) => {
    const response = await api.get('/admin/listings', { params });
    return response.data;
  },

  deleteListing: async (listingId) => {
    const response = await api.delete(`/admin/listings/${listingId}`);
    return response.data;
  },

  // Reports
  getReports: async (params) => {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  resolveReport: async (reportId, action, note) => {
    const response = await api.put(`/admin/reports/${reportId}/resolve`, { action, note });
    return response.data;
  },

  // Income Verifications
  getIncomeVerifications: async (params) => {
    const response = await api.get('/admin/income-verifications', { params });
    return response.data;
  },

  approveIncomeVerification: async (id, expiresInDays = 365) => {
    const response = await api.post(`/admin/income-verifications/${id}/approve`, { expires_in_days: expiresInDays });
    return response.data;
  },

  rejectIncomeVerification: async (id, reason) => {
    const response = await api.post(`/admin/income-verifications/${id}/reject`, { reason });
    return response.data;
  },

  getRecentListings: async () => {
    const response = await api.get('/admin/recent-listings');
    return response.data;
  },

  getRecentUsers: async () => {
    const response = await api.get('/admin/recent-users');
    return response.data;
  },

  getPendingReports: async () => {
    const response = await api.get('/admin/pending-reports');
    return response.data;
  },
};