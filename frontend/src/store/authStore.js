import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      twoFactorToken: null,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(email, password);

          if (response.requires_2fa) {
            set({ twoFactorToken: response.two_factor_token, isLoading: false });
            return { requires2FA: true, twoFactorToken: response.two_factor_token };
          }

          localStorage.setItem('token', response.token);
          set({ user: response.user, token: response.token, isLoading: false, twoFactorToken: null });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      verify2FA: async (code) => {
        const { twoFactorToken } = get();
        if (!twoFactorToken) throw new Error('No 2FA token');

        set({ isLoading: true });
        try {
          const response = await authService.verify2FA(twoFactorToken, code);
          localStorage.setItem('token', response.token);
          set({ user: response.user, token: response.token, isLoading: false, twoFactorToken: null });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        localStorage.removeItem('token');
        set({ user: null, token: null, twoFactorToken: null });
      },

      setUser: (user) => set({ user }),
      setTwoFactorToken: (token) => set({ twoFactorToken: token }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        role: state.user?.role
      }),
    }
  )
);