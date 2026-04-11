import api from './api';

export const subscriptionService = {
  getPlans: async () => {
    const response = await api.get('/subscription/plans');
    return response.data;
  },
  
  getCurrent: async () => {
    const response = await api.get('/subscription/current');
    return response.data;
  },
  
  checkout: async (plan, paymentMethod, paymentDetails) => {
    const response = await api.post('/subscription/checkout', {
      plan,
      payment_method: paymentMethod,
      ...paymentDetails
    });
    return response.data;
  },
  
  cancel: async () => {
    const response = await api.post('/subscription/cancel');
    return response.data;
  },
};