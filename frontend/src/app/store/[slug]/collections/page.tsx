'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
    status: string;
    variants?: Variant[];
}

export default function CollectionsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters & Sorting state
    const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [sortOption, setSortOption] = useState('a-z'); // 'a-z', 'z-a', 'low-high', 'high-low'
    const [filterInStock, setFilterInStock] = useState(false);
    const [filterOutOfStock, setFilterOutOfStock] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        fetchProducts();
    }, [slug]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const prodRes = await axios.get(`${API}/store/products/${slug}`);
            setProducts(prodRes.data);
        } catch (err) {
            setError('Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url?: string) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/media/')) return `${API}${url}`;
        return `${API}/media/${url}/view`;
    };

    // Calculate derived data based on filters and sorting
    const processedProducts = useMemo(() => {
        let filtered = [...products];

        // Availability filter
        if (filterInStock || filterOutOfStock) {
            filtered = filtered.filter(p => {
                const stock = p.variants?.[0]?.stock || 0;
                if (filterInStock && filterOutOfStock) return true; // both checked
                if (filterInStock) return stock > 0;
                if (filterOutOfStock) return stock === 0;
                return true;
            });
        }

        // Sorting
        filtered.sort((a, b) => {
            if (sortOption === 'a-z') return a.name.localeCompare(b.name);
            if (sortOption === 'z-a') return b.name.localeCompare(a.name);
            if (sortOption === 'low-high') return a.price - b.price;
            if (sortOption === 'high-low') return b.price - a.price;
            return 0;
        });

        return filtered;
    }, [products, filterInStock, filterOutOfStock, sortOption]);

    // Pagination calculations
    const totalPages = Math.ceil(processedProducts.length / itemsPerPage) || 1;

    // Ensure current page is valid when filtering changes total pages
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const currentProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [processedProducts, currentPage]);

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

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center">
                <p className="text-xl font-serif text-gray-500 mb-6">{error}</p>
                <Link href={`/store/${slug}`} className="text-sm font-bold tracking-widest uppercase border border-black px-6 py-3 hover:bg-black hover:text-white transition">
                    Return to Store
                </Link>
            </div>
        );
    }

    const inStockCount = products.filter(p => (p.variants?.[0]?.stock || 0) > 0).length;
    const outOfStockCount = products.filter(p => (p.variants?.[0]?.stock || 0) === 0).length;

    return (
        <div className="min-h-screen bg-[#f8f8f8] font-sans text-[#1a1a1a]">
            {/* Header */}
            <header className="w-full bg-[#f4f4f4] py-12 px-8 flex items-center justify-center relative border-b border-gray-200/50">
                <button onClick={() => router.push(`/store/${slug}`)} className="absolute left-8 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full transition">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-5xl font-mono tracking-wide text-[#2b2b2b] uppercase pt-4 pb-2">Products</h1>
            </header>

            <div className="max-w-[1600px] mx-auto px-8 py-8 flex flex-col lg:flex-row gap-12">

                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="mb-8 pb-4 border-b border-gray-200">
                        <select
                            className="w-full bg-transparent text-[11px] font-bold tracking-[0.1em] text-gray-800 uppercase outline-none cursor-pointer appearance-none"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                        >
                            <option value="a-z">Alphabetically, A-Z</option>
                            <option value="z-a">Alphabetically, Z-A</option>
                            <option value="low-high">Price, Low to High</option>
                            <option value="high-low">Price, High to Low</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-8 mt-[-20px] pointer-events-none hidden lg:block" />
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
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 border-gray-300 rounded text-black focus:ring-black cursor-pointer"
                                                checked={filterInStock}
                                                onChange={() => setFilterInStock(!filterInStock)}
                                            />
                                            <span className="text-sm text-gray-500">In stock</span>
                                        </div>
                                        <span className="text-xs text-gray-400">({inStockCount})</span>
                                    </label>
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 border-gray-300 rounded text-black focus:ring-black cursor-pointer"
                                                checked={filterOutOfStock}
                                                onChange={() => setFilterOutOfStock(!filterOutOfStock)}
                                            />
                                            <span className="text-sm text-gray-500">Out of stock</span>
                                        </div>
                                        <span className="text-xs text-gray-400">({outOfStockCount})</span>
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
                            {isPriceOpen && (
                                <div className="text-sm text-gray-500 flex items-center justify-between pt-2">
                                    <div className="flex flex-col gap-1 w-[45%]">
                                        <span className="text-xs text-gray-400">From (Rs)</span>
                                        <input type="number" placeholder="0" className="border border-gray-300 px-2 py-1 text-sm outline-none focus:border-black" />
                                    </div>
                                    <span className="mt-5">-</span>
                                    <div className="flex flex-col gap-1 w-[45%]">
                                        <span className="text-xs text-gray-400">To (Rs)</span>
                                        <input type="number" placeholder="Max" className="border border-gray-300 px-2 py-1 text-sm outline-none focus:border-black" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Product Grid area */}
                <div className="flex-1">
                    {/* Top Bar Navigation & Pagination */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200">
                        <span className="text-sm text-gray-400 tracking-wide font-medium mb-4 sm:mb-0 hidden sm:block"></span>
                        <span className="text-sm text-gray-500 tracking-wide font-medium">{processedProducts.length} products</span>
                        <div className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase">
                            <span className="text-gray-400 font-normal text-xs tracking-normal">Page:</span>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-6 h-6 flex items-center justify-center transition-colors ${currentPage === pageNum
                                            ? 'text-black border-b border-black'
                                            : 'text-gray-400 hover:text-black'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {currentProducts.length === 0 ? (
                        <div className="py-32 text-center text-gray-500 font-serif text-xl border border-dashed border-gray-300">
                            No products match the selected filters.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                                {currentProducts.map(product => {
                                    const heroImg = product.variants?.[0]?.imageUrls?.[0];
                                    const hasStock = (product.variants?.[0]?.stock || 0) > 0;
                                    const isLowStock = hasStock && (product.variants?.[0]?.stock || 0) <= 5;

                                    return (
                                        <Link href={`/store/${slug}/product/${product.id}`} key={product.id} className="group relative flex flex-col gap-3">
                                            {/* Image Container */}
                                            <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden w-full">
                                                {heroImg ? (
                                                    <img
                                                        src={getImageUrl(heroImg)!}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                                        No Image
                                                    </div>
                                                )}

                                                {/* Top Right Action Icons */}
                                                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow hover:bg-black hover:text-white transition-colors text-gray-600">
                                                        <Heart className="w-4 h-4" />
                                                    </button>
                                                    <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow hover:bg-black hover:text-white transition-colors text-gray-600">
                                                        <Repeat className="w-4 h-4" />
                                                    </button>
                                                    <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow hover:bg-black hover:text-white transition-colors text-gray-600">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex flex-col gap-1.5 px-1">
                                                <h3 className="text-[14px] font-medium text-gray-800 tracking-wide">{product.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] text-gray-400 line-through font-mono">Rs. {((product.price * 1.18).toFixed(2))}</span>
                                                    <span className="text-[14px] font-bold text-[#dc2626] font-mono">Rs. {product.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Bottom Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-16 flex items-center justify-center gap-2 pb-8">
                                    <button
                                        className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:border-black transition disabled:opacity-50"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    >
                                        <ChevronDown className="w-4 h-4 rotate-90" />
                                    </button>

                                    <div className="flex items-center gap-2 mx-4">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 flex items-center justify-center border transition-colors ${currentPage === pageNum
                                                    ? 'bg-black text-white border-black'
                                                    : 'border-gray-300 text-gray-600 hover:border-black'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:border-black transition disabled:opacity-50"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    >
                                        <ChevronDown className="w-4 h-4 -rotate-90" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
