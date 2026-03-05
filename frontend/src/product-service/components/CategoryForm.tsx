'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Category, CreateCategoryRequest } from '../models/Category';
import { CategoryService } from '../services/CategoryService';

interface CategoryFormProps {
    category?: Category;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateCategoryRequest>();

    useEffect(() => {
        if (category) {
            reset({
                name: category.name,
                description: category.description,
                targetGender: category.targetGender
            });
        } else {
            reset({
                targetGender: 'UNISEX'
            });
        }
    }, [category, reset]);

    const onSubmit = async (data: CreateCategoryRequest) => {
        try {
            if (category) {
                await CategoryService.updateCategory(category.id, data);
            } else {
                await CategoryService.createCategory(data);
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save category', error);
            alert('Failed to save category');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    {...register('description')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Target Gender</label>
                <select
                    {...register('targetGender', { required: 'Target Gender is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
                >
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="UNISEX">Unisex</option>
                </select>
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
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
                </button>
            </div>
        </form>
    );
}
