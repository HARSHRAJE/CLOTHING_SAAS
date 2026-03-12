'use client';

import { AuthProvider } from '@/auth-service/context/AuthContext';

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
