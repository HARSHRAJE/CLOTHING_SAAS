'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateProductRequest, Product } from '../models/Product';
import { ProductService } from '../services/ProductService';
import { Category } from '../models/Category';
import { CategoryService } from '../services/CategoryService';

interface ProductFormProps {
    product?: Product;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateProductRequest>();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        CategoryService.getAllCategories().then(setCategories).catch(console.error);
    }, []);

    useEffect(() => {
        if (product) {
            reset({
                categoryId: product.category?.id,
                name: product.name,
                description: product.description,
                price: product.price,
                costPrice: product.costPrice,
                sku: product.sku,
            });
        }
    }, [product, reset]);

    const onSubmit = async (data: CreateProductRequest) => {
        try {
            if (product) {
                await ProductService.updateProduct(product.id, data);
            } else {
                await ProductService.createProduct(data);
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save product', error);
            alert('Failed to save product');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <div className="bg-gray-50 p-2 rounded">
                    {categories.length === 0 ? (
                        <div className="text-sm text-amber-600">
                            No categories found. You need to create a category first.
                        </div>
                    ) : (
                        <select
                            {...register('categoryId', { required: 'Category is required' })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('price', { required: 'Price is required', min: 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cost Price</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('costPrice', { min: 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>
            </div>

            {!product && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Initial Stock</label>
                    <input
                        type="number"
                        {...register('stock', { min: 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    {...register('description')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
            </div>

            <p className="text-xs text-gray-500 italic">
                💡 Images are now managed per variant. After creating the product, use "Manage Variants" to add images for each colour/size.
            </p>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                </button>
            </div>
        </form>
    );
}
