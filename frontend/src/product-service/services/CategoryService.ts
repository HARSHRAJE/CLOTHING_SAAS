import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/Category';
import { productApi } from './productApi';

export const CategoryService = {
    getAllCategories: async (): Promise<Category[]> => {
        const response = await productApi.get<Category[]>('/products/categories');
        return response.data;
    },

    createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
        const response = await productApi.post<Category>('/products/categories', data);
        return response.data;
    },

    updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
        const response = await productApi.put<Category>(`/products/categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: string): Promise<void> => {
        await productApi.delete(`/products/categories/${id}`);
    }
};
