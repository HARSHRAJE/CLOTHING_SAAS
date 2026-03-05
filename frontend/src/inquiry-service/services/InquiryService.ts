import axios from 'axios';
import { Inquiry, InquiryStatus } from '../models/Inquiry';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const inquiryApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

inquiryApi.interceptors.request.use(
    (config) => {
        // Add Shop ID from localStorage user for Owner operations
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.shopId) {
                    config.headers['X-Shop-Id'] = user.shopId;
                }
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const InquiryService = {
    getInquiries: async (page: number = 0, size: number = 20, status?: InquiryStatus, phone?: string): Promise<{ content: Inquiry[], totalElements: number, totalPages: number }> => {
        const params: any = { page, size, sort: 'createdAt,desc' };
        if (status) params.status = status;
        if (phone) params.phone = phone;

        const response = await inquiryApi.get(`/inquiries`, { params });
        return response.data;
    },

    getInquiry: async (inquiryId: string): Promise<Inquiry> => {
        const response = await inquiryApi.get(`/inquiries/${inquiryId}`);
        return response.data;
    },

    updateStatus: async (inquiryId: string, status: InquiryStatus): Promise<Inquiry> => {
        const response = await inquiryApi.put(`/inquiries/${inquiryId}/status`, { status });
        return response.data;
    },

    deleteInquiry: async (inquiryId: string): Promise<void> => {
        await inquiryApi.delete(`/inquiries/${inquiryId}`);
    }
};
