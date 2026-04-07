import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
        
        <article className="prose prose-slate prose-emerald max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8"><strong>Last Updated:</strong> April 7, 2026</p>

          <p className="lead text-gray-700">Welcome, this service is operated by <strong>Harsh Raje (individual)</strong>.</p>
          <p className="text-gray-700">This Privacy Policy explains how we handle information when you use our website.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">1. Information We Collect</h2>
          <p className="text-gray-700">Currently, we collect minimal or no personal data.</p>
          <p className="text-gray-700 mb-2">We may automatically collect basic information such as:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Device information</li>
            <li>Pages visited (for analytics purposes)</li>
          </ul>
          <p className="text-gray-700 mb-2">We do NOT collect:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>User accounts</li>
            <li>Login information</li>
            <li>Payment details</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">2. How We Use Information</h2>
          <p className="text-gray-700 mb-2">We use collected data to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>Improve website performance</li>
            <li>Understand usage trends</li>
            <li>Maintain and optimize the service</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">3. Cookies</h2>
          <p className="text-gray-700 mb-2">We may use cookies to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>Enhance user experience</li>
            <li>Analyze traffic</li>
          </ul>
          <p className="text-gray-700">You can disable cookies in your browser settings.</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">4. Third-Party Services</h2>
          <p className="text-gray-700 mb-2">We may use tools like:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>Analytics services (e.g., Google Analytics)</li>
          </ul>
          <p className="text-gray-700">These services may collect limited data as per their own policies.</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">5. Data Security</h2>
          <p className="text-gray-700">We take reasonable steps to protect data, but no method is 100% secure.</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">6. Data Retention</h2>
          <p className="text-gray-700">We retain basic usage data only as long as necessary for analytics and improvement.</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">7. Your Rights</h2>
          <p className="text-gray-700">Since we do not collect personal accounts, there is limited personal data stored.</p>
          <p className="text-gray-700">For any concerns, contact:<br/>
          📧 <strong><a href="mailto:vasamama72@gmail.com" className="text-emerald-600 hover:underline">vasamama72@gmail.com</a></strong></p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">8. Changes to This Policy</h2>
          <p className="text-gray-700">We may update this Privacy Policy anytime. Changes will be posted here.</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">9. Contact</h2>
          <p className="text-gray-700">📧 <strong><a href="mailto:vasamama72@gmail.com" className="text-emerald-600 hover:underline">vasamama72@gmail.com</a></strong></p>
        </article>
      </div>
    </div>
  );
}
