'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role } from '../models/User';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
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
            try {
                // If there is an HttpOnly cookie, this will return the user
                const user = await AuthService.getCurrentUser();
                setUser(user);
                localStorage.setItem('user', JSON.stringify(user));
            } catch (error) {
                // Not authenticated or token expired
                setUser(null);
                localStorage.removeItem('user');
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = (userData: User) => {
        // The HttpOnly cookie is already set by the backend response header
        localStorage.setItem('user', JSON.stringify(userData)); // Persist user for Shop ID access.
        setUser(userData);

        if (userData.role === Role.SUPER_ADMIN) {
            router.push('/admin');
        } else if (userData.role === Role.SHOP_OWNER) {
            router.push('/owner');
        } else {
            router.push('/');
        }
    };

    const logout = async () => {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error('Logout failed on backend', error);
        }
        localStorage.removeItem('user');
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
