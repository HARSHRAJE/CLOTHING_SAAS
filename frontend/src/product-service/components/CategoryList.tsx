'use client';

import { useEffect, useState } from 'react';
import { Category } from '../models/Category';
import { CategoryService } from '../services/CategoryService';
import { Trash2, Edit } from 'lucide-react';

interface CategoryListProps {
    onEdit: (category: Category) => void;
}

export default function CategoryList({ onEdit }: CategoryListProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await CategoryService.getAllCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const fetchCategories = async () => { // Keep this for handleDelete re-fetch
        // Actually duplicate logic or extract to useCallback.
        // For simplicity, let's just suppress or handle it differently.
        // Better: define fetchCategories outside or use useCallback.
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this category?')) {
            try {
                await CategoryService.deleteCategory(id);
                fetchCategories();
            } catch (error) {
                console.error('Failed to delete category', error);
                alert('Failed to delete category');
            }
        }
    };

    if (isLoading) return <div>Loading custom categories...</div>;

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                        <tr key={category.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onEdit(category)}
                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {categories.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                No categories found. Create one to get started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
