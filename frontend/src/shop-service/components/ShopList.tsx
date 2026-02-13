'use client';

import { useEffect, useState } from 'react';
import { ShopService } from '../services/shop.service';
import { Shop, ShopPlan, ShopStatus, UpdateShopRequest } from '../models/Shop';
import { useForm } from 'react-hook-form';

export default function ShopList() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [editingShop, setEditingShop] = useState<Shop | null>(null);

    const { register, handleSubmit, reset } = useForm<UpdateShopRequest>();

    const fetchShops = async () => {
        try {
            const data = await ShopService.getAllShops(page);
            setShops(data.content);
        } catch (err) {
            console.error(err);
            setError('Failed to load shops');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, [page]);

    const handleEditClick = (shop: Shop) => {
        setEditingShop(shop);
        reset({
            name: shop.name,
            phone: shop.phone,
            plan: shop.plan
        });
    };

    const handleUpdate = async (data: UpdateShopRequest) => {
        if (!editingShop) return;
        try {
            await ShopService.updateShop(editingShop.shopId, data);
            setEditingShop(null);
            fetchShops();
        } catch (err) {
            console.error(err);
            alert('Failed to update shop');
        }
    };

    const handleStatusChange = async (shopId: string, currentStatus: ShopStatus) => {
        const newStatus = currentStatus === ShopStatus.ACTIVE ? ShopStatus.SUSPENDED : ShopStatus.ACTIVE;
        if (confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            try {
                await ShopService.updateShopStatus(shopId, newStatus);
                fetchShops();
            } catch (err) {
                console.error(err);
                alert('Failed to update status');
            }
        }
    }

    return (
        <div className="bg-white shadow rounded p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Shops</h2>
                <button onClick={fetchShops} className="text-sm text-indigo-600 hover:text-indigo-800">Refresh</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {shops.map((shop) => (
                                <tr key={shop.shopId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shop.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shop.plan}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={() => handleStatusChange(shop.shopId, shop.status)}
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${shop.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                            {shop.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium">
                                        <button onClick={() => handleEditClick(shop)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editingShop && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Edit Shop</h3>
                        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
                            <div>
                                <label className="block text-sm">Name</label>
                                <input {...register('name')} className="border w-full p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-sm">Phone</label>
                                <input {...register('phone')} className="border w-full p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-sm">Plan</label>
                                <select {...register('plan')} className="border w-full p-2 rounded">
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
        </div>
    );
}
