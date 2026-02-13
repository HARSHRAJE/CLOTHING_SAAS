'use client';

import { useEffect, useState } from 'react';
import { ShopService } from '../services/shop.service';
import { AuthService } from '@/auth-service/services/auth.service';
import { Shop, ShopPlan, ShopStatus, UpdateShopRequest } from '../models/Shop'; // Correct import path for Shop models
import { User, UpdateUserRequest } from '@/auth-service/models/User'; // Correct import path for User models
import { useForm } from 'react-hook-form';
import DashboardStats from './DashboardStats';

interface CombinedData {
    shop: Shop;
    owner?: User;
}

export default function UnifiedShopTable() {
    const [combinedData, setCombinedData] = useState<CombinedData[]>([]);
    const [filteredData, setFilteredData] = useState<CombinedData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ShopStatus | 'ALL'>('ALL');

    // Stats Data (derived from full data)
    const [shopsForStats, setShopsForStats] = useState<Shop[]>([]);
    const [ownersForStats, setOwnersForStats] = useState<User[]>([]);

    // Editing States
    const [editingShop, setEditingShop] = useState<Shop | null>(null);
    const [editingOwner, setEditingOwner] = useState<User | null>(null);

    // Forms
    const { register: registerShop, handleSubmit: handleSubmitShop, reset: resetShop } = useForm<UpdateShopRequest>();
    const { register: registerOwner, handleSubmit: handleSubmitOwner, reset: resetOwner } = useForm<UpdateUserRequest>();

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Shops
            const shopData = await ShopService.getAllShops(page);
            const shops = shopData.content;

            // 2. Fetch All Owners (Optimization: In real app, fetch by list of IDs or rely on backend aggregation)
            const owners = await AuthService.getAllOwners();

            // 3. Merge Data
            const merged: CombinedData[] = shops.map(shop => {
                const owner = owners.find(u => u.shopId === shop.shopId);
                return { shop, owner };
            });

            setCombinedData(merged);
            setFilteredData(merged);
            setShopsForStats(shops);
            setOwnersForStats(owners);

        } catch (err) {
            console.error(err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    // --- Shop Actions ---

    const handleShopEditClick = (shop: Shop) => {
        setEditingShop(shop);
        resetShop({
            name: shop.name,
            phone: shop.phone,
            plan: shop.plan
        });
    };

    const handleShopUpdate = async (data: UpdateShopRequest) => {
        if (!editingShop) return;
        try {
            await ShopService.updateShop(editingShop.shopId, data);
            setEditingShop(null);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to update shop');
        }
    };

    const handleShopStatusChange = async (shopId: string, currentStatus: ShopStatus) => {
        const newStatus = currentStatus === ShopStatus.ACTIVE ? ShopStatus.SUSPENDED : ShopStatus.ACTIVE;
        if (confirm(`Change SHOP status to ${newStatus}?`)) {
            try {
                await ShopService.updateShopStatus(shopId, newStatus);
                fetchData();
            } catch (err) {
                console.error(err);
                alert('Failed to update shop status');
            }
        }
    };

    // --- Owner Actions ---

    const handleOwnerEditClick = (owner: User) => {
        setEditingOwner(owner);
        resetOwner({
            email: owner.email,
            shopId: owner.shopId
        });
    };

    const handleOwnerUpdate = async (data: UpdateUserRequest) => {
        if (!editingOwner) return;
        try {
            await AuthService.updateUser(editingOwner.userId, data);
            setEditingOwner(null);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to update owner');
        }
    };

    const handleOwnerStatusChange = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        if (confirm(`Change OWNER status to ${newStatus}?`)) {
            try {
                await AuthService.updateUserStatus(userId, newStatus);
                fetchData();
            } catch (err) {
                console.error(err);
                alert('Failed to update owner status');
            }
        }
    };


    useEffect(() => {
        let result = combinedData;

        // Filter by Status
        if (statusFilter !== 'ALL') {
            result = result.filter(item => item.shop.status === statusFilter);
        }

        // Filter by Search Term (Name or Email)
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.shop.name.toLowerCase().includes(lowerTerm) ||
                (item.owner?.email.toLowerCase().includes(lowerTerm))
            );
        }

        setFilteredData(result);
    }, [combinedData, searchTerm, statusFilter]);


    return (
        <div className="mt-6">
            <DashboardStats shops={shopsForStats} owners={ownersForStats} />

            <div className="bg-white shadow rounded p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Shops & Owners</h2>
                    <div className="flex gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search shops or owners..."
                                className="border rounded p-2 pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <select
                            className="border rounded p-2"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ShopStatus | 'ALL')}
                        >
                            <option value="ALL">All Status</option>
                            <option value={ShopStatus.ACTIVE}>Active</option>
                            <option value={ShopStatus.SUSPENDED}>Suspended</option>
                        </select>
                        <button onClick={fetchData} className="text-sm text-indigo-600 hover:text-indigo-800">Refresh</button>
                    </div>
                </div>

                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map(({ shop, owner }) => (
                                    <tr key={shop.shopId}>
                                        {/* Shop Info */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shop.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shop.plan}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                onClick={() => handleShopStatusChange(shop.shopId, shop.status)}
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${shop.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                title="Click to toggle Shop Status"
                                            >
                                                {shop.status}
                                            </button>
                                        </td>

                                        {/* Owner Info */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {owner ? owner.email : <span className="text-gray-400 italic">No Owner</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {owner ? (
                                                <button
                                                    onClick={() => handleOwnerStatusChange(owner.userId, owner.status)}
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${owner.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                                                    title="Click to toggle Owner Status"
                                                >
                                                    {owner.status}
                                                </button>
                                            ) : '-'}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleShopEditClick(shop)} className="text-indigo-600 hover:text-indigo-900">Edit Shop</button>
                                                {owner && (
                                                    <button onClick={() => handleOwnerEditClick(owner)} className="text-blue-600 hover:text-blue-900">Edit Owner</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No shops found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Shop Edit Modal */}
                {editingShop && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                        <div className="bg-white p-5 rounded-lg shadow-xl w-96">
                            <h3 className="text-lg font-bold mb-4">Edit Shop</h3>
                            <form onSubmit={handleSubmitShop(handleShopUpdate)} className="space-y-4">
                                <div>
                                    <label className="block text-sm">Name</label>
                                    <input {...registerShop('name')} className="border w-full p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm">Phone</label>
                                    <input {...registerShop('phone')} className="border w-full p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm">Plan</label>
                                    <select {...registerShop('plan')} className="border w-full p-2 rounded">
                                        <option value={ShopPlan.FREE}>Free</option>
                                        <option value={ShopPlan.PRO}>Pro</option>
                                        <option value={ShopPlan.ENTERPRISE}>Enterprise</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setEditingShop(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Owner Edit Modal */}
                {editingOwner && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                        <div className="bg-white p-5 rounded-lg shadow-xl w-96">
                            <h3 className="text-lg font-bold mb-4">Edit Owner</h3>
                            <form onSubmit={handleSubmitOwner(handleOwnerUpdate)} className="space-y-4">
                                <div>
                                    <label className="block text-sm">Email</label>
                                    <input {...registerOwner('email')} className="border w-full p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm">Shop ID</label>
                                    <input {...registerOwner('shopId')} className="border w-full p-2 rounded" />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setEditingOwner(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
