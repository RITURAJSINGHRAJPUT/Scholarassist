import type { Metadata } from 'next';
import Link from 'next/link';
import { HiAcademicCap, HiDocumentText, HiPencilAlt } from 'react-icons/hi';
import ServiceCard from '@/components/ServiceCard';
import { generateSEO, generateServiceSchema } from '@/lib/seo';

export const metadata: Metadata = generateSEO({
    title: 'Academic Services',
    description: 'Comprehensive academic support services including thesis assistance, research paper support, and essay & project help.',
    path: '/services',
});

export default function ServicesPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateServiceSchema('Academic Assistance Services', 'Comprehensive academic guidance and support services')) }} />

            {/* Hero */}
            <section className="hero-gradient pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-sm font-medium rounded-full mb-4">Our Services</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-heading)] mb-4">Academic Services</h1>
                    <p className="text-primary-200 text-lg max-w-2xl mx-auto">Expert guidance and support across all academic disciplines and levels. Choose the service that fits your needs.</p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ServiceCard
                            title="Thesis Assistance"
                            description="Comprehensive guidance for your thesis from conception to completion. Our expert advisors help with topic selection, research methodology, literature review, and more."
                            icon={HiAcademicCap}
                            href="/services/thesis"
                            features={['Topic Selection & Refinement', 'Research Design & Methodology', 'Literature Review Support', 'Writing & Structure Guidance', 'Defense Preparation']}
                        />
                        <ServiceCard
                            title="Research Paper Support"
                            description="Professional research paper guidance covering methodology, data analysis, citation formatting, and preparation for journal submission."
                            icon={HiDocumentText}
                            href="/services/research-paper"
                            features={['Research Question Development', 'Statistical Analysis Guidance', 'APA/MLA/Chicago Formatting', 'Peer Review Preparation', 'Publication Strategy']}
                        />
                        <ServiceCard
                            title="Essay & Project Help"
                            description="Expert assistance with essays, assignments, and project documentation across all academic disciplines and levels."
                            icon={HiPencilAlt}
                            href="/services/essay-project"
                            features={['Essay Structure & Outline', 'Argument Development', 'Project Documentation', 'Presentation Support', 'Quality Review & Feedback']}
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-[var(--font-heading)]">Why Choose ScholarAssist?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: 'Expert Advisors', desc: 'PhD-qualified advisors across multiple disciplines with years of academic experience.' },
                            { title: 'Personalized Support', desc: 'Tailored guidance plans based on your specific project requirements and goals.' },
                            { title: '100% Confidential', desc: 'Your personal information and project details are always kept strictly private.' },
                            { title: 'Timely Delivery', desc: 'We respect your deadlines and ensure guidance is provided within agreed timelines.' },
                        ].map((item, i) => (
                            <div key={i} className="text-center p-6">
                                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-primary-700 font-bold text-lg">{i + 1}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-primary-50">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-[var(--font-heading)] mb-4">Not Sure Which Service You Need?</h2>
                    <p className="text-slate-600 mb-8">Get a free consultation and our team will recommend the best approach for your academic project.</p>
                    <Link href="/consultation" className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg inline-block">
                        Get Free Consultation
                    </Link>
                </div>
            </section>
        </>
    );
}
