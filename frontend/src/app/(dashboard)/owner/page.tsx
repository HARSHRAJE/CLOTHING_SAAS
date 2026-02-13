'use client';

import { useAuth } from '@/auth-service/context/AuthContext';
import { Role } from '@/auth-service/models/User';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OwnerDashboard() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || user.role !== Role.SHOP_OWNER)) {
            if (!user) router.push('/login');
            else router.push('/');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) return <div>Loading...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Shop Owner Dashboard</h1>
                <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
            <div className="bg-white shadow rounded p-6">
                <h2 className="text-xl font-semibold mb-4">Welcome, Shop Owner</h2>
                <p>Shop ID: {user.shopId}</p>
                <p>Email: {user.email}</p>
            </div>
            {/* Add Product Management, Analytics components here */}
        </div>
    );
}
