export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED'
}

export enum OrderSource {
    STORE = 'STORE',
    WEBSITE = 'WEBSITE',
    WHATSAPP = 'WHATSAPP'
}

export interface OrderItem {
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface Customer {
    id: string;
    remoteCustomerId: string;
    name: string;
    phone: string;
    email: string;
}

export interface Order {
    orderId: string;
    shopId: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    orderSource: OrderSource;
    totalAmount: number;
    taxAmount: number;
    discountAmount: number;
    customer: Customer;
    items: OrderItem[];
    createdAt: string;
    address?: string;
}
