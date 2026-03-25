import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSEO } from '@/lib/seo';
import FAQAccordion from '@/components/FAQAccordion';

export const metadata: Metadata = generateSEO({
    title: 'Thesis Assistance',
    description: 'Expert thesis writing guidance from topic selection to defense preparation. Get personalized support for your master\'s or doctoral thesis.',
    path: '/services/thesis',
});

const features = [
    { title: 'Topic Selection & Refinement', desc: 'Our advisors help you identify compelling research topics that align with your academic interests and career goals.' },
    { title: 'Research Design & Methodology', desc: 'Get expert guidance on choosing the right research methodology, designing experiments, and planning your data collection.' },
    { title: 'Literature Review', desc: 'Comprehensive support in identifying, analyzing, and synthesizing relevant academic literature for your thesis.' },
    { title: 'Writing & Structure', desc: 'Expert guidance on organizing your thesis, developing arguments, and maintaining academic writing standards.' },
    { title: 'Statistical Analysis', desc: 'Support with quantitative and qualitative data analysis using appropriate statistical methods and tools.' },
    { title: 'Defense Preparation', desc: 'Practice sessions and guidance to help you confidently present and defend your thesis before a review committee.' },
];

const faqs = [
    { question: 'How long does thesis guidance typically take?', answer: 'The duration varies by scope. A master\'s thesis usually requires 3-6 months of guidance, while a doctoral dissertation may need 6-12 months. We adapt to your timeline and deadlines.' },
    { question: 'Can you help with a thesis that is already in progress?', answer: 'Absolutely! We can join at any stage—whether you need help with your proposal, are stuck on methodology, or need guidance on your final draft.' },
    { question: 'What disciplines do you cover?', answer: 'We cover a wide range including STEM, humanities, social sciences, business, healthcare, education, and more. Our diverse team ensures we can match you with an expert in your field.' },
];

export default function ThesisPage() {
    return (
        <>
            <section className="hero-gradient pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-sm font-medium rounded-full mb-4">Thesis Assistance</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-heading)] mb-4">Master Your Thesis</h1>
                    <p className="text-primary-200 text-lg max-w-2xl mx-auto">Expert guidance from topic selection to successful defense. Let our PhD-qualified advisors guide you through every stage.</p>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-slate-900 font-[var(--font-heading)]">What We Offer</h2>
                        <p className="text-slate-600 mt-3 max-w-2xl mx-auto">Comprehensive thesis support covering every aspect of the research and writing process.</p>
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
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-slate-900 text-center mb-8 font-[var(--font-heading)]">Frequently Asked Questions</h2>
                    <FAQAccordion items={faqs} />
                </div>
            </section>

            <section className="py-16 hero-gradient">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white font-[var(--font-heading)] mb-4">Ready to Start Your Thesis Journey?</h2>
                    <p className="text-primary-200 mb-8">Get matched with an expert advisor in your field today.</p>
                    <Link href="/consultation" className="px-8 py-4 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-xl inline-block">
                        Get Free Consultation
                    </Link>
                </div>
            </section>
        </>
    );
}
