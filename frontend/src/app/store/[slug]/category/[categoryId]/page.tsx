'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { ChevronDown, ChevronUp, ShoppingBag, Eye, ArrowLeft, Heart, Repeat } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface Variant {
    id: string;
    productId: string;
    size: string;
    color: string;
    price?: number;
    stock: number;
    imageUrls?: string[];
}

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    status: string;
    category?: { id: string; name: string };
    variants?: Variant[];
}

interface Category {
    id: string;
    name: string;
    description: string;
}

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const categoryId = params.categoryId as string;

    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);

    useEffect(() => {
        fetchCategoryData();
    }, [slug, categoryId]);

    const fetchCategoryData = async () => {
        try {
            setLoading(true);

            const [shopRes, catsRes, prodRes] = await Promise.all([
                axios.get(`${API}/store/${slug}`),
                axios.get(`${API}/store/products/${slug}/categories`),
                axios.get(`${API}/store/products/${slug}`)
            ]);

            const shopId = shopRes.data.shopId;

            const currentCat = catsRes.data.find((c: Category) => c.id === categoryId);
            if (currentCat) setCategory(currentCat);

            const categoryProducts = prodRes.data.filter((p: any) =>
                p.category?.id === categoryId || p.category?.id?.toString() === categoryId
            );
            setProducts(categoryProducts);

        } catch (err) {
            setError('Failed to load category.');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url?: string) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const base = 'https://api-gateway-507952736973.asia-south1.run.app';
        if (url.startsWith('/media/')) return `${base}${url}`;
        return `${base}/media/${url}/view`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center">
                <p className="text-xl font-serif text-gray-500 mb-6">{error || 'Category not found'}</p>
                <Link href={`/store/${slug}`} className="text-sm font-bold tracking-widest uppercase border border-black px-6 py-3 hover:bg-black hover:text-white transition">
                    Return to Store
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f8f8] font-sans text-[#1a1a1a]">
            {/* Minimal Header */}
            <header className="w-full bg-[#f4f4f4] py-12 px-8 flex items-center justify-center relative border-b border-gray-200/50">
                <button onClick={() => router.back()} className="absolute left-8 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full transition">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-5xl font-mono tracking-wide text-[#2b2b2b] uppercase pt-4 pb-2">{category.name}</h1>
            </header>

            <div className="max-w-[1600px] mx-auto px-8 py-8 flex flex-col lg:flex-row gap-12">

                {/* Sidebar Sidebar Filters */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                        <span className="text-[11px] font-bold tracking-[0.1em] text-gray-800 uppercase">Date, New to Old</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="space-y-6">
                        {/* Availability Filter */}
                        <div className="border-b border-gray-200 pb-6">
                            <button
                                onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
                                className="w-full flex items-center justify-between text-[11px] font-bold tracking-[0.1em] text-gray-800 uppercase mb-4"
                            >
                                Availability
                                {isAvailabilityOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {isAvailabilityOpen && (
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border border-gray-300 group-hover:border-gray-500 transition"></div>
                                            <span className="text-sm text-gray-500">In stock</span>
                                        </div>
                                        <span className="text-xs text-gray-400">({products.filter(p => (p.variants?.[0]?.stock || 0) > 0).length})</span>
                                    </label>
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border border-gray-300 group-hover:border-gray-500 transition"></div>
                                            <span className="text-sm text-gray-500">Out of stock</span>
                                        </div>
                                        <span className="text-xs text-gray-400">({products.filter(p => (p.variants?.[0]?.stock || 0) === 0).length})</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Price Filter */}
                        <div className="border-b border-gray-200 pb-6">
                            <button
                                onClick={() => setIsPriceOpen(!isPriceOpen)}
                                className="w-full flex items-center justify-between text-[11px] font-bold tracking-[0.1em] text-gray-800 uppercase mb-4"
                            >
                                Price
                                {isPriceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    {/* Top Bar Navigation */}
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-sm text-gray-400 tracking-wide font-medium">{products.length} products</span>
                        <div className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase">
                            <span className="text-gray-400 font-normal text-xs tracking-normal">View:</span>
                            <button className="text-gray-600 hover:text-black transition">2</button>
                            <button className="text-black border-b border-black">3</button>
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <div className="py-32 text-center text-gray-500 font-serif text-xl border border-dashed border-gray-300">
                            No products currently available in this category.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                            {products.map(product => {
                                const heroImg = product.variants?.[0]?.imageUrls?.[0];
                                const hasStock = (product.variants?.[0]?.stock || 0) > 0;
                                const isLowStock = hasStock && (product.variants?.[0]?.stock || 0) <= 5;

                                return (
                                    <Link key={product.id} href={`/store/${slug}/product/${product.id}`} className="group relative flex flex-col gap-3">
                                        {/* Image Container */}
                                        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden w-full">
                                            {heroImg ? (
                                                <Image
                                                    src={getImageUrl(heroImg)!}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                                    No Image
                                                </div>
                                            )}

                                            {/* Action Icons removed by request */}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex flex-col gap-1.5 px-1">
                                            <h3 className="text-[14px] font-medium text-gray-800 tracking-wide group-hover:text-[#cba258] transition-colors">{product.name}</h3>
                                            <div className="flex items-center gap-2">
                                                {product.price && (
                                                    <span className="text-[13px] text-gray-400 line-through font-mono">Rs. {product.price.toLocaleString()}</span>
                                                )}
                                                <span className="text-sm font-semibold text-gray-900 font-mono">Rs. {product.costPrice ? product.costPrice.toLocaleString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
