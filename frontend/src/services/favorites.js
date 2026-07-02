import api from './api';

export const favoritesService = {
  // Liste des annonces favorites de l'utilisateur connecté
  list: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  // Ajoute/retire une annonce des favoris → { favorited: boolean }
  toggle: async (listingId) => {
    const response = await api.post(`/listings/${listingId}/favorite`);
    return response.data;
  },
};
