import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Store',
    description: 'Browse products and place orders',
};

export default function StoreLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
