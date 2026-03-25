import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSEO } from '@/lib/seo';
import { HiCheckCircle } from 'react-icons/hi';

export const metadata: Metadata = generateSEO({
    title: 'Consultation Submitted',
    description: 'Your consultation request has been submitted successfully.',
    path: '/consultation-success',
});

export default function ConsultationSuccessPage() {
    return (
        <section className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
            <div className="max-w-lg mx-auto px-4 text-center">
                <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 animate-fade-in-up">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <HiCheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 font-[var(--font-heading)] mb-3">Thank You!</h1>
                    <p className="text-slate-600 mb-2">Your consultation request has been submitted successfully.</p>
                    <p className="text-slate-500 text-sm mb-8">Our team will review your requirements and get back to you within <strong className="text-primary-700">24 hours</strong>. Check your email for a confirmation.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/" className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all">
                            Back to Home
                        </Link>
                        <Link href="/services" className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all">
                            View Services
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
