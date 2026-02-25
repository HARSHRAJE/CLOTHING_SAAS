'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ContactUsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [form, setForm] = useState({
        customerName: '',
        email: '',
        phone: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.customerName || !form.email || !form.message) {
            setError('Please fill out all required fields.');
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API}/store/${slug}/inquiries`, {
                customerName: form.customerName,
                email: form.email,
                phone: form.phone,
                message: form.message
                // productId is intentionally omitted since this is a general inquiry
            });
            setSuccess(true);
            setForm({ customerName: '', email: '', phone: '', message: '' });
        } catch (err) {
            setError('Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center p-8">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mb-6" />
                <h1 className="text-4xl font-serif text-[#1a1a1a] mb-4">Message Sent</h1>
                <p className="text-gray-500 font-mono text-center max-w-md mb-8">
                    Thank you for reaching out to us. Our customer care team will get back to you shortly at {form.email || 'your email'}.
                </p>
                <Link href={`/store/${slug}`} className="bg-[#1a1a1a] text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-black transition-colors">
                    Back to Store
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f8f8] flex flex-col relative">
            <header className="w-full bg-[#f4f4f4] py-12 px-8 flex items-center justify-center relative border-b border-gray-200/50">
                <button onClick={() => router.back()} className="absolute left-8 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full transition">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-4xl font-serif text-[#1a1a1a] tracking-wide">Contact Us</h1>
            </header>

            <main className="flex-1 max-w-2xl w-full mx-auto px-8 py-16">
                <div className="bg-white p-8 md:p-12 shadow-sm border border-gray-100">
                    <p className="text-sm font-mono text-gray-500 mb-8 leading-relaxed">
                        Have a question about an order, our products, or just want to say hello? Fill out the form below and we'll get back to you via email.
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 mb-6 text-sm flex items-start gap-2 border border-red-100">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold tracking-[0.1em] text-gray-800 uppercase mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={form.customerName}
                                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                                className="w-full border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-mono text-sm"
                                placeholder="Your name"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] font-bold tracking-[0.1em] text-gray-800 uppercase mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-mono text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold tracking-[0.1em] text-gray-800 uppercase mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="w-full border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-mono text-sm"
                                    placeholder="+1 (234) 567-8900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold tracking-[0.1em] text-gray-800 uppercase mb-2">
                                Message *
                            </label>
                            <textarea
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                rows={5}
                                className="w-full border border-gray-300 p-4 bg-transparent focus:outline-none focus:border-black transition-colors font-mono text-sm resize-y"
                                placeholder="How can we help you?"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1a1a1a] text-white py-4 font-bold tracking-widest uppercase text-[11px] hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                'Sending...'
                            ) : (
                                <>
                                    <span>Send Message</span>
                                    <Send className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
