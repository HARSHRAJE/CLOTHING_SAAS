export interface ProductVariant {
    id: string;
    productId: string;
    size: string;
    color: string;
    price?: number; // Override base price
    stock: number;
    imageUrls?: string[]; // Ordered gallery URLs (index 0 = hero image)
}

export interface AddVariantRequest {
    size: string;
    color: string;
    price?: number;
    stock: number;
    imageUrls?: string[];
}

export interface UpdateVariantRequest {
    size?: string;
    color?: string;
    price?: number;
    imageUrls?: string[];
}
