'use client';

import { useEffect, useState } from 'react';
import { Product } from '../models/Product';
import { InventoryTransactionType } from '../models/Inventory';
import { AddVariantRequest, ProductVariant } from '../models/Variant';
import { ProductService } from '../services/ProductService';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface VariantManagerProps {
    product: Product;
    onClose: () => void;
}

export function VariantManager({ product, onClose }: VariantManagerProps) {
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const { register, handleSubmit, reset } = useForm<AddVariantRequest>();

    const fetchVariants = async () => {
        try {
            const data = await ProductService.getVariants(product.id);
            setVariants(data);
        } catch (error) {
            console.error('Failed to fetch variants', error);
        }
    };

    useEffect(() => {
        fetchVariants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.id]);

    const onSubmit = async (data: AddVariantRequest) => {
        try {
            await ProductService.addVariant(product.id, data);
            reset();
            fetchVariants();
        } catch (error) {
            console.error('Failed to add variant', error);
            alert('Failed to add variant');
        }
    };

    const handleStockUpdate = async (variantId: string, change: number) => {
        try {
            await ProductService.updateStock(variantId, {
                quantityChange: change,
                type: InventoryTransactionType.MANUAL,
                referenceId: 'Manual Update'
            });
            fetchVariants();
        } catch (error) {
            console.error('Failed to update stock', error);
            alert('Failed to update stock');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Manage Variants - {product.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Add Variant Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="mb-6 bg-gray-50 p-4 rounded-md flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Size</label>
                        <input {...register('size', { required: true })} className="mt-1 block w-20 rounded-md border-gray-300 border p-1" placeholder="L" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Color</label>
                        <input {...register('color', { required: true })} className="mt-1 block w-24 rounded-md border-gray-300 border p-1" placeholder="Blue" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price (Opt)</label>
                        <input {...register('price')} type="number" step="0.01" className="mt-1 block w-24 rounded-md border-gray-300 border p-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <input {...register('stock', { required: true, min: 0 })} type="number" className="mt-1 block w-20 rounded-md border-gray-300 border p-1" />
                    </div>
                    <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                        <Plus className="w-5 h-5" />
                    </button>
                </form>

                {/* Variants List */}
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {variants.map((variant) => (
                            <tr key={variant.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{variant.size}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{variant.color}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {variant.price ? `$${variant.price}` : <span className="text-gray-400">Default</span>}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{variant.stock}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleStockUpdate(variant.id, 1)}
                                        className="text-green-600 hover:text-green-900 mr-2"
                                        title="Add Stock"
                                    >
                                        +1
                                    </button>
                                    <button
                                        onClick={() => handleStockUpdate(variant.id, -1)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Reduce Stock"
                                    >
                                        -1
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
