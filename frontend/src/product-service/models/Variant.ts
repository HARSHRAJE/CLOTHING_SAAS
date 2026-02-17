export interface ProductVariant {
    id: string;
    productId: string; // Keep this consistent
    size: string;
    color: string;
    price?: number; // Override base price
    stock: number;
}

export interface AddVariantRequest {
    size: string;
    color: string;
    price?: number;
    stock: number;
}
