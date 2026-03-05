import axios from 'axios';

const shopApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

import { CreateShopRequest, Shop, UpdateShopRequest } from '../models/Shop';

export const ShopService = {
  createShop: async (data: CreateShopRequest): Promise<Shop> => {
    const response = await shopApi.post<Shop>('/admin/shops', data);
    return response.data;
  },

  getAllShops: async (page = 0, size = 20): Promise<{ content: Shop[], totalElements: number }> => {
    const response = await shopApi.get(`/admin/shops?page=${page}&size=${size}`);
    return response.data; // Page response structure might differ depending on backend, confusing with content
    // Spring Page: { content: [], pageable: {}, ... }
    // If backend returns Page<ShopResponse>, response.data is that object.
  },

  getShopById: async (shopId: string): Promise<Shop> => {
    const response = await shopApi.get<Shop>(`/admin/shops/${shopId}`);
    return response.data;
  },

  getMyShop: async (): Promise<Shop> => {
    const response = await shopApi.get<Shop>(`/shops/me`);
    return response.data;
  },

  updateShop: async (shopId: string, data: UpdateShopRequest): Promise<Shop> => {
    const response = await shopApi.put<Shop>(`/admin/shops/${shopId}`, data);
    return response.data;
  },

  updateShopStatus: async (shopId: string, status: string): Promise<void> => {
    await shopApi.put(`/admin/shops/${shopId}/status`, { status });
  }
};
