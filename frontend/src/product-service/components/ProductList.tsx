'use client';

import { useEffect, useState } from 'react';
import { Product } from '../models/Product';
import { ProductService } from '../services/ProductService';
import { Edit, Layers, Trash2 } from 'lucide-react';
import { VariantManager } from '@/product-service/components/VariantManager';
import { MediaService } from '@/media-service/services/media.service';

interface ProductListProps {
    onEdit: (product: Product) => void;
}

/**
 * Returns the first image URL available from any variant of the product.
 */
function getProductThumbnail(product: Product): string | null {
    if (product.variants) {
        for (const variant of product.variants) {
            if (variant.imageUrls && variant.imageUrls.length > 0) {
                return variant.imageUrls[0];
            }
        }
    }
    return null;
}

export default function ProductList({ onEdit }: ProductListProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);

    const fetchProducts = async () => {
        try {
            const data = await ProductService.getProducts();
            setProducts(data.content);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await ProductService.deleteProduct(id);
                fetchProducts();
            } catch (error) {
                console.error('Failed to delete product', error);
                alert('Failed to delete product');
            }
        }
    };

    if (isLoading) return <div>Loading products...</div>;

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => {
                        const thumb = getProductThumbnail(product);
                        return (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {thumb ? (
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={MediaService.getMediaUrl(thumb) || thumb}
                                                    alt=""
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-xs text-gray-500">No Img</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500">{product.category?.name}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                                    {product.costPrice && product.costPrice > product.price && (
                                        <span className="text-gray-400 line-through">₹{product.costPrice}</span>
                                    )}
                                    <span className="font-semibold text-gray-900">₹{product.price}</span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => setSelectedProductForVariants(product)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                        title="Manage Variants"
                                    >
                                        <Layers className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                No products found. Create one to get started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedProductForVariants && (
                <VariantManager
                    product={selectedProductForVariants}
                    onClose={() => setSelectedProductForVariants(null)}
                />
            )}
        </div>
    );
}
