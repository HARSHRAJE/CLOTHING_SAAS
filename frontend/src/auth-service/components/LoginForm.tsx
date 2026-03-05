'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function LoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login, logout, user } = useAuth();
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Automatically logout if the user arrives at the login page (e.g. via back button)
        // We run this ONLY on mount to prevent logging the user out immediately after a successful login.
        logout();
        // eslint-disable-next-line react-hooks/exhaustive-deps.
    }, []);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await AuthService.login({ email: data.email, password: data.password });
            login({
                userId: response.userId,
                email: data.email,
                role: response.role,
                shopId: response.shopId
            });
        } catch (error: any) {
            console.error(error);
            setApiError('Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register('email', { required: true })}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            {errors.email && <span className="text-red-500 text-sm">Email is required</span>}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                type="password"
                                {...register('password', { required: true })}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            {errors.password && <span className="text-red-500 text-sm">Password is required</span>}
                        </div>
                    </div>

                    {apiError && (
                        <div className="text-red-500 text-sm text-center">{apiError}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
