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

import { MediaService } from '@/media-service/services/media.service';

// ... imports remain same ...

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<CreateProductRequest>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(product?.imageUrl ? MediaService.getMediaUrl(product.imageUrl) : null);
    const [isUploading, setIsUploading] = useState(false);

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
                imageUrl: product.imageUrl,
            });
            setPreviewUrl(MediaService.getMediaUrl(product.imageUrl) || null);
        }
    }, [product, reset]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: CreateProductRequest) => {
        try {
            let productId = product?.id;
            let currentImageUrl = product?.imageUrl;

            // 1. Create or Update Product Basics
            if (product) {
                await ProductService.updateProduct(product.id, data);
            } else {
                const newProduct = await ProductService.createProduct(data);
                productId = newProduct.id;
            }

            // 2. Upload Image if selected
            if (selectedFile && productId) {
                setIsUploading(true);
                try {
                    const media = await MediaService.uploadMedia(selectedFile, 'PRODUCT', productId);
                    currentImageUrl = media.url;

                    // 3. Update Product with new Image URL
                    // We need a way to only update the image URL. 
                    // Reuse updateProduct with the new URL and existing data?
                    // Or create a minimal update request.
                    await ProductService.updateProduct(productId, { ...data, imageUrl: currentImageUrl });

                } catch (uploadError) {
                    console.error("Image upload failed", uploadError);
                    alert("Product saved, but image upload failed.");
                } finally {
                    setIsUploading(false);
                }
            }

            onSuccess();
        } catch (error) {
            console.error('Failed to save product', error);
            alert('Failed to save product');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Image Upload Section */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-shrink-0 h-24 w-24 border border-gray-300 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-gray-400 text-xs">No Image</span>
                        )}
                    </div>
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <input
                        type="text"
                        {...register('sku', { required: 'SKU is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                    {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
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
                    disabled={isSubmitting || isUploading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isSubmitting || isUploading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                </button>
            </div>
        </form>
    );
}
