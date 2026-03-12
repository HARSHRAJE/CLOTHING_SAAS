'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight, Package, Send, Trash2, Plus, Minus } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface Variant {
    id: string;
    productId: string;
    size: string;
    color: string;
    price?: number;
    costPrice?: number;
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

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const productId = params.productId as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [showOrder, setShowOrder] = useState(false);
    const [orderForm, setOrderForm] = useState({ customerName: '', phone: '', email: '' });
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [slug, productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const prodRes = await axios.get(`${API}/store/products/${slug}/${productId}`);
            setProduct(prodRes.data);
            if (prodRes.data.variants && prodRes.data.variants.length > 0) {
                setSelectedVariantId(prodRes.data.variants[0].id);
            }
        } catch (err) {
            setError('Product not found.');
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
                price: product.costPrice ? product.costPrice : (variant.price ?? product.price),
                quantity: 1,
                imageUrl: variant.imageUrls?.[0],
            }]);
        }
        setShowCart(true);
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
        } catch {
            alert('Failed to place order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center">
                <p className="text-xl font-serif text-gray-500 mb-6">{error || 'Product not found.'}</p>
                <button onClick={() => router.back()} className="text-sm font-bold tracking-widest uppercase border border-black px-6 py-3 hover:bg-black hover:text-white transition">
                    Go Back
                </button>
            </div>
        );
    }

    // --- CART DRAWER OVERLAY ---
    if (showCart && !showOrder && !orderSuccess) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end">
                <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ShoppingBag className="w-6 h-6" /> Your Cart
                        </h2>
                        <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            Close
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                <ShoppingBag className="w-16 h-16 opacity-20" />
                                <p>Your cart is empty.</p>
                                <button onClick={() => setShowCart(false)} className="text-emerald-600 font-medium hover:underline">Continue Browsing</button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {cart.map(item => (
                                    <div key={item.variantId} className="flex gap-4 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                                        <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.imageUrl ? (
                                                <Image src={getImageUrl(item.imageUrl)!} alt="" width={80} height={80} className="object-cover" />
                                            ) : (
                                                <Package className="w-full h-full p-4 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 line-clamp-1">{item.productName}</h4>
                                                <p className="text-sm text-gray-500">{item.size} / {item.color}</p>
                                                <p className="font-bold text-gray-900 mt-1">₹{item.price.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                                    <button onClick={() => updateQty(item.variantId, -1)} className="p-1 px-2 hover:bg-gray-200 transition-colors">
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button onClick={() => updateQty(item.variantId, 1)} className="p-1 px-2 hover:bg-gray-200 transition-colors">
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.variantId)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="border-t border-gray-100 p-6 bg-white shrink-0">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-600 font-medium">Subtotal</span>
                                <span className="text-2xl font-bold text-gray-900">₹{cartTotal.toLocaleString()}</span>
                            </div>
                            <button onClick={() => setShowOrder(true)} className="w-full bg-[#1a1a1a] text-white py-4 rounded-xl font-semibold text-lg hover:bg-black transition-colors shadow-lg">
                                Proceed to Checkout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

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
                        className="bg-[#1a1a1a] text-white px-6 py-3 rounded-xl font-medium tracking-widest uppercase text-sm hover:bg-black transition-colors"
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
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                <input type="tel" value={orderForm.phone} onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" placeholder="+91 98765 43210" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                                <input type="email" value={orderForm.email} onChange={e => setOrderForm({ ...orderForm, email: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" placeholder="john@example.com" />
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
                        className="w-full bg-[#1a1a1a] text-white py-4 rounded-xl font-semibold text-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        <Send className="w-5 h-5" />
                        {submitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                </div>
            </div>
        );
    }


    const activeVariant = selectedVariantId
        ? product.variants?.find(v => v.id === selectedVariantId)
        : product.variants?.[0];
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
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back
                    </button>
                    <button onClick={() => setShowCart(true)} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ShoppingBag className="w-6 h-6" />
                        {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1a1a1a] text-white text-xs rounded-full flex items-center justify-center">{cartCount}</span>}
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
                                        <Image src={getImageUrl(displayImages[safeIdx].url)!} alt={product.name} fill className="object-cover transition-opacity duration-300" />
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
                                            className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === safeIdx ? 'border-[#1a1a1a] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                            <Image src={getImageUrl(img.url)!} alt="" width={64} height={64} className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="p-8">
                            {product.category && (
                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm font-bold tracking-widest rounded-full uppercase mb-3">{product.category.name}</span>
                            )}
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                            <p className="text-3xl font-bold text-[#dc2626] mb-4">₹{product.price.toLocaleString()}</p>
                            {product.description && <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>}

                            {/* Variants */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Available Variants</h3>
                                {product.variants && product.variants.length > 0 ? (
                                    product.variants.map(v => {
                                        const isActive = (selectedVariantId ?? product.variants?.[0]?.id) === v.id;
                                        return (
                                            <button key={v.id} onClick={() => { setSelectedVariantId(v.id); setSelectedImageIdx(0); }}
                                                className={`flex items-center justify-between p-4 rounded-xl transition-all w-full text-left ${isActive ? 'border-2 border-[#1a1a1a] bg-gray-50 shadow-sm' : 'border border-gray-200 hover:border-gray-300'
                                                    }`}>
                                                <div className="flex items-center gap-3">
                                                    {v.imageUrls?.[0] ? (
                                                        <Image src={getImageUrl(v.imageUrls[0])!} alt="" width={48} height={48} className="object-cover rounded-lg" />
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
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        {(v.price ?? product.price) && (
                                                            <span className="text-xs font-medium text-gray-400 line-through font-mono">₹{(v.price ?? product.price).toLocaleString()}</span>
                                                        )}
                                                        <span className="font-bold text-gray-900 font-mono">₹{product.costPrice ? product.costPrice.toLocaleString() : (v.price ?? product.price).toLocaleString()}</span>
                                                    </div>
                                                    <span onClick={(e) => { e.stopPropagation(); addToCart(product, v); }}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors ${v.stock <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-black cursor-pointer'
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
