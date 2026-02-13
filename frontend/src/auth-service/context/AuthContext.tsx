'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role } from '../models/User';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const user = await AuthService.getCurrentUser();
                    setUser(user);
                } catch (error) {
                    console.error('Failed to fetch user', error);
                    localStorage.removeItem('accessToken');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('accessToken', token);
        setUser(userData);

        if (userData.role === Role.SUPER_ADMIN) {
            router.push('/admin');
        } else if (userData.role === Role.SHOP_OWNER) {
            router.push('/owner');
        } else {
            router.push('/');
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
