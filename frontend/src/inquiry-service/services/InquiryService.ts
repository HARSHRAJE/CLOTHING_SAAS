import axios from 'axios';
import { Inquiry, InquiryStatus } from '../models/Inquiry';

const API_URL = 'http://localhost:8080';

export const inquiryApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

inquiryApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add Shop ID specific for Owner operations
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

        // Fallback: Decode Token if Shop ID missing
        if (!config.headers['X-Shop-Id'] && token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const jwt = JSON.parse(jsonPayload);
                if (jwt.shopId) {
                    config.headers['X-Shop-Id'] = jwt.shopId;
                }
            } catch (e) {
                console.error("Failed to decode token for shopId", e);
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
