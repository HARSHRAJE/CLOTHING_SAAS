import { Category } from './Category';
import { ProductVariant } from './Variant';

export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ARCHIVED = 'ARCHIVED'
}

export interface Product {
    id: string;
    shopId: string;
    category?: Category;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    status: ProductStatus;
    variants?: ProductVariant[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductRequest {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
}

export interface UpdateProductRequest {
    categoryId?: string;
    name?: string;
    description?: string;
    price?: number;
    costPrice?: number;
}
