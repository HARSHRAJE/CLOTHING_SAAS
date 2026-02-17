
export enum InquiryStatus {
    NEW = 'NEW',
    CONTACTED = 'CONTACTED',
    CLOSED = 'CLOSED'
}

export interface Inquiry {
    inquiryId: string;
    shopId: string;
    customerName: string;
    phone: string;
    email?: string;
    productId?: string;
    message?: string;
    status: InquiryStatus;
    createdAt: string;
}
