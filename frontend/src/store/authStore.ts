import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,

  setAuth: (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        set({
          user: response.data,
          token,
          isAuthenticated: true,
          isAdmin: response.data.role === 'ADMIN',
          isLoading: false,
        });
      } else {
        get().logout();
      }
    } catch {
      get().logout();
    }
  },

  login: async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.data) {
      get().setAuth(response.data.user, response.data.token);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  },

  adminLogin: async (email: string, password: string) => {
    const response = await authApi.adminLogin({ email, password });
    if (response.success && response.data) {
      get().setAuth(response.data.user, response.data.token);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  },

  register: async (data: { email: string; password: string; name: string; phone?: string }) => {
    const response = await authApi.register(data);
    if (response.success && response.data) {
      get().setAuth(response.data.user, response.data.token);
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  },
}));
