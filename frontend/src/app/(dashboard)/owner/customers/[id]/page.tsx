'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Customer } from '../../../../../customer-service/models/Customer';
import { CustomerService } from '../../../../../customer-service/services/CustomerService';
import { OrderService } from '../../../../../order-service/services/OrderService';
import { Order } from '../../../../../order-service/models/Order';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, ShoppingBag, CreditCard, Award, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function CustomerDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [custData, ordersData] = await Promise.all([
                CustomerService.getCustomer(id as string),
                OrderService.getOrdersByCustomerId(id as string)
            ]);
            setCustomer(custData);
            setOrders(ordersData.content);
        } catch (error) {
            console.error('Failed to fetch customer data', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOrder = (orderId: string) => {
        const newSet = new Set(expandedOrders);
        if (newSet.has(orderId)) newSet.delete(orderId);
        else newSet.add(orderId);
        setExpandedOrders(newSet);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="p-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Customer not found</h2>
                <p className="text-gray-500 mb-6">We couldn't find any details for this customer ID.</p>
                <button onClick={() => router.back()} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-indigo-700 transition-colors">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-8 group transition-all">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 group-hover:border-indigo-100 transition-all">
                    <ArrowLeft size={18} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Back to Customers</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-indigo-600 h-28 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/50 to-purple-600/50"></div>
                        </div>
                        <div className="px-8 pb-8 text-center -mt-14 relative z-10">
                            <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-3xl border-4 border-white shadow-xl mb-4 bg-gray-50 uppercase text-4xl font-black text-indigo-600 transform -rotate-3 group hover:rotate-0 transition-transform duration-300">
                                {customer.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{customer.name}</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Registered {new Date(customer.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>

                            <div className="space-y-4 text-left border-t border-gray-50 pt-8">
                                <div className="flex items-center gap-4 group">
                                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <Phone size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">{customer.phone}</span>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 truncate">{customer.email || 'NO EMAIL PROVIDED'}</span>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors mt-0.5">
                                        <MapPin size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 leading-relaxed uppercase tracking-tight">{customer.defaultAddress || 'NO PRIMARY ADDRESS'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-emerald-200 transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Total Orders</div>
                                    <div className="text-2xl font-black text-gray-900 tracking-tighter">{customer.totalOrders}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Customer LTV</div>
                                    <div className="text-2xl font-black text-gray-900 tracking-tighter">₹{customer.totalSpent.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-amber-200 transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="bg-amber-50 p-4 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Reward Points</div>
                                    <div className="text-2xl font-black text-gray-900 tracking-tighter">{customer.loyaltyPoints}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders History Component */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Order Timeline</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Detailed history of transactions</p>
                            </div>
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-indigo-100 uppercase tracking-widest">{orders.length} Records</span>
                        </div>

                        {orders.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBag size={32} className="text-gray-200" />
                                </div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No order history found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {orders.map(order => (
                                    <div key={order.orderId} className={`p-8 hover:bg-gray-50/50 transition-all duration-300 ${expandedOrders.has(order.orderId) ? 'bg-indigo-50/20' : ''}`}>
                                        <div className="flex flex-wrap items-center justify-between gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-gray-600 transform rotate-3">
                                                    <ShoppingBag size={22} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900 text-sm tracking-tight">{order.orderNumber}</div>
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <div className="text-lg font-black text-gray-900 tracking-tighter">₹{order.totalAmount.toLocaleString()}</div>
                                                    <div className="text-[9px] uppercase font-black text-indigo-500 tracking-widest">{order.items?.length || 0} ITEM{order.items?.length !== 1 ? 'S' : ''}</div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                            order.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleOrder(order.orderId)}
                                                        className={`p-2 rounded-xl transition-all duration-300 ${expandedOrders.has(order.orderId)
                                                                ? 'bg-indigo-600 text-white shadow-lg rotate-180'
                                                                : 'bg-white text-gray-400 border border-gray-100 hover:border-indigo-100 hover:text-indigo-600'
                                                            }`}
                                                    >
                                                        <ChevronDown size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {expandedOrders.has(order.orderId) && (
                                            <div className="mt-8 pt-8 border-t border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Line Items Breakdown</div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {order.items?.map(item => (
                                                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm hover:border-indigo-100 transition-colors">
                                                            <div className="flex-1 min-w-0 pr-4">
                                                                <div className="font-black text-gray-900 text-xs truncate uppercase tracking-tight">{item.productName}</div>
                                                                <div className="flex items-center gap-3 mt-2">
                                                                    <span className="text-[9px] bg-gray-50 text-gray-500 px-2 py-1 rounded-md font-black uppercase tracking-widest">S: {item.size}</span>
                                                                    <span className="text-[9px] bg-gray-50 text-gray-500 px-2 py-1 rounded-md font-black uppercase tracking-widest">C: {item.color}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right shrink-0 border-l border-gray-50 pl-4">
                                                                <div className="text-sm font-black text-indigo-600">x{item.quantity}</div>
                                                                <div className="text-[10px] text-gray-400 font-black">₹{item.price}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {order.address && (
                                                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 shadow-sm inline-block bg-white px-2 py-0.5 rounded-full">Shipping Address</div>
                                                        <div className="text-xs text-gray-600 leading-relaxed font-bold mt-2 uppercase tracking-tight">{order.address}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
