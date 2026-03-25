import type { Metadata } from 'next';
import ConsultationForm from '@/components/ConsultationForm';
import { generateSEO } from '@/lib/seo';
import { HiShieldCheck, HiClock, HiLockClosed } from 'react-icons/hi';

export const metadata: Metadata = generateSEO({
    title: 'Free Consultation',
    description: 'Request a free academic consultation. Tell us about your thesis, research paper, or project and get expert guidance tailored to your needs.',
    path: '/consultation',
});

export default function ConsultationPage() {
    return (
        <>
            <section className="hero-gradient pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-sm font-medium rounded-full mb-4">Free Consultation</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-heading)] mb-4">Get Expert Academic Guidance</h1>
                    <p className="text-primary-200 text-lg max-w-2xl mx-auto">Fill out the form below and our team will review your requirements within 24 hours.</p>
                </div>
            </section>

            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-10">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                <h2 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)] mb-6">Consultation Request</h2>
                                <ConsultationForm />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {[
                                { icon: HiClock, title: '24-Hour Response', desc: 'Our team reviews every submission within 24 hours and provides a detailed response.' },
                                { icon: HiShieldCheck, title: '100% Confidential', desc: 'Your information is encrypted and never shared with any third parties.' },
                                { icon: HiLockClosed, title: 'Secure Upload', desc: 'Files are encrypted with AES-256 before storage. No public access links.' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                                            <item.icon className="w-5 h-5 text-primary-700" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                                            <p className="text-slate-600 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
