'use client';

import { useAuth } from '@/auth-service/context/AuthContext';
import { Role } from '@/auth-service/models/User';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserManagement from '@/auth-service/components/UserManagement';
import ShopManagement from '@/shop-service/components/ShopManagement';
import UnifiedShopTable from '@/shop-service/components/UnifiedShopTable';

export default function AdminDashboard() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [createdShopId, setCreatedShopId] = useState<string>('');

    useEffect(() => {
        if (!isLoading && (!user || user.role !== Role.SUPER_ADMIN)) {
            // Double check protection, though middleware/HOC is better
            if (!user) router.push('/login');
            else router.push('/');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) return <div>Loading...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
            <div className="bg-white shadow rounded p-6">
                <h2 className="text-xl font-semibold mb-4">Welcome, Super Admin</h2>
                <p>User ID: {user.userId}</p>
                <p>Email: {user.email}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <ShopManagement onShopCreated={setCreatedShopId} />
                <UserManagement prefilledShopId={createdShopId} />
            </div>

            <UnifiedShopTable />
        </div>
    );
}
