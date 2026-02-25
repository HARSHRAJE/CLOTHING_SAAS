import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/auth-service/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function SettingsForm() {
    const { user } = useAuth();
    const [shopDetails, setShopDetails] = useState({
        name: '',
        slug: '',
        phone: '',
        email: '',
        address: '',
        instagramUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user?.shopId) {
            fetchShopDetails();
        }
    }, [user]);

    const fetchShopDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // Assuming the owner-specific shop endpoint or fetching via slug if we have it
            // We use the authenticated endpoint to get full details
            const res = await axios.get(`${API}/shop/owner/details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShopDetails({
                name: res.data.name || '',
                slug: res.data.slug || '',
                phone: res.data.phone || '',
                email: res.data.email || '',
                address: res.data.address || '',
                instagramUrl: res.data.instagramUrl || ''
            });
        } catch (error) {
            console.error('Failed to fetch shop details', error);
            // Fallback: try by slug if endpoint differs
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            // PUT request to update shop details
            await axios.put(`${API}/shop/owner/update`, {
                name: shopDetails.name,
                slug: shopDetails.slug,
                phone: shopDetails.phone,
                email: shopDetails.email,
                address: shopDetails.address,
                instagramUrl: shopDetails.instagramUrl
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Shop contact details updated successfully.' });
        } catch (error) {
            console.error('Failed to update shop details', error);
            setMessage({ type: 'error', text: 'Failed to update shop details. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading shop settings...</div>;

    return (
        <div className="max-w-2xl bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Contact & Location Settings</h2>

            {message.text && (
                <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                        <input
                            type="text"
                            value={shopDetails.name}
                            onChange={(e) => setShopDetails({ ...shopDetails, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="My Store"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Slug (URL)</label>
                        <input
                            type="text"
                            value={shopDetails.slug}
                            onChange={(e) => setShopDetails({ ...shopDetails, slug: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                            disabled
                            title="Slug cannot be changed here"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Support Email</label>
                        <input
                            type="email"
                            value={shopDetails.email}
                            onChange={(e) => setShopDetails({ ...shopDetails, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="support@mystore.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Support Phone</label>
                        <input
                            type="tel"
                            value={shopDetails.phone}
                            onChange={(e) => setShopDetails({ ...shopDetails, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Location / Address</label>
                    <textarea
                        value={shopDetails.address}
                        onChange={(e) => setShopDetails({ ...shopDetails, address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="123 Commerce St, City, Country, Zip Code"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                    <input
                        type="url"
                        value={shopDetails.instagramUrl}
                        onChange={(e) => setShopDetails({ ...shopDetails, instagramUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://instagram.com/yourstore"
                    />
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
