import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '../models/Order';
import { OrderService } from '../services/OrderService';
import { Eye, CheckCircle, Package, Truck } from 'lucide-react';

const OrderList = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await OrderService.getOrders(page);
            setOrders(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: OrderStatus) => {
        try {
            await OrderService.updateOrderStatus(id, newStatus);
            fetchOrders(); // Refresh
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
            case OrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-800';
            case OrderStatus.SHIPPED: return 'bg-purple-100 text-purple-800';
            case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800';
            case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Orders</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="pb-2">Order #</th>
                            <th className="pb-2">Customer</th>
                            <th className="pb-2">Date</th>
                            <th className="pb-2">Amount</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
                        ) : orders.map(order => (
                            <tr key={order.orderId} className="border-b hover:bg-gray-50">
                                <td className="py-3">{order.orderNumber}</td>
                                <td className="py-3">
                                    <div className="font-semibold">
                                        {order.customer.remoteCustomerId ? (
                                            <Link href={`/customers/${order.customer.remoteCustomerId}`} className="text-blue-600 hover:underline">
                                                {order.customer.name}
                                            </Link>
                                        ) : (
                                            <span title="Customer details not available">{order.customer.name}</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">{order.customer.phone}</div>
                                    {order.address && (
                                        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate" title={order.address}>
                                            {order.address}
                                        </div>
                                    )}
                                </td>
                                <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="py-3 font-semibold">₹{order.totalAmount}</td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <div className="flex space-x-2">
                                        {order.status === OrderStatus.PENDING && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.orderId, OrderStatus.CONFIRMED)}
                                                className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Confirm">
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        {order.status === OrderStatus.CONFIRMED && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.orderId, OrderStatus.SHIPPED)}
                                                className="p-1 hover:bg-purple-100 rounded text-purple-600" title="Ship">
                                                <Package size={18} />
                                            </button>
                                        )}
                                        {order.status === OrderStatus.SHIPPED && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.orderId, OrderStatus.DELIVERED)}
                                                className="p-1 hover:bg-green-100 rounded text-green-600" title="Deliver">
                                                <Truck size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination Controls */}
            <div className="mt-4 flex justify-between">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                    Previous
                </button>
                <span>Page {page + 1} of {totalPages}</span>
                <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                    Next
                </button>
            </div>
        </div>
    );
};

export default OrderList;
