'use client';

import { useEffect, useState } from 'react';
import { AuthService } from '../services/auth.service';
import { User, UpdateUserRequest } from '../models/User';
import { useForm } from 'react-hook-form';

export default function OwnerList() {
    const [owners, setOwners] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingOwner, setEditingOwner] = useState<User | null>(null);

    const { register, handleSubmit, reset } = useForm<UpdateUserRequest>();

    const fetchOwners = async () => {
        try {
            const data = await AuthService.getAllOwners();
            setOwners(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load owners');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOwners();
    }, []);

    const handleEditClick = (owner: User) => {
        setEditingOwner(owner);
        reset({
            email: owner.email,
            shopId: owner.shopId
        });
    };

    const handleUpdate = async (data: UpdateUserRequest) => {
        if (!editingOwner) return;
        try {
            await AuthService.updateUser(editingOwner.userId, data);
            setEditingOwner(null);
            fetchOwners();
        } catch (err) {
            console.error(err);
            alert('Failed to update owner');
        }
    };

    const handleStatusChange = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        if (confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            try {
                await AuthService.updateUserStatus(userId, newStatus);
                fetchOwners();
            } catch (err) {
                console.error(err);
                alert('Failed to update status');
            }
        }
    }

    return (
        <div className="bg-white shadow rounded p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Shop Owners</h2>
                <button onClick={fetchOwners} className="text-sm text-indigo-600 hover:text-indigo-800">Refresh</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {owners.map((owner) => (
                                <tr key={owner.userId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{owner.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={() => handleStatusChange(owner.userId, owner.status ?? 'DISABLED')}
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${owner.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                            {owner.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{owner.shopId || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium">
                                        <button onClick={() => handleEditClick(owner)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {owners.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No owners found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {editingOwner && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Edit Owner</h3>
                        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
                            <div>
                                <label className="block text-sm">Email</label>
                                <input {...register('email')} className="border w-full p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-sm">Shop ID</label>
                                <input {...register('shopId')} className="border w-full p-2 rounded" />
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
    );
}
