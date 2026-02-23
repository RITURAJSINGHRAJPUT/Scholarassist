import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSEO } from '@/lib/seo';
import FAQAccordion from '@/components/FAQAccordion';

export const metadata: Metadata = generateSEO({
    title: 'Academic & Technical Project Support',
    description: 'Professional guidance for academic projects, capstone development, technical documentation, and implementation support.',
    path: '/services/essay-project', // keeping same route to avoid breaking links
});

const features = [
    { 
        title: 'Project Ideation & Planning', 
        desc: 'Get structured guidance for selecting project topics, defining objectives, drafting problem statements, and planning milestones.' 
    },
    { 
        title: 'Technical Implementation Support', 
        desc: 'Expert assistance with web apps, mobile apps, AI/ML models, IoT systems, APIs, database integration, and system architecture.' 
    },
    { 
        title: 'Capstone & Final Year Projects', 
        desc: 'End-to-end mentorship for major academic projects including requirement analysis, development planning, testing, and deployment guidance.' 
    },
    { 
        title: 'Project Documentation & Reports', 
        desc: 'Professional support for SRS documents, methodology chapters, system diagrams, IEEE formatting, and complete final reports.' 
    },
    { 
        title: 'Presentation & Viva Preparation', 
        desc: 'Prepare impactful presentations, demo walkthroughs, and technical explanations for internal and external evaluations.' 
    },
    { 
        title: 'Research & Innovation Support', 
        desc: 'Structured guidance for literature reviews, research methodology, data documentation, and publication-ready formatting.' 
    },
];

const faqs = [
    { 
        question: 'What types of projects do you support?', 
        answer: 'We provide guidance for software projects, web applications, mobile apps, IoT systems, AI/ML models, research-based projects, and final year capstone work.' 
    },
    { 
        question: 'Can you help with group projects?', 
        answer: 'Yes, we assist with task division planning, module structuring, integration support, collaborative documentation, and final presentation preparation.' 
    },
    { 
        question: 'Do you provide guidance in specific subject areas?', 
        answer: 'Yes, our team supports Computer Science, Engineering, Business, Sciences, Humanities, and interdisciplinary academic domains.' 
    },
];

export default function EssayProjectPage() {
    return (
        <>
            <section className="hero-gradient pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-sm font-medium rounded-full mb-4">
                        Academic Project Support
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-heading)] mb-4">
                        Build Exceptional Academic Projects
                    </h1>
                    <p className="text-primary-200 text-lg max-w-2xl mx-auto">
                        From idea validation to final documentation and presentation — get expert guidance to develop practical, high-quality academic projects.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-slate-900 font-[var(--font-heading)]">
                            Our Project Development Services
                        </h2>
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
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-slate-900 text-center mb-8 font-[var(--font-heading)]">
                        Frequently Asked Questions
                    </h2>
                    <FAQAccordion items={faqs} />
                </div>
            </section>

            <section className="py-16 hero-gradient">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white font-[var(--font-heading)] mb-4">
                        Ready to Build Your Project?
                    </h2>
                    <p className="text-primary-200 mb-8">
                        Our academic advisors are ready to guide you from concept to completion.
                    </p>
                    <Link 
                        href="/consultation" 
                        className="px-8 py-4 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-xl inline-block"
                    >
                        Get Free Consultation
                    </Link>
                </div>
            </section>
        </>
    );
}