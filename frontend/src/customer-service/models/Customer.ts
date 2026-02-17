export interface Customer {
    customerId: string;
    name: string;
    phone: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    createdAt: string;
    defaultAddress?: string;
}

export interface CustomerAddress {
    id: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}
