export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    SHOP_OWNER = 'OWNER',
    CUSTOMER = 'CUSTOMER',
    STAFF = 'STAFF'
}

export interface User {
    userId: string;
    email: string;
    role: Role;
    shopId?: string;
    status?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface CreateUserRequest {
    shopId?: string;
    email: string;
    password?: string;
    role?: Role;
}

export interface UpdateUserRequest {
    email?: string;
    shopId?: string;
    status?: string;
}

export interface LoginResponse {
    accessToken: string;
    userId: string;
    role: Role;
    shopId?: string;
}
