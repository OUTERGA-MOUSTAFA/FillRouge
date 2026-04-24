import api from './api';

export const slidersService = {
  // Récupérer tous les sliders (admin)
  getAll: async () => {
    const response = await api.get('/admin/sliders');
    return response.data;  // { success: true, data: [...] }
  },

  // Récupérer les sliders actifs (public)
  getActive: async () => {
    const response = await api.get('/auth/sliders');
    return response.data;
  },

  // Créer un slider
  create: async (formData) => {

    // rebuilding= Rebuilds FormData from fd as object → image lost
    // const formData = new FormData();
    // formData.append('title', data.title);
    // if (data.subtitle) formData.append('subtitle', data.subtitle);
    // if (data.image && data.image instanceof File) formData.append('image', data.image);
    // if (data.button_text) formData.append('button_text', data.button_text);
    // if (data.button_link) formData.append('button_link', data.button_link);
    // if (data.order !== undefined) formData.append('order', data.order);
 // pass fd=formData directly
    const isFormData = formData instanceof FormData;

    if (!isFormData) {
      // Plain object (e.g. { is_active: true } from handleToggleStatus)
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined && val !== null) fd.append(key, val);
      });
      fd.append('_method', 'PUT');
      formData = fd;
    }

    const response = await api.post('/admin/sliders', formData);
    return response.data;
  },

  // Mettre à jour un slider
  update: async (id, formData) => {
    // const formData = new FormData();
    // if (data.title) formData.append('title', data.title);
    // if (data.subtitle) formData.append('subtitle', data.subtitle);
    // if (data.image && data.image instanceof File) formData.append('image', data.image);
    // if (data.button_text) formData.append('button_text', data.button_text);
    // if (data.button_link) formData.append('button_link', data.button_link);
    // if (data.order !== undefined) formData.append('order', data.order);
    // if (data.is_active !== undefined) formData.append('is_active', data.is_active);
    // formData.append('_method', 'PUT');

    const response = await api.post(`/admin/sliders/${id}`, formData);
    return response.data;
  },

  // Supprimer un slider
  delete: async (id) => {
    const response = await api.delete(`/admin/sliders/${id}`);
    return response.data;
  },

  // (optionnel) toggle
  toggleStatus: async (id, isActive) => {
    const response = await api.put(`/admin/sliders/${id}`, { is_active: isActive });
    return response.data;
  },
};