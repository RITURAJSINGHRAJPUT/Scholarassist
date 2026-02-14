import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSEO } from '@/lib/seo';
import FAQAccordion from '@/components/FAQAccordion';

export const metadata: Metadata = generateSEO({
    title: 'Essay & Project Help',
    description: 'Professional guidance for essays, assignments, and project documentation. Expert support to help you produce high-quality academic work.',
    path: '/services/essay-project',
});

const features = [
    { title: 'Essay Structure & Outline', desc: 'Get help creating a logical, well-organized essay structure that effectively communicates your arguments.' },
    { title: 'Argument Development', desc: 'Expert guidance on building strong, evidence-based arguments that meet academic standards.' },
    { title: 'Project Documentation', desc: 'Professional assistance with project reports, capstone documentation, and technical writing.' },
    { title: 'Presentation Support', desc: 'Help creating compelling presentations with effective slides and confident delivery techniques.' },
    { title: 'Proofreading & Editing Guidance', desc: 'Learn techniques for self-editing and improving the clarity, coherence, and quality of your writing.' },
    { title: 'Multi-Format Support', desc: 'Guidance for various formats including case studies, lab reports, reflective journals, and proposals.' },
];

const faqs = [
    { question: 'What types of essays do you support?', answer: 'We provide guidance for argumentative, analytical, narrative, expository, comparative, and reflective essays across all academic disciplines.' },
    { question: 'Can you help with group projects?', answer: 'Yes, we offer coordination guidance for group projects including task division, collaboration strategies, and document integration.' },
    { question: 'Do you provide guidance in specific subject areas?', answer: 'Yes, our team covers a wide range of subjects including sciences, humanities, business, engineering, arts, education, and more.' },
];

export default function EssayProjectPage() {
    return (
        <>
            <section className="hero-gradient pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-sm font-medium rounded-full mb-4">Essay & Project Help</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-heading)] mb-4">Ace Your Assignments</h1>
                    <p className="text-primary-200 text-lg max-w-2xl mx-auto">Expert guidance for essays, projects, and academic assignments. Get the support you need to produce outstanding work.</p>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14"><h2 className="text-3xl font-bold text-slate-900 font-[var(--font-heading)]">Our Essay & Project Services</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100 card-hover">
                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mb-4"><span className="text-primary-700 font-bold">{i + 1}</span></div>
                                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-slate-50"><div className="max-w-3xl mx-auto px-4"><h2 className="text-2xl font-bold text-slate-900 text-center mb-8 font-[var(--font-heading)]">Frequently Asked Questions</h2><FAQAccordion items={faqs} /></div></section>

            <section className="py-16 hero-gradient">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white font-[var(--font-heading)] mb-4">Need Help with an Essay or Project?</h2>
                    <p className="text-primary-200 mb-8">Our academic advisors are ready to guide you to success.</p>
                    <Link href="/consultation" className="px-8 py-4 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-xl inline-block">Get Free Consultation</Link>
                </div>
            </section>
        </>
    );
}
