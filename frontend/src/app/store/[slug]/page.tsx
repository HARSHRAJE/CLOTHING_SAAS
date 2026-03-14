import LandingPage from './LandingPage';

const API = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;

    let shopDetails = { name: slug, address: '', phone: '', whatsappNumber: '', email: '', instagramUrl: '' };
    let categories: any[] = [];
    let products: any[] = [];

    try {
        const [shopRes, catsRes, prodRes] = await Promise.all([
            fetch(`${API}/store/${slug}`, { cache: 'no-store' }),
            fetch(`${API}/store/products/${slug}/categories`, { cache: 'no-store' }),
            fetch(`${API}/store/products/${slug}`, { cache: 'no-store' }),
        ]);

        if (shopRes.ok) {
            const shopData = await shopRes.json();
            shopDetails = {
                name: shopData.name || slug,
                address: shopData.address || '',
                phone: shopData.phone || '',
                whatsappNumber: shopData.whatsappNumber || '',
                email: shopData.email || '',
                instagramUrl: shopData.instagramUrl || '',
            };
        }

        if (catsRes.ok) categories = await catsRes.json();
        if (prodRes.ok) products = await prodRes.json();
    } catch (error) {
        console.error('Failed to fetch store data on server:', error);
    }

    return (
        <LandingPage
            initialShopDetails={shopDetails}
            initialCategories={categories}
            initialProducts={products}
            slug={slug}
            mediaBaseUrl={API}
        />
    );
}
