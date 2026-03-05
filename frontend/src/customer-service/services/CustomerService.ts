import axios from 'axios';
import { Customer, CustomerAddress } from '../models/Customer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create a specific instance for Customer Service
export const customerApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const CustomerService = {
    getCustomers: async (page: number = 0, size: number = 10, search?: string): Promise<{ content: Customer[], totalElements: number, totalPages: number }> => {
        const params: any = { page, size, sort: 'createdAt,desc' };
        if (search) params.search = search;

        const response = await customerApi.get(`/customers`, { params });
        return response.data;
    },

    getCustomer: async (customerId: string): Promise<Customer> => {
        const response = await customerApi.get(`/customers/${customerId}`);
        return response.data;
    },

    updateCustomer: async (customerId: string, data: { name?: string; email?: string }): Promise<Customer> => {
        const response = await customerApi.put(`/customers/${customerId}`, data);
        return response.data;
    },

    getAddresses: async (customerId: string): Promise<CustomerAddress[]> => {
        const response = await customerApi.get(`/customers/${customerId}/addresses`);
        return response.data;
    }
};
