"use client";

import { useEffect, useState } from "react";
import { getOwnerDashboardSummary } from "@/analytics-service/client";
import { DashboardSummary } from "@/analytics-service/types";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import { Loader2, TrendingUp, Users, ShoppingBag, IndianRupee } from "lucide-react";
import { ProductService } from "@/product-service/services/ProductService";
import { Product } from "@/product-service/models/Product";

export default function AnalyticsDashboard() {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryResult, productsResult] = await Promise.all([
                    getOwnerDashboardSummary(),
                    ProductService.getProducts(0, 1000)
                ]);
                setData(summaryResult);
                setProducts(productsResult.content);
            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex bg-gray-50 h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!data) {
        return <div className="p-8 text-center text-red-500">Failed to load data.</div>;
    }

    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen space-y-8 w-full min-w-0 overflow-x-hidden">
            <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight truncate">Analytics Dashboard</h1>
                <p className="text-gray-500 mt-1 truncate">Overview of your shop's performance</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                <StatsCard
                    title="Total Revenue"
                    value={`₹${data.totalRevenue.toFixed(2)}`}
                    icon={<IndianRupee className="h-5 w-5 text-white" />}
                    color="bg-green-500"
                />
                <StatsCard
                    title="Total Orders"
                    value={data.totalOrders.toString()}
                    icon={<ShoppingBag className="h-5 w-5 text-white" />}
                    color="bg-blue-500"
                />
                <StatsCard
                    title="Total Customers"
                    value={data.totalCustomers.toString()}
                    icon={<Users className="h-5 w-5 text-white" />}
                    color="bg-purple-500"
                />
                <StatsCard
                    title="Avg. Order Value"
                    value={`₹${(data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0).toFixed(2)}`}
                    icon={<TrendingUp className="h-5 w-5 text-white" />}
                    color="bg-orange-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-8 min-w-0 w-full">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 min-w-0 w-full overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 truncate">Revenue Trend (Last 7 Days)</h2>
                    <div className="h-[250px] sm:h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.dailyMetrics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    stroke="#9CA3AF"
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 min-w-0 w-full overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 truncate">Orders Trend (Last 7 Days)</h2>
                    <div className="h-[250px] sm:h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.dailyMetrics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    stroke="#9CA3AF"
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#F3F4F6' }}
                                />
                                <Bar dataKey="ordersCount" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-w-0 w-full">
                <div className="px-4 sm:px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">Top Selling Products</h2>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3 text-right">Units Sold</th>
                                <th className="px-6 py-3 text-right">Revenue Generated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.topProducts.map((metric) => {
                                const prod = products.find(p => p.id === metric.productId);
                                const displayName = prod?.name || metric.productName;
                                const categoryName = prod?.category?.name || 'Unknown';
                                return (
                                    <tr key={metric.productId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 sm:px-6 py-4 font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-xs">{displayName}</td>
                                        <td className="px-4 sm:px-6 py-4 text-gray-500 whitespace-nowrap">{categoryName}</td>
                                        <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">{metric.unitsSold}</td>
                                        <td className="px-6 py-4 text-right text-green-600 font-medium">₹{metric.revenue.toFixed(2)}</td>
                                    </tr>
                                )
                            })}
                            {data.topProducts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No top products data available yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 min-w-0 w-full overflow-hidden">
            <div className={`p-3 rounded-lg ${color} shadow-md flex-shrink-0`}>
                {icon}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
            </div>
        </div>
    );
}
