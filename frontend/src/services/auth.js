import axios from 'axios';
import api from './api';

export const authService = {
    // Récupérer le token CSRF
    getCsrfToken: async () => {
        const response = await axios.get('http://localhost:8000/api/csrf-token', {
            // withCredentials: true,
        });
        return response.data;
    },

    register: async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    verify2FA: async (twoFactorToken, code) => {
        const response = await api.post('/auth/verify-2fa', {
            two_factor_token: twoFactorToken,
            code
        });
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    },

    

    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.post('/auth/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    uploadIdDocument: async (file, documentType) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('document_type', documentType);
        const response = await api.post('/auth/id-document', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    // Ajouter dans l'objet authService:

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, password, passwordConfirmation) => {
        const response = await api.post('/auth/reset-password', {
            token,
            password,
            password_confirmation: passwordConfirmation,
        });
        return response.data;
    },

    verifyEmail: async (code) => {
        const response = await api.post('/auth/verify-email', { code });
        return response.data;
    },

    verifyPhone: async (code) => {
        const response = await api.post('/auth/verify-phone', { code });
        return response.data;
    },

    resendVerification: async () => {
        const response = await api.post('/auth/resend-verification');
        return response.data;
    },

    enable2FA: async () => {
        const response = await api.post('/auth/enable-2fa');
        return response.data;
    },

    disable2FA: async () => {
        const response = await api.post('/auth/disable-2fa');
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },

};