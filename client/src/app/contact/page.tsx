import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import ContactForm from '@/components/ContactForm';
import { HiMail, HiPhone, HiLocationMarker, HiClock } from 'react-icons/hi';

export const metadata: Metadata = generateSEO({
    title: 'Contact Us',
    description: 'Get in touch with ScholarAssist. We\'re here to answer your questions and help you get started with academic guidance.',
    path: '/contact',
});

export default function ContactPage() {
    return (
        <>
            <section className="hero-gradient pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-sm font-medium rounded-full mb-4">Contact Us</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-heading)] mb-4">Get in Touch</h1>
                    <p className="text-primary-200 text-lg max-w-2xl mx-auto">Have a question? We&apos;re here to help. Reach out and we&apos;ll respond within 24 hours.</p>
                </div>
            </section>

            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)] mb-6">Send Us a Message</h2>
                            <ContactForm />
                        </div>
                        <div className="space-y-6">
                            {[
                                { icon: HiMail, title: 'Email', info: 'contact@scholarassist.com' },
                                { icon: HiPhone, title: 'Phone', info: '+91 9979550377' },
                                { icon: HiLocationMarker, title: 'Address', info: 'Surat, Gujarat, India' },
                                { icon: HiClock, title: 'Hours', info: 'Mon - Fri: 9AM - 6PM IST' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                                            <item.icon className="w-5 h-5 text-primary-700" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                                            <p className="text-slate-600 text-sm">{item.info}</p>
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
