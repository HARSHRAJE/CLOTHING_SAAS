import React, { useEffect, useState } from 'react';
import { Inquiry, InquiryStatus } from '../models/Inquiry';
import { InquiryService } from '../services/InquiryService';

export const InquiryList: React.FC = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filterStatus, setFilterStatus] = useState<InquiryStatus | ''>('');
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

    useEffect(() => {
        fetchInquiries();
    }, [page, filterStatus]);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const status = filterStatus === '' ? undefined : filterStatus;
            const response = await InquiryService.getInquiries(page, 20, status);
            setInquiries(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Failed to fetch inquiries', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (inquiryId: string, newStatus: InquiryStatus) => {
        try {
            const updated = await InquiryService.updateStatus(inquiryId, newStatus);
            setInquiries(inquiries.map(i => i.inquiryId === inquiryId ? updated : i));
            if (selectedInquiry && selectedInquiry.inquiryId === inquiryId) {
                setSelectedInquiry(updated);
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleDelete = async (inquiryId: string) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            await InquiryService.deleteInquiry(inquiryId);
            setInquiries(inquiries.filter(i => i.inquiryId !== inquiryId));
            if (selectedInquiry && selectedInquiry.inquiryId === inquiryId) {
                setSelectedInquiry(null);
            }
        } catch (error) {
            console.error('Failed to delete inquiry', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Inquiries</h1>

            <div className="mb-4">
                <select
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value as InquiryStatus | '');
                        setPage(0);
                    }}
                    className="p-2 border rounded"
                >
                    <option value="">All Statuses</option>
                    <option value={InquiryStatus.NEW}>New</option>
                    <option value={InquiryStatus.CONTACTED}>Contacted</option>
                    <option value={InquiryStatus.CLOSED}>Closed</option>
                </select>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {inquiries.map((inquiry) => (
                                <tr key={inquiry.inquiryId} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedInquiry(inquiry)}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(inquiry.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{inquiry.customerName}</div>
                                        <div className="text-sm text-gray-500">{inquiry.phone}</div>
                                        {inquiry.email && <div className="text-sm text-gray-500">{inquiry.email}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={inquiry.message}>
                                        {inquiry.message || '-'}
                                        {inquiry.productId && <div className="text-xs text-blue-500">Product Inquiry</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${inquiry.status === InquiryStatus.NEW ? 'bg-green-100 text-green-800' :
                                                inquiry.status === InquiryStatus.CONTACTED ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {inquiry.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            value={inquiry.status}
                                            onChange={(e) => handleStatusUpdate(inquiry.inquiryId, e.target.value as InquiryStatus)}
                                            className="mr-2 text-sm border rounded p-1"
                                        >
                                            <option value={InquiryStatus.NEW}>New</option>
                                            <option value={InquiryStatus.CONTACTED}>Contacted</option>
                                            <option value={InquiryStatus.CLOSED}>Closed</option>
                                        </select>
                                        <button onClick={() => handleDelete(inquiry.inquiryId)} className="text-red-600 hover:text-red-900 ml-2">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4 flex justify-between">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span>Page {page + 1} of {totalPages}</span>
                <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* Details Modal */}
            {selectedInquiry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">Inquiry Details</h2>
                            <button onClick={() => setSelectedInquiry(null)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                                    <p className="mt-1">{selectedInquiry.customerName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <p className="mt-1">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <p className="mt-1">{selectedInquiry.phone}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="mt-1">{selectedInquiry.email || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <span className={`mt-1 inline-flex px-2 text-xs leading-5 font-semibold rounded-full 
                                        ${selectedInquiry.status === InquiryStatus.NEW ? 'bg-green-100 text-green-800' :
                                            selectedInquiry.status === InquiryStatus.CONTACTED ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                        {selectedInquiry.status}
                                    </span>
                                </div>
                                {selectedInquiry.productId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Product ID</label>
                                        <p className="mt-1 text-blue-600">{selectedInquiry.productId}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message</label>
                                <div className="mt-1 p-3 bg-gray-50 rounded text-gray-800 whitespace-pre-wrap">
                                    {selectedInquiry.message}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            {selectedInquiry.status === InquiryStatus.NEW && (
                                <button
                                    onClick={() => handleStatusUpdate(selectedInquiry.inquiryId, InquiryStatus.CONTACTED)}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    Mark as Contacted
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedInquiry(null)}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
