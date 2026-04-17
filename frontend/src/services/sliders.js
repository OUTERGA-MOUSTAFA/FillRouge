import api from './api';

export const slidersService = {
  // Récupérer tous les sliders (admin) - VERSION CORRIGÉE
  getAll: async () => {
    try {
      const response = await api.get('/admin/sliders');
      // La réponse de ton API Laravel est: { success: true, data: [...] }
      if (response.data && response.data.success) {
        return response.data.data; // Retourne directement le tableau
      }
      return response.data || [];
    } catch (error) {
      console.error('Erreur API getAll:', error);
      throw error;
    }
  },
  
  // Récupérer les sliders actifs (public)
  getActive: async () => {
    try {
      const response = await api.get('/auth/sliders'); // Note: c'est /auth/sliders
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Erreur API getActive:', error);
      throw error;
    }
  },
  
  // Créer un slider
  create: async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    if (data.image) formData.append('image', data.image);
    if (data.button_text) formData.append('button_text', data.button_text);
    if (data.button_link) formData.append('button_link', data.button_link);
    if (data.order) formData.append('order', data.order);
    
    const response = await api.post('/admin/sliders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // Mettre à jour un slider
  update: async (id, data) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    if (data.image && data.image instanceof File) formData.append('image', data.image);
    if (data.button_text) formData.append('button_text', data.button_text);
    if (data.button_link) formData.append('button_link', data.button_link);
    if (data.order !== undefined) formData.append('order', data.order);
    if (data.is_active !== undefined) formData.append('is_active', data.is_active);
    formData.append('_method', 'PUT');
    
    const response = await api.post(`/admin/sliders/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // Supprimer un slider
  delete: async (id) => {
    const response = await api.delete(`/admin/sliders/${id}`);
    return response.data;
  },
  
  // Activer/Désactiver un slider
  toggleStatus: async (id, isActive) => {
    const response = await api.put(`/admin/sliders/${id}`, { is_active: isActive });
    return response.data;
  },
};