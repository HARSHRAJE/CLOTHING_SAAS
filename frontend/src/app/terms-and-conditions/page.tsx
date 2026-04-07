import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
        
        <article className="prose prose-slate prose-emerald max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mb-8"><strong>Last Updated:</strong> April 7, 2026</p>

          <p className="lead text-gray-700">Welcome, this service is operated by <strong>Harsh Raje (individual)</strong>.</p>
          <p className="text-gray-700">By using this website, you agree to these Terms.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">1. Use of Service</h2>
          <p className="text-gray-700 mb-2">You agree NOT to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>Use the service for illegal purposes</li>
            <li>Attempt to disrupt or harm the website</li>
            <li>Copy or misuse content</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">2. Nature of Service</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>This is a basic SaaS platform currently provided without user accounts or paid features</li>
            <li>Features may change or be updated at any time</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">3. No Guarantees</h2>
          <p className="text-gray-700 mb-2">We do not guarantee:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>Continuous availability</li>
            <li>Error-free performance</li>
          </ul>
          <p className="text-gray-700 text-sm italic">The service is provided &quot;as is&quot;</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">4. Limitation of Liability</h2>
          <p className="text-gray-700 mb-2">Harsh Raje is not responsible for:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
            <li>Any losses or damages from using the service</li>
            <li>Downtime or technical issues</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">5. Intellectual Property</h2>
          <p className="text-gray-700">All content and code belong to the service and may not be copied without permission.</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">6. Termination</h2>
          <p className="text-gray-700">We may restrict or block access if misuse is detected.</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">7. Changes to Terms</h2>
          <p className="text-gray-700">We may update these Terms anytime. Continued use means acceptance.</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">8. Governing Law</h2>
          <p className="text-gray-700">These Terms are governed by the laws of <strong>India</strong>.</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">9. Contact</h2>
          <p className="text-gray-700">📧 <strong><a href="mailto:vasamama72@gmail.com" className="text-emerald-600 hover:underline">vasamama72@gmail.com</a></strong></p>
        </article>
      </div>
    </div>
  );
}
