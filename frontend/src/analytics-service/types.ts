export interface DailyMetric {
    date: string;
    ordersCount: number;
    revenue: number;
    newCustomers: number;
    inquiriesCount: number;
    productsAdded: number;
}

export interface ProductMetric {
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
}

export interface DashboardSummary {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    dailyMetrics: DailyMetric[]; // For charts
    topProducts: ProductMetric[];
}
