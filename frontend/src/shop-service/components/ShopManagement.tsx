'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ShopService } from '../services/shop.service';
import { ShopPlan } from '../models/Shop';

export default function ShopManagement({ onShopCreated }: { onShopCreated?: (id: string) => void }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const onSubmit = async (data: any) => {
        setSuccessMsg('');
        setErrorMsg('');
        try {
            const shop = await ShopService.createShop({
                ...data,
            });
            setSuccessMsg(`Shop created successfully! Shop ID: ${shop.shopId}`);
            if (onShopCreated) onShopCreated(shop.shopId);
            reset();
        } catch (error: any) {
            console.error(error);
            setErrorMsg('Failed to create shop.');
        }
    };

    return (
        <div className="bg-white shadow rounded p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Create New Shop</h2>

            {successMsg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMsg}</div>}
            {errorMsg && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{errorMsg}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                    <input {...register('name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    {errors.name && <span className="text-red-500 text-sm">Required</span>}
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <input {...register('slug', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    {errors.slug && <span className="text-red-500 text-sm">Required</span>}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input {...register('phone', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    {errors.phone && <span className="text-red-500 text-sm">Required</span>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" {...register('email', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    {errors.email && <span className="text-red-500 text-sm">Required</span>}
                </div>

                {/* Plan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Plan</label>
                    <select {...register('plan', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                        <option value={ShopPlan.FREE}>Free</option>
                        <option value={ShopPlan.PRO}>Pro</option>
                        <option value={ShopPlan.ENTERPRISE}>Enterprise</option>
                    </select>
                </div>

                {/* Dates */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Sub Start Date</label>
                    <input type="date" {...register('subscriptionStartDate', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Sub End Date</label>
                    <input type="date" {...register('subscriptionEndDate', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>

                <div className="md:col-span-2">
                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Create Shop
                    </button>
                </div>
            </form>
        </div>
    );
}
