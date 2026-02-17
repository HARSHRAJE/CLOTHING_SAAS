export enum InventoryTransactionType {
    SALE = 'SALE',
    RESTOCK = 'RESTOCK',
    RETURN = 'RETURN',
    MANUAL = 'MANUAL',
    ADJUSTMENT = 'ADJUSTMENT'
}

export interface InventoryHistoryResponse {
    id: string;
    quantityChange: number;
    type: InventoryTransactionType;
    referenceId?: string;
    createdAt: string;
}

export interface StockUpdateRequest {
    quantityChange: number;
    type: InventoryTransactionType;
    referenceId?: string;
}
