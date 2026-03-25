import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSEO } from '@/lib/seo';
import FAQAccordion from '@/components/FAQAccordion';

export const metadata: Metadata = generateSEO({
    title: 'Research Paper Support',
    description: 'Professional guidance for research papers including methodology, data analysis, citation formatting, and journal submission preparation.',
    path: '/services/research-paper',
});

const features = [
    { title: 'Research Question Development', desc: 'Assistance in formulating clear, focused research questions that drive meaningful academic inquiry.' },
    { title: 'Methodology Guidance', desc: 'Expert advice on selecting and implementing appropriate research methodologies for your study.' },
    { title: 'Data Analysis Support', desc: 'Guidance on statistical analysis, qualitative coding, and data interpretation using industry-standard tools.' },
    { title: 'Citation & Formatting', desc: 'Ensuring your paper meets APA, MLA, Chicago, Harvard, or any other citation standard required.' },
    { title: 'Peer Review Preparation', desc: 'Feedback and revision guidance to prepare your paper for rigorous academic peer review.' },
    { title: 'Publication Strategy', desc: 'Advice on selecting appropriate journals and navigating the submission and review process.' },
];

const faqs = [
    { question: 'What citation styles do you support?', answer: 'We support all major citation styles including APA, MLA, Chicago, Harvard, IEEE, Vancouver, and more. Our advisors are well-versed in current edition requirements.' },
    { question: 'Can you help with conference papers?', answer: 'Yes, we provide guidance for conference papers including abstract writing, poster preparation, and presentation coaching.' },
    { question: 'Do you assist with systematic reviews?', answer: 'Absolutely. We guide you through the systematic review process including search strategy, screening criteria, data extraction, and synthesis.' },
];

export default function ResearchPaperPage() {
    return (
        <>
            <section className="hero-gradient pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-sm font-medium rounded-full mb-4">Research Paper Support</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-heading)] mb-4">Publish with Confidence</h1>
                    <p className="text-primary-200 text-lg max-w-2xl mx-auto">From research design to journal submission, get expert support for producing high-quality academic research papers.</p>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-slate-900 font-[var(--font-heading)]">Our Research Paper Services</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100 card-hover">
                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                                    <span className="text-primary-700 font-bold">{i + 1}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-slate-50">
                <div className="max-w-3xl mx-auto px-4"><h2 className="text-2xl font-bold text-slate-900 text-center mb-8 font-[var(--font-heading)]">Frequently Asked Questions</h2><FAQAccordion items={faqs} /></div>
            </section>

            <section className="py-16 hero-gradient">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white font-[var(--font-heading)] mb-4">Ready to Publish Your Research?</h2>
                    <p className="text-primary-200 mb-8">Connect with a research advisor who specializes in your field.</p>
                    <Link href="/consultation" className="px-8 py-4 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-xl inline-block">Get Free Consultation</Link>
                </div>
            </section>
        </>
    );
}
