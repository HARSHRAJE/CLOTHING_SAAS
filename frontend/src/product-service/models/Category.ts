export interface Category {
    id: string;
    shopId: string;
    name: string;
    description?: string;
    targetGender: 'MEN' | 'WOMEN' | 'UNISEX';
    createdAt?: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    targetGender: 'MEN' | 'WOMEN' | 'UNISEX';
}

export interface UpdateCategoryRequest {
    name?: string;
    description?: string;
    targetGender?: 'MEN' | 'WOMEN' | 'UNISEX';
}
