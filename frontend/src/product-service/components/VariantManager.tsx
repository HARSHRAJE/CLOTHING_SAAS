'use client';

import { useEffect, useState } from 'react';
import { Product } from '../models/Product';
import { InventoryTransactionType } from '../models/Inventory';
import { AddVariantRequest, ProductVariant } from '../models/Variant';
import { ProductService } from '../services/ProductService';
import { Image, Plus, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { MediaService } from '@/media-service/services/media.service';

interface VariantManagerProps {
    product: Product;
    onClose: () => void;
}

export function VariantManager({ product, onClose }: VariantManagerProps) {
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const { register, handleSubmit, reset } = useForm<AddVariantRequest>();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

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

    const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            setSelectedFiles((prev) => [...prev, ...files]);
            const previews = files.map((file) => URL.createObjectURL(file));
            setFilePreviews((prev) => [...prev, ...previews]);
        }
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setFilePreviews((prev) => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const onSubmit = async (data: AddVariantRequest) => {
        try {
            setIsUploading(true);
            // 1. Upload each file and collect URLs
            const imageUrls: string[] = [];
            for (const file of selectedFiles) {
                try {
                    const media = await MediaService.uploadMedia(file, 'VARIANT', product.id);
                    imageUrls.push(media.url);
                } catch (uploadError) {
                    console.error('Image upload failed', uploadError);
                }
            }

            // 2. Create the variant with the image URLs
            await ProductService.addVariant(product.id, {
                ...data,
                imageUrls,
            });

            reset();
            setSelectedFiles([]);
            setFilePreviews([]);
            fetchVariants();
        } catch (error) {
            console.error('Failed to add variant', error);
            alert('Failed to add variant');
        } finally {
            setIsUploading(false);
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
            <div className="relative p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Manage Variants - {product.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Add Variant Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="mb-6 bg-gray-50 p-4 rounded-md space-y-3">
                    <div className="flex gap-4 items-end">
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
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Variant Images</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFilesChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-1.5 file:px-3
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                        />
                        {filePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {filePreviews.map((src, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={src} alt={`preview-${idx}`} className="h-16 w-16 rounded object-cover border" />
                                        <button
                                            type="button"
                                            onClick={() => removeSelectedFile(idx)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        {isUploading ? 'Uploading & Saving...' : 'Add Variant'}
                    </button>
                </form>

                {/* Variants List */}
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
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
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="flex gap-1">
                                        {variant.imageUrls && variant.imageUrls.length > 0 ? (
                                            variant.imageUrls.slice(0, 3).map((url, i) => (
                                                <img
                                                    key={i}
                                                    className="h-8 w-8 rounded object-cover border"
                                                    src={MediaService.getMediaUrl(url) || url}
                                                    alt=""
                                                />
                                            ))
                                        ) : (
                                            <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                                                <Image className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                        {variant.imageUrls && variant.imageUrls.length > 3 && (
                                            <span className="text-xs text-gray-500 self-center">+{variant.imageUrls.length - 3}</span>
                                        )}
                                    </div>
                                </td>
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
