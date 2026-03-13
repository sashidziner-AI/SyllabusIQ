import api from './api';
import type { TokenResponse, User, RegisterRequest } from '../types/auth';

export const authService = {
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const form = new FormData();
    form.append('username', email);
    form.append('password', password);
    const { data } = await api.post<TokenResponse>('/auth/login', form);
    return data;
  },

  register: async (req: RegisterRequest): Promise<User> => {
    const { data } = await api.post<User>('/auth/register', req);
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  updateProfile: async (update: { full_name?: string; avatar_url?: string }): Promise<User> => {
    const { data } = await api.put<User>('/auth/me', update);
    return data;
  },

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const { data } = await api.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },

  getGoogleAuthUrl: async (): Promise<string> => {
    const { data } = await api.get<{ url: string }>('/auth/google');
    return data.url;
  },
};
