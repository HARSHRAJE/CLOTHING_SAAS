import { InventoryHistoryResponse, StockUpdateRequest } from '../models/Inventory';
import { CreateProductRequest, Product, ProductStatus, UpdateProductRequest } from '../models/Product';
import { AddVariantRequest, ProductVariant, UpdateVariantRequest } from '../models/Variant';
import { productApi } from './productApi';

export const ProductService = {
    getProducts: async (page = 0, size = 10, status?: ProductStatus): Promise<{ content: Product[], totalElements: number, totalPages: number }> => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (status) params.append('status', status);

        const response = await productApi.get(`/products`, { params });
        return response.data;
    },

    getProduct: async (id: string): Promise<Product> => {
        const response = await productApi.get<Product>(`/products/${id}`);
        return response.data;
    },

    createProduct: async (data: CreateProductRequest): Promise<Product> => {
        const response = await productApi.post<Product>('/products', data);
        return response.data;
    },

    updateProduct: async (id: string, data: UpdateProductRequest): Promise<Product> => {
        const response = await productApi.put<Product>(`/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id: string): Promise<void> => {
        await productApi.delete(`/products/${id}`);
    },

    updateProductStatus: async (id: string, status: ProductStatus): Promise<void> => {
        await productApi.put(`/products/${id}/status`, { status });
    },

    // Variants
    getVariants: async (productId: string): Promise<ProductVariant[]> => {
        const response = await productApi.get<ProductVariant[]>(`/products/${productId}/variants`);
        return response.data;
    },

    addVariant: async (productId: string, data: AddVariantRequest): Promise<ProductVariant> => {
        const response = await productApi.post<ProductVariant>(`/products/${productId}/variants`, data);
        return response.data;
    },

    updateVariant: async (variantId: string, data: UpdateVariantRequest): Promise<ProductVariant> => {
        const response = await productApi.put<ProductVariant>(`/products/variants/${variantId}`, data);
        return response.data;
    },

    // Inventory
    updateStock: async (variantId: string, data: StockUpdateRequest): Promise<void> => {
        await productApi.put(`/products/variants/${variantId}/stock`, data);
    },

    getInventoryHistory: async (variantId: string): Promise<InventoryHistoryResponse[]> => {
        const response = await productApi.get<InventoryHistoryResponse[]>(`/products/variants/${variantId}/inventory`);
        return response.data;
    }
};
