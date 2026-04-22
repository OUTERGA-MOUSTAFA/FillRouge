// src/services/subscription.js
import api from './api';

export const subscriptionService = {
  // Récupérer les plans
  getPlans: async () => {
    const response = await api.get('/subscription/plans');
    return response.data; // Retourne directement { success: true, data: {...} }
  },
  
  // Récupérer l'abonnement actuel
  getCurrent: async () => {
    const response = await api.get('/subscription/current');
    return response.data; // Retourne directement { success: true, data: {...} }
  },
  
  // Paiement
  checkout: async (plan, paymentMethod, paymentDetails) => {
    const response = await api.post('/subscription/checkout', {
      plan,
      payment_method: paymentMethod,
      payment_method_id: paymentDetails.payment_method_id, // Pour Stripe
      card_number: paymentDetails.card_number, // Pour CMI
      card_expiry: paymentDetails.card_expiry,
      card_cvv: paymentDetails.card_cvv,
      auto_renew: paymentDetails.auto_renew || false
    });
    return response.data;
  },
  
  // Annuler l'abonnement
  cancel: async () => {
    const response = await api.post('/subscription/cancel');
    return response.data;
  },
};