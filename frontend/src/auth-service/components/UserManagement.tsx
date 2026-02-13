'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/User';

export default function UserManagement({ prefilledShopId }: { prefilledShopId?: string }) {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (prefilledShopId) {
            setValue('shopId', prefilledShopId);
        }
    }, [prefilledShopId, setValue]);

    const onSubmit = async (data: any) => {
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await AuthService.createUser({
                ...data,
                role: Role.SHOP_OWNER
            });
            setSuccessMsg('User created successfully and linked to shop!');
            reset();
            // Keep shopId if user wants to create another user for same shop? Or reset?
            // Resetting typically clears everything. If prefilledShopId exists, it might need to re-apply.
            if (prefilledShopId) setValue('shopId', prefilledShopId);
        } catch (error: any) {
            console.error(error);
            setErrorMsg('Failed to create user. Ensure you have permissions.');
        }
    };

    return (
        <div className="bg-white shadow rounded p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Create Shop Owner</h2>

            {successMsg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMsg}</div>}
            {errorMsg && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{errorMsg}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Shop ID</label>
                    <input
                        type="text"
                        {...register('shopId')}
                        placeholder="Enter Shop ID (optional if Super Admin)"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Found from newly created shop: {prefilledShopId || 'None'}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        {...register('email', { required: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                    {errors.email && <span className="text-red-500 text-sm">Email is required</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        {...register('password', { required: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                    {errors.password && <span className="text-red-500 text-sm">Password is required</span>}
                </div>

                <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Create Owner
                </button>
            </form>
        </div>
    );
}
