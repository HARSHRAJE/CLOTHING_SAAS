import api from '@/common/config/api';
import { LoginRequest, LoginResponse, User } from '../models/User';

export const AuthService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  createUser: async (data: any): Promise<User> => {
    const response = await api.post<User>('/auth/admin/users', data);
    return response.data;
  },

  getUsersByShop: async (shopId: string): Promise<User[]> => {
    const response = await api.get<User[]>(`/auth/admin/users?shopId=${shopId}`);
    return response.data;
  },

  getAllOwners: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/auth/admin/users');
    return response.data;
  },

  updateUserStatus: async (userId: string, status: string): Promise<void> => {
    await api.put(`/auth/admin/users/${userId}/status`, { status });
  },

  updateUser: async (userId: string, data: any): Promise<User> => {
    const response = await api.put<User>(`/auth/admin/users/${userId}`, data);
    return response.data;
  }
};
