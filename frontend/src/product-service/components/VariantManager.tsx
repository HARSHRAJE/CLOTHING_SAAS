'use client';

import { useEffect, useState } from 'react';
import { Product } from '../models/Product';
import { InventoryTransactionType } from '../models/Inventory';
import { AddVariantRequest, ProductVariant } from '../models/Variant';
import { ProductService } from '../services/ProductService';
import { Image, Plus, Trash2, X, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { MediaService } from '@/media-service/services/media.service';

interface VariantManagerProps {
    product: Product;
    onClose: () => void;
}

export function VariantManager({ product, onClose }: VariantManagerProps) {
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    
    // Form and standard upload state
    const { register, handleSubmit, reset, setValue } = useForm<AddVariantRequest>();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Edit state
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
    const [existingImages, setExistingImages] = useState<string[]>([]);

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

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const startEdit = (variant: ProductVariant) => {
        setEditingVariant(variant);
        setExistingImages(variant.imageUrls || []);
        setSelectedFiles([]);
        setFilePreviews([]);
        
        setValue('size', variant.size);
        setValue('color', variant.color);
        setValue('price', variant.price);
        setValue('stock', variant.stock); // Stock input will be disabled/hidden in edit mode, but good to populate
    };

    const cancelEdit = () => {
        setEditingVariant(null);
        setExistingImages([]);
        setSelectedFiles([]);
        setFilePreviews([]);
        reset();
    };

    const onSubmit = async (data: AddVariantRequest) => {
        try {
            setIsUploading(true);
            
            // 1. Upload any new files and collect URLs
            const newImageUrls: string[] = [];
            for (const file of selectedFiles) {
                try {
                    const media = await MediaService.uploadMedia(file, 'VARIANT', product.id);
                    newImageUrls.push(media.url);
                } catch (uploadError) {
                    console.error('Image upload failed', uploadError);
                }
            }

            if (editingVariant) {
                // Combine retained old images with brand new ones for the full replacement payload
                const combinedUrls = [...existingImages, ...newImageUrls];
                await ProductService.updateVariant(editingVariant.id, {
                    size: data.size,
                    color: data.color,
                    price: data.price,
                    imageUrls: combinedUrls
                });
            } else {
                // Create mode
                await ProductService.addVariant(product.id, {
                    ...data,
                    imageUrls: newImageUrls,
                });
            }

            cancelEdit();
            fetchVariants();
        } catch (error) {
            console.error('Failed to save variant', error);
            alert('Failed to save variant');
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

    // Note: No backend endpoint exists for deleting variants yet.
    // If you need delete, it would require a DELETE /variants/{variantId} mapping in backend.

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Manage Variants - {product.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Add/Edit Variant Form */}
                <form onSubmit={handleSubmit(onSubmit)} className={`mb-6 p-4 rounded-md space-y-3 ${editingVariant ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className={`text-md font-semibold ${editingVariant ? 'text-amber-800' : 'text-gray-700'}`}>
                            {editingVariant ? 'Edit Variant' : 'Add New Variant'}
                        </h4>
                        {editingVariant && (
                            <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-700 underline">
                                Cancel Edit
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-sm font-medium text-gray-700">Size</label>
                            <input {...register('size', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 border p-1.5" placeholder="L" />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-sm font-medium text-gray-700">Color</label>
                            <input {...register('color', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 border p-1.5" placeholder="Blue" />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-sm font-medium text-gray-700">Override Price (Opt)</label>
                            <input {...register('price')} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 border p-1.5" placeholder="Default" />
                        </div>
                        {!editingVariant && (
                            <div className="flex-1 min-w-[100px]">
                                <label className="block text-sm font-medium text-gray-700">Init Stock</label>
                                <input {...register('stock', { required: true, min: 0 })} type="number" className="mt-1 block w-full rounded-md border-gray-300 border p-1.5" />
                            </div>
                        )}
                    </div>

                    {/* Image Management Section */}
                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Variant Images</label>
                        
                        {(existingImages.length > 0 || filePreviews.length > 0) && (
                            <div className="flex flex-wrap gap-3 mb-3">
                                {/* Existing Images (Edit mode) */}
                                {existingImages.map((url, idx) => (
                                    <div key={`exist-${idx}`} className="relative group ring-2 ring-transparent hover:ring-red-300 rounded-md transition-all">
                                        <img src={MediaService.getMediaUrl(url) || url} alt={`existing-${idx}`} className="h-20 w-20 rounded-md object-cover border" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(idx)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            title="Remove image"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {/* New Image Previews */}
                                {filePreviews.map((src, idx) => (
                                    <div key={`new-${idx}`} className="relative group ring-2 ring-emerald-400 rounded-md">
                                        <span className="absolute bottom-1 right-1 bg-emerald-500 text-white text-[10px] px-1 rounded shadow">New</span>
                                        <img src={src} alt={`preview-${idx}`} className="h-20 w-20 rounded-md object-cover border border-emerald-300" />
                                        <button
                                            type="button"
                                            onClick={() => removeSelectedFile(idx)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFilesChange}
                                className="block w-full text-sm text-gray-500 max-w-sm
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-medium
                                    file:bg-indigo-50 file:text-indigo-700
                                    hover:file:bg-indigo-100 cursor-pointer"
                            />
                            <button
                                type="submit"
                                disabled={isUploading}
                                className={`px-6 py-2 rounded-md font-medium text-white shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 ${editingVariant ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {isUploading ? 'Saving...' : editingVariant ? 'Save Changes' : (
                                    <><Plus className="w-4 h-4" /> Add Variant</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Variants List */}
                <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {variants.map((variant) => (
                                <tr key={variant.id} className={editingVariant?.id === variant.id ? 'bg-amber-50' : ''}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex gap-1">
                                            {variant.imageUrls && variant.imageUrls.length > 0 ? (
                                                variant.imageUrls.slice(0, 3).map((url, i) => (
                                                    <img
                                                        key={i}
                                                        className="h-10 w-10 rounded-md object-cover border shadow-sm"
                                                        src={MediaService.getMediaUrl(url) || url}
                                                        alt=""
                                                    />
                                                ))
                                            ) : (
                                                <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                                                    <Image className="w-4 h-4 text-gray-400" />
                                                </div>
                                            )}
                                            {variant.imageUrls && variant.imageUrls.length > 3 && (
                                                <span className="text-xs text-gray-500 bg-gray-100 rounded-md h-10 px-2 flex items-center border shadow-sm">
                                                    +{variant.imageUrls.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{variant.size}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{variant.color}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {variant.price ? `₹${variant.price}` : <span className="text-gray-400">Default</span>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        <div className="flex items-center gap-3">
                                            <span className={(variant.stock ?? 0) <= 5 ? 'text-red-600 font-bold' : ''}>
                                                {variant.stock}
                                            </span>
                                            <div className="flex flex-col gap-1">
                                                <button onClick={() => handleStockUpdate(variant.id, 1)} className="text-xs bg-green-100 text-green-700 px-1.5 rounded hover:bg-green-200">+</button>
                                                <button onClick={() => handleStockUpdate(variant.id, -1)} className="text-xs bg-red-100 text-red-700 px-1.5 rounded hover:bg-red-200">-</button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end h-full min-h-[50px] gap-4">
                                        <button
                                            onClick={() => startEdit(variant)}
                                            className={`text-amber-600 hover:text-amber-900 flex items-center gap-1 transition-opacity ${editingVariant?.id === variant.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title="Edit Variant & Photos"
                                            disabled={editingVariant?.id === variant.id}
                                        >
                                            <Edit2 className="w-4 h-4" /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {variants.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No variants created yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
