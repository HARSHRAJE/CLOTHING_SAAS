import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '../models/Order';
import { OrderService } from '../services/OrderService';
import { Eye, CheckCircle, Package, Truck, MessageCircle } from 'lucide-react';
import { useAuth } from '../../auth-service/context/AuthContext';
import { ShopService } from '../../shop-service/services/shop.service';
import { sendWhatsAppNotification } from '../../notification-service/client';

const OrderList = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [shopName, setShopName] = useState<string>('Our Store');
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (user?.shopId) {
            ShopService.getMyShop().then(shop => {
                if (shop && shop.name) setShopName(shop.name);
            }).catch(err => console.error("Failed to fetch shop name", err));
        }
    }, [user]);

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

    const handleContact = async (order: Order) => {
        const phone = order.customer.phone;
        if (!phone) {
            alert("Customer phone number is missing");
            return;
        }

        const message = `Hi, welcome from ${shopName}, your order ${order.orderNumber} is placed.`;

        try {
            const response = await sendWhatsAppNotification(phone, message);
            if (response && response.link) {
                window.open(response.link, '_blank');
            } else {
                // Fallback
                const encoded = encodeURIComponent(message);
                window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
            }
        } catch (error: any) {
            console.error("Failed to generate WhatsApp link", error);
            // Fallback on error
            const encoded = encodeURIComponent(message);
            window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
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

    const toggleOrder = (orderId: string) => {
        const newSet = new Set(expandedOrders);
        if (newSet.has(orderId)) newSet.delete(orderId);
        else newSet.add(orderId);
        setExpandedOrders(newSet);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Orders</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="pb-2">Order #</th>
                            <th className="pb-2">Customer</th>
                            <th className="pb-2">Date</th>
                            <th className="pb-2">Amount</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">Items</th>
                            <th className="pb-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>
                        ) : orders.map(order => (
                            <>
                                <tr key={order.orderId} className={`border-b hover:bg-gray-50 ${expandedOrders.has(order.orderId) ? 'bg-indigo-50/30' : ''}`}>
                                    <td className="py-3 font-mono text-sm">{order.orderNumber}</td>
                                    <td className="py-3">
                                        <Link
                                            href={`/owner/customers/${order.customer.remoteCustomerId}`}
                                            className="font-semibold text-sm hover:text-indigo-600 transition-colors"
                                        >
                                            {order.customer.name}
                                        </Link>
                                        <div className="text-xs text-gray-500">{order.customer.phone}</div>
                                    </td>
                                    <td className="py-3 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 font-semibold text-sm">₹{order.totalAmount}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <button
                                            onClick={() => toggleOrder(order.orderId)}
                                            className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors bg-indigo-50 px-2 py-1 rounded"
                                        >
                                            {expandedOrders.has(order.orderId) ? 'HIDE' : `VIEW (${order.items?.length || 0})`}
                                        </button>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleContact(order)}
                                                className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors" title="Contact on WhatsApp">
                                                <MessageCircle size={18} />
                                            </button>

                                            {order.status === OrderStatus.PENDING && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.orderId, OrderStatus.CONFIRMED)}
                                                    className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors" title="Confirm">
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            {order.status === OrderStatus.CONFIRMED && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.orderId, OrderStatus.SHIPPED)}
                                                    className="p-1 hover:bg-purple-100 rounded text-purple-600 transition-colors" title="Ship">
                                                    <Package size={18} />
                                                </button>
                                            )}
                                            {order.status === OrderStatus.SHIPPED && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.orderId, OrderStatus.DELIVERED)}
                                                    className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors" title="Deliver">
                                                    <Truck size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {expandedOrders.has(order.orderId) && (
                                    <tr className="bg-gray-50/50">
                                        <td colSpan={7} className="px-6 py-4 border-b">
                                            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Order Composition</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {order.items?.map(item => (
                                                        <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center shadow-sm">
                                                            <div className="flex-1 min-w-0 pr-3">
                                                                <div className="font-bold text-gray-900 text-xs truncate uppercase tracking-tight">{item.productName}</div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">SIZE: {item.size || 'N/A'}</span>
                                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">COLOR: {item.color || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right shrink-0 border-l border-gray-50 pl-3">
                                                                <div className="text-xs font-black text-indigo-600">x{item.quantity}</div>
                                                                <div className="text-[10px] text-gray-400 font-mono">₹{item.price}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {order.address && (
                                                    <div className="mt-4 p-3 bg-white rounded-lg border border-dashed border-gray-200">
                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping Address</div>
                                                        <div className="text-xs text-gray-700 leading-relaxed font-medium">{order.address}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex justify-between items-center border-t pt-4">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-600 rounded-lg disabled:opacity-30 hover:bg-gray-200 transition-colors">
                    Previous
                </button>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Page {page + 1} of {totalPages}</span>
                <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-600 rounded-lg disabled:opacity-30 hover:bg-gray-200 transition-colors">
                    Next
                </button>
            </div>
        </div>
    );
};

export default OrderList;
