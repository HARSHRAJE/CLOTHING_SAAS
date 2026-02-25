'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { ShoppingBag, ArrowLeft, Plus, Minus, Trash2, Send, Store, Package, Search, X, ChevronLeft, ChevronRight, Instagram } from 'lucide-react';

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
interface Category {
    id: string;
    shopId: string;
    name: string;
    description: string;
}

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    status: string;
    variants?: Variant[];
    category?: { id: string; name: string };
}

interface CartItem {
    variantId: string;
    productName: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

export default function LandingPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [showOrder, setShowOrder] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [orderForm, setOrderForm] = useState({ customerName: '', phone: '', email: '' });
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

    const [shopDetails, setShopDetails] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        instagramUrl: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Fetch shop details to get the UUID
            const shopRes = await axios.get(`${API}/store/${slug}`);
            const shopId = shopRes.data.shopId; // Fix: the DTO is shopId, not id! Wait, PublicShopResponse has shopId.
            setShopDetails({
                name: shopRes.data.name || slug,
                address: shopRes.data.address || '',
                phone: shopRes.data.whatsappNumber || '', // PublicShopResponse uses whatsappNumber for phone fallback in public! Wait, Landing page should use public response.
                email: shopRes.data.email || '',
                instagramUrl: shopRes.data.instagramUrl || ''
            });

            // 2. Fetch categories for this shop
            const catsRes = await axios.get(`${API}/store/products/${slug}/categories`);
            setCategories(catsRes.data);

            // 3. Keep products for now for cart/checkout purposes
            const prodRes = await axios.get(`${API}/store/products/${slug}`);
            setProducts(prodRes.data);
        } catch {
            setError('Shop not found or no products available.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [slug]);

    useEffect(() => {
        if (orderSuccess || showOrder || showCart) {
            window.scrollTo(0, 0);
        }
    }, [orderSuccess, showOrder, showCart]);

    const addToCart = (product: Product, variant: Variant) => {
        const existing = cart.find(c => c.variantId === variant.id);
        if (existing) {
            setCart(cart.map(c => c.variantId === variant.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, {
                variantId: variant.id,
                productName: product.name,
                size: variant.size,
                color: variant.color,
                price: variant.price ?? product.price,
                quantity: 1,
                imageUrl: variant.imageUrls?.[0],
            }]);
        }
    };

    const updateQty = (variantId: string, delta: number) => {
        setCart(cart.map(c => {
            if (c.variantId !== variantId) return c;
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : c;
        }));
    };

    const removeFromCart = (variantId: string) => {
        setCart(cart.filter(c => c.variantId !== variantId));
    };

    const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
    const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

    const placeOrder = async () => {
        if (!orderForm.customerName || !orderForm.phone) return;
        setSubmitting(true);
        try {
            await axios.post(`${API}/store/${slug}/orders`, {
                customerName: orderForm.customerName,
                phone: orderForm.phone,
                email: orderForm.email || undefined,
                orderSource: 'WEBSITE',
                items: cart.map(c => ({ variantId: c.variantId, quantity: c.quantity })),
            });
            setOrderSuccess(true);
            setCart([]);
            setOrderForm({ customerName: '', phone: '', email: '' });
            setShowOrder(false);
            setShowCart(false);
        } catch (err: any) {
            console.error("Order placement failed:", err);
            alert('Failed to place order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getImageUrl = (url?: string) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        // URLs are stored as "/media/UUID/view" or just "UUID"
        if (url.startsWith('/media/')) return `${API}${url}`;
        return `${API}/media/${url}/view`;
    };

    // --- ORDER SUCCESS ---
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                    <p className="text-gray-600 mb-6">Thank you for your order. We&apos;ll get back to you soon.</p>
                    <button
                        onClick={() => { setOrderSuccess(false); setShowOrder(false); setShowCart(false); }}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    // --- CHECKOUT FORM ---
    if (showOrder) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
                        <button onClick={() => setShowOrder(false)} className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
                    </div>
                </header>
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Your Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input type="text" value={orderForm.customerName} onChange={e => setOrderForm({ ...orderForm, customerName: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                <input type="tel" value={orderForm.phone} onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" placeholder="+91 98765 43210" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                                <input type="email" value={orderForm.email} onChange={e => setOrderForm({ ...orderForm, email: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" placeholder="john@example.com" />
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Summary</h3>
                        {cart.map(item => (
                            <div key={item.variantId} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-900">{item.productName}</p>
                                    <p className="text-sm text-gray-500">{item.size} / {item.color} × {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-gray-200">
                            <p className="text-lg font-bold text-gray-900">Total</p>
                            <p className="text-lg font-bold text-emerald-600">₹{cartTotal.toLocaleString()}</p>
                        </div>
                    </div>

                    <button onClick={placeOrder} disabled={submitting || !orderForm.customerName || !orderForm.phone}
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        <Send className="w-5 h-5" />
                        {submitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                </div>
            </div>
        );
    }

    // --- CART SLIDE-OVER ---
    if (showCart) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <button onClick={() => setShowCart(false)} className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">Your Cart ({cartCount})</h1>
                        </div>
                    </div>
                </header>

                <div className="max-w-3xl mx-auto px-4 py-6">
                    {cart.length === 0 ? (
                        <div className="text-center py-16">
                            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Your cart is empty</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 mb-6">
                                {cart.map(item => (
                                    <div key={item.variantId} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                                        {item.imageUrl ? (
                                            <img src={getImageUrl(item.imageUrl)!} alt="" className="w-20 h-20 object-cover rounded-lg" />
                                        ) : (
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Package className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                                            <p className="text-sm text-gray-500">{item.size} / {item.color}</p>
                                            <p className="font-bold text-emerald-600 mt-1">₹{item.price.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQty(item.variantId, -1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                            <button onClick={() => updateQty(item.variantId, 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.variantId)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                                    <span className="text-xl font-bold text-gray-900">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <button onClick={() => setShowOrder(true)}
                                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors">
                                    Proceed to Checkout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // --- PRODUCT DETAIL ---
    if (selectedProduct) {
        // Filter images by selected variant, or show first variant's images by default
        const activeVariant = selectedVariantId
            ? selectedProduct.variants?.find(v => v.id === selectedVariantId)
            : selectedProduct.variants?.[0];
        const displayImages: { url: string; variantLabel: string }[] = [];
        if (activeVariant?.imageUrls) {
            activeVariant.imageUrls.forEach(url => {
                displayImages.push({ url, variantLabel: `${activeVariant.size} / ${activeVariant.color}` });
            });
        }
        const safeIdx = displayImages.length > 0 ? Math.min(selectedImageIdx, displayImages.length - 1) : 0;

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                        <button onClick={() => { setSelectedProduct(null); setSelectedImageIdx(0); setSelectedVariantId(null); }} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-5 h-5" /> Back
                        </button>
                        <button onClick={() => setShowCart(true)} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ShoppingBag className="w-6 h-6" />
                            {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center">{cartCount}</span>}
                        </button>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                            {/* Image Gallery */}
                            <div className="flex flex-col">
                                {/* Main Image */}
                                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                    {displayImages.length > 0 ? (
                                        <>
                                            <img src={getImageUrl(displayImages[safeIdx].url)!} alt={selectedProduct.name} className="w-full h-full object-cover transition-opacity duration-300" />
                                            {/* Variant label */}
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-3 py-1 rounded-full">
                                                {displayImages[safeIdx].variantLabel}
                                            </div>
                                            {/* Navigation Arrows */}
                                            {displayImages.length > 1 && (
                                                <>
                                                    <button onClick={() => setSelectedImageIdx(safeIdx === 0 ? displayImages.length - 1 : safeIdx - 1)}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                                                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                                                    </button>
                                                    <button onClick={() => setSelectedImageIdx(safeIdx === displayImages.length - 1 ? 0 : safeIdx + 1)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                                                        <ChevronRight className="w-5 h-5 text-gray-700" />
                                                    </button>
                                                    {/* Image Counter */}
                                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                                                        {safeIdx + 1} / {displayImages.length}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-24 h-24 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                {/* Thumbnails */}
                                {displayImages.length > 1 && (
                                    <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50 border-t border-gray-100">
                                        {displayImages.map((img, idx) => (
                                            <button key={idx} onClick={() => setSelectedImageIdx(idx)}
                                                className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === safeIdx ? 'border-emerald-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                                <img src={getImageUrl(img.url)!} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="p-8">
                                {selectedProduct.category && (
                                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full mb-3">{selectedProduct.category.name}</span>
                                )}
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h1>
                                <p className="text-3xl font-bold text-emerald-600 mb-4">₹{selectedProduct.price.toLocaleString()}</p>
                                {selectedProduct.description && <p className="text-gray-600 mb-6 leading-relaxed">{selectedProduct.description}</p>}

                                {/* Variants */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Available Variants</h3>
                                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                                        selectedProduct.variants.map(v => {
                                            const isActive = (selectedVariantId ?? selectedProduct.variants?.[0]?.id) === v.id;
                                            return (
                                                <button key={v.id} onClick={() => { setSelectedVariantId(v.id); setSelectedImageIdx(0); }}
                                                    className={`flex items-center justify-between p-4 rounded-xl transition-all w-full text-left ${isActive ? 'border-2 border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border border-gray-200 hover:border-emerald-300'
                                                        }`}>
                                                    <div className="flex items-center gap-3">
                                                        {v.imageUrls?.[0] ? (
                                                            <img src={getImageUrl(v.imageUrls[0])!} alt="" className="w-12 h-12 object-cover rounded-lg" />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <Package className="w-5 h-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-900">{v.size} / {v.color}</p>
                                                            <p className="text-sm text-gray-500">{v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-gray-900">₹{(v.price ?? selectedProduct.price).toLocaleString()}</span>
                                                        <span onClick={(e) => { e.stopPropagation(); addToCart(selectedProduct, v); }}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${v.stock <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                                                                }`}>
                                                            Add to Cart
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <p className="text-gray-500 italic">No variants available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- PRODUCT LISTING ---
    return (
        <div className="min-h-screen bg-[#fdfcfa]">
            {/* Announcement Marquee */}
            <div className="absolute top-0 w-full bg-[#1a1a1a] text-white overflow-hidden py-2.5 z-[60] flex items-center">
                <style>{`
                    @keyframes marquee-top {
                        0% { transform: translateX(0%); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-marquee-top {
                        display: flex;
                        width: max-content;
                        animation: marquee-top 25s linear infinite;
                    }
                `}</style>
                <div className="animate-marquee-top hover:[animation-play-state:paused] cursor-default">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center gap-12 px-6 text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">
                            <span>Welcome to {shopDetails.name || slug}</span>
                            <span>Step In, Change Your Style</span>
                            <span>Explore</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Header */}
            <header className="absolute top-[40px] w-full z-50 bg-transparent py-6 px-8 flex items-center justify-between">
                <div className="flex items-center">
                    <a href={shopDetails.instagramUrl || '#'} target={shopDetails.instagramUrl ? "_blank" : undefined} rel={shopDetails.instagramUrl ? "noopener noreferrer" : undefined} className="text-gray-900 hover:text-gray-600 transition-colors">
                        <Instagram className="w-5 h-5" />
                    </a>
                </div>
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center whitespace-nowrap hidden sm:flex">
                    <h1 className="text-3xl font-serif text-black uppercase tracking-widest">{slug}</h1>
                </div>

                <div className="flex items-center gap-6 text-gray-900">
                    <div className="relative group">
                        <Search className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors" />
                        <div className="absolute right-0 top-full mt-4 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                            <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-none px-4 py-3 shadow-lg focus:ring-1 focus:ring-black focus:border-black outline-none text-sm font-medium" />
                        </div>
                    </div>
                    <button onClick={() => setShowCart(true)} className="relative hover:text-gray-600 transition-colors">
                        <ShoppingBag className="w-5 h-5" />
                        {cartCount > 0 && <span className="absolute -top-2 -right-2 w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
                    </button>
                </div>
            </header>

            {/* Hero */}
            <div className="relative w-full h-[85vh] flex items-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop"
                    alt="Latest Collection"
                    className="absolute inset-0 w-full h-full object-cover object-center scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
                />
                <div className="absolute inset-0 bg-black/30"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-8 w-full pt-16 flex flex-col items-center text-center">
                    <div className="max-w-3xl">
                        <p className="text-[12px] font-bold tracking-[0.3em] text-white/80 uppercase mb-6">New Season Arrival</p>
                        <h2 className="text-6xl md:text-[6rem] font-serif text-white leading-[1.1] tracking-tight mb-4 drop-shadow-lg">
                            Elevate Your
                        </h2>
                        <h2 className="text-6xl md:text-[7rem] font-serif italic text-[#cba258] leading-[1] mb-12 tracking-tight drop-shadow-xl">
                            Wardrobe
                        </h2>
                        <Link href={`/store/${slug}/collections`} className="inline-block bg-white text-black text-[12px] font-bold tracking-[0.2em] uppercase px-12 py-5 hover:bg-black hover:text-white transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                            Shop The Collection
                        </Link>
                    </div>
                </div>
            </div>

            {/* Typography Marquee */}
            <div className="w-full overflow-hidden bg-[#1a1a1a] py-[22px] mb-20 flex whitespace-nowrap border-y border-[#333]">
                <div className="animate-marquee flex items-center min-w-max">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center">
                            <span className="text-[26px] font-serif italic text-[#fdfcfa] px-10 tracking-[0.05em]">Premium</span>
                            <span className="text-[#cba258] text-[15px]">&bull;</span>
                            <span className="text-[26px] font-serif italic text-[#fdfcfa] px-10 tracking-[0.05em]">Elegant</span>
                            <span className="text-[#cba258] text-[15px]">&bull;</span>
                            <span className="text-[26px] font-serif italic text-[#fdfcfa] px-10 tracking-[0.05em]">Exclusive</span>
                            <span className="text-[#cba258] text-[15px]">&bull;</span>
                            <span className="text-[26px] font-serif italic text-[#fdfcfa] px-10 tracking-[0.05em]">Refined</span>
                            <span className="text-[#cba258] text-[15px]">&bull;</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Highlighted Categories */}
            <div className="max-w-7xl mx-auto px-8 pb-32">
                {/* Section Header */}
                <div className="flex flex-col items-center justify-center text-center mb-16">
                    <p className="text-[11px] font-bold tracking-[0.3em] text-[#cba258] uppercase mb-4">Discover</p>
                    <h2 className="text-5xl md:text-6xl font-serif text-[#1a1a1a] tracking-tight">Our Curations</h2>
                    <div className="w-12 h-0.5 bg-black mt-8"></div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[4/5] bg-gray-200 mb-6" />
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 w-2/3" />
                                    <div className="h-4 bg-gray-200 w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-32">
                        <p className="text-gray-500 text-xl font-serif">{error}</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-32">
                        <p className="text-gray-500 text-xl font-serif">{searchQuery ? 'No categories match your search.' : 'No collections available at the moment.'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {filteredCategories.slice(0, 3).map(category => {
                            // Find the first product that belongs to this category and has an image
                            const firstProductWithImage = products.find(p => p.category?.id === category.id && p.variants?.[0]?.imageUrls?.[0]);
                            const categoryImage = firstProductWithImage ? getImageUrl(firstProductWithImage.variants![0].imageUrls![0]) : null;

                            return (
                                <Link key={category.id} href={`/store/${slug}/category/${category.id}`}
                                    className="group text-left focus:outline-none w-full block">
                                    {/* Category Image or Abstract placeholder */}
                                    <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative mb-6">
                                        {categoryImage ? (
                                            <img
                                                src={categoryImage}
                                                alt={category.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-700 ease-in-out">
                                                <Store className="w-12 h-12 text-gray-300" />
                                            </div>
                                        )}
                                        {/* Subtle luxury overlay */}
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Hover Content */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                            <span className="bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase px-6 py-3 shadow-lg">
                                                Explore Now
                                            </span>
                                        </div>
                                    </div>

                                    {/* Category Details */}
                                    <div className="flex flex-col items-center justify-center text-center gap-2">
                                        <h3 className="text-xl md:text-2xl font-serif text-gray-900 group-hover:text-[#cba258] transition-colors">{category.name}</h3>
                                        <p className="text-xs text-gray-500 tracking-[0.1em] uppercase">
                                            {category.description || 'Curated Essentials'}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Philosophy Section */}
            <div className="bg-[#1a1a1a] text-white py-32 px-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#cba258] rounded-full blur-[150px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>

                <p className="text-[11px] font-bold tracking-[0.3em] text-[#cba258] uppercase mb-8 relative z-10">Our Philosophy</p>
                <div className="max-w-5xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-5xl lg:text-[4.5rem] font-serif leading-[1.2] mb-0 tracking-tight">
                        We believe pieces should speak<br />
                        <span className="italic text-gray-400">softly</span> — and be <span className="italic text-[#cba258]">remembered</span><br />
                        loudly.
                    </h2>
                </div>
            </div>

            {/* Dark Footer */}
            <footer className="bg-black text-gray-400 pt-20 pb-10 border-t border-[#2a2a2a]">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

                        {/* Brand Column */}
                        <div className="md:col-span-4 flex flex-col items-start pr-8 text-left">
                            <h2 className="text-4xl font-serif text-white tracking-widest uppercase mb-6 drop-shadow-md">
                                {slug}
                            </h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                Crafting timeless pieces for the modern wardrobe. Quality, minimalism, and intent in every stitch. Discover the art of restraint.
                            </p>
                        </div>

                        {/* Information Column */}
                        <div className="md:col-span-3">
                            <h4 className="text-white text-sm font-bold tracking-[0.15em] uppercase mb-8">
                                Information
                            </h4>
                            <ul className="space-y-4 text-[13px] font-mono text-gray-400">
                                <li><Link href={`/store/${slug}/contact`} className="hover:text-white transition-colors">Contact Us</Link></li>
                            </ul>
                        </div>

                        {/* Contact Column */}
                        <div className="md:col-span-5">
                            <h4 className="text-white text-sm font-bold tracking-[0.15em] uppercase mb-8">
                                Contact
                            </h4>
                            <div className="space-y-6 text-[13px] font-mono text-gray-400">
                                <div>
                                    <p className="mb-1"><span className="text-white font-semibold tracking-wider">Location : </span> {shopDetails.address || 'Address not provided'}</p>
                                </div>
                                <div>
                                    <span className="text-white font-semibold tracking-wider mb-2 block">Timing :</span>
                                    <p>Mon-Sun: 12:00 pm - 8:00 pm</p>
                                </div>
                                <div>
                                    <span className="text-white font-semibold tracking-wider mb-2 block">Customer Care:</span>
                                    <p className="mb-2">Phone No: {shopDetails.phone || 'Phone not provided'}</p>
                                    <p>Email : {shopDetails.email || 'Email not provided'}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-[#333] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-gray-500">
                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a href={shopDetails.instagramUrl || '#'} target={shopDetails.instagramUrl ? "_blank" : undefined} rel={shopDetails.instagramUrl ? "noopener noreferrer" : undefined} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-[#cba258] transition-colors text-[#1a1a1a] hover:text-white">
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                        <p>&copy; {new Date().getFullYear()}, {slug} - All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Floating Cart Button */}
            {cartCount > 0 && !showCart && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <button onClick={() => setShowCart(true)}
                        className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center gap-3 hover:bg-emerald-700 transition-colors">
                        <ShoppingBag className="w-5 h-5" />
                        <span className="font-semibold">{cartCount} item{cartCount > 1 ? 's' : ''}</span>
                        <span className="w-px h-6 bg-emerald-400" />
                        <span className="font-bold">₹{cartTotal.toLocaleString()}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
