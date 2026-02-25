import { orderApi } from './orderApi';
import { Order, OrderStatus } from '../models/Order';

export const OrderService = {
    getOrders: async (page: number = 0, size: number = 10): Promise<{ content: Order[], totalElements: number, totalPages: number }> => {
        const response = await orderApi.get(`/orders`, {
            params: { page, size, sort: 'createdAt,desc' }
        });
        return response.data;
    },

    getOrderById: async (id: string): Promise<Order> => {
        const response = await orderApi.get(`/orders/${id}`);
        return response.data;
    },

    updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
        const response = await orderApi.put(`/orders/${id}/status`, { status });
        return response.data;
    },

    getOrdersByCustomerId: async (customerId: string, page: number = 0, size: number = 10): Promise<{ content: Order[], totalElements: number, totalPages: number }> => {
        const response = await orderApi.get(`/orders/customer/${customerId}`, {
            params: { page, size, sort: 'createdAt,desc' }
        });
        return response.data;
    }
};
