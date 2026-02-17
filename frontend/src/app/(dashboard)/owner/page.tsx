'use client';

import { useAuth } from '@/auth-service/context/AuthContext';
import { Role } from '@/auth-service/models/User';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CategoryList from '@/product-service/components/CategoryList';
import CategoryForm from '@/product-service/components/CategoryForm';
import ProductList from '@/product-service/components/ProductList';
import ProductForm from '@/product-service/components/ProductForm';
import { Category } from '@/product-service/models/Category';
import { Product } from '@/product-service/models/Product';
import { LayoutDashboard, Package, Tags, ShoppingBag, Users } from 'lucide-react';
import OrderList from '@/order-service/components/OrderList';
import CustomerList from '@/customer-service/components/CustomerList';
import { InquiryList } from '@/inquiry-service/components/InquiryList';
import { MessageSquare, BarChart3 } from 'lucide-react';
import AnalyticsDashboard from '@/analytics-service/components/AnalyticsDashboard';

enum Tab {
    OVERVIEW = 'OVERVIEW',
    PRODUCTS = 'PRODUCTS',
    CATEGORIES = 'CATEGORIES',
    ORDERS = 'ORDERS',
    CUSTOMERS = 'CUSTOMERS',
    INQUIRIES = 'INQUIRIES',
    ANALYTICS = 'ANALYTICS'
}

export default function OwnerDashboard() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>(Tab.OVERVIEW);

    // State for Forms
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);

    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== Role.SHOP_OWNER)) {
            if (!user) router.push('/login');
            else router.push('/');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) return <div>Loading...</div>;

    const handleCategoryEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsEditingCategory(true);
    };

    const handleCategoryCreate = () => {
        setSelectedCategory(undefined);
        setIsEditingCategory(true);
    };

    const handleProductEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsEditingProduct(true);
    };

    const handleProductCreate = () => {
        setSelectedProduct(undefined);
        setIsEditingProduct(true);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Shop Owner Dashboard</h1>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4 text-gray-700">Welcome, {user.email}</span>
                            <button
                                onClick={logout}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-6">
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-white shadow rounded-lg h-fit">
                    <nav className="flex flex-col p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab(Tab.OVERVIEW)}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md w-full text-left ${activeTab === Tab.OVERVIEW ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <LayoutDashboard className="mr-3 h-5 w-5" />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab(Tab.PRODUCTS)}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md w-full text-left ${activeTab === Tab.PRODUCTS ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Package className="mr-3 h-5 w-5" />
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab(Tab.CATEGORIES)}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md w-full text-left ${activeTab === Tab.CATEGORIES ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Tags className="mr-3 h-5 w-5" />
                            Categories
                        </button>
                        <button
                            onClick={() => setActiveTab(Tab.ORDERS)}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md w-full text-left ${activeTab === Tab.ORDERS ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <ShoppingBag className="mr-3 h-5 w-5" />
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab(Tab.CUSTOMERS)}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md w-full text-left ${activeTab === Tab.CUSTOMERS ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Users className="mr-3 h-5 w-5" />
                            Customers
                        </button>
                        <button
                            onClick={() => setActiveTab(Tab.INQUIRIES)}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md w-full text-left ${activeTab === Tab.INQUIRIES ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <MessageSquare className="mr-3 h-5 w-5" />
                            Inquiries
                        </button>
                        <button
                            onClick={() => setActiveTab(Tab.ANALYTICS)}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md w-full text-left ${activeTab === Tab.ANALYTICS ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <BarChart3 className="mr-3 h-5 w-5" />
                            Analytics
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-white shadow rounded-lg p-6 min-h-[500px]">
                    {activeTab === Tab.OVERVIEW && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Overview</h2>
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                <h3 className="text-lg font-medium text-blue-900">Shop Details</h3>
                                <div className="mt-2 text-sm text-blue-800">
                                    <p><span className="font-semibold">Shop ID:</span> {user.shopId}</p>
                                    <p><span className="font-semibold">Email:</span> {user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === Tab.CATEGORIES && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Categories</h2>
                                {!isEditingCategory && (
                                    <button
                                        onClick={handleCategoryCreate}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
                                    >
                                        Add Category
                                    </button>
                                )}
                            </div>

                            {isEditingCategory ? (
                                <div className="max-w-xl">
                                    <h3 className="text-lg font-medium mb-4">{selectedCategory ? 'Edit Category' : 'New Category'}</h3>
                                    <CategoryForm
                                        category={selectedCategory}
                                        onSuccess={() => setIsEditingCategory(false)}
                                        onCancel={() => setIsEditingCategory(false)}
                                    />
                                </div>
                            ) : (
                                <CategoryList onEdit={handleCategoryEdit} />
                            )}
                        </div>
                    )}

                    {activeTab === Tab.PRODUCTS && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Products</h2>
                                {!isEditingProduct && (
                                    <button
                                        onClick={handleProductCreate}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
                                    >
                                        Add Product
                                    </button>
                                )}
                            </div>

                            {isEditingProduct ? (
                                <div className="max-w-2xl">
                                    <h3 className="text-lg font-medium mb-4">{selectedProduct ? 'Edit Product' : 'New Product'}</h3>
                                    <ProductForm
                                        product={selectedProduct}
                                        onSuccess={() => setIsEditingProduct(false)}
                                        onCancel={() => setIsEditingProduct(false)}
                                    />
                                </div>
                            ) : (
                                <ProductList onEdit={handleProductEdit} />
                            )}
                        </div>
                    )}

                    {activeTab === Tab.ORDERS && (
                        <OrderList />
                    )}

                    {activeTab === Tab.CUSTOMERS && (
                        <CustomerList />
                    )}

                    {activeTab === Tab.INQUIRIES && (
                        <InquiryList />
                    )}

                    {activeTab === Tab.ANALYTICS && (
                        <AnalyticsDashboard />
                    )}
                </main>
            </div>
        </div>
    );
}
