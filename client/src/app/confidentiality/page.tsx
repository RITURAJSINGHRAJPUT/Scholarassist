import type { Metadata } from 'next';
import { HiShieldCheck, HiLockClosed, HiEye, HiUserGroup, HiDocumentText, HiHeart } from 'react-icons/hi';
import { generateSEO } from '@/lib/seo';

export const metadata: Metadata = generateSEO({
    title: 'Confidentiality & Ethics',
    description: 'Learn about our strict confidentiality protocols and ethical standards. Your privacy and academic integrity are our top priorities.',
    path: '/confidentiality',
});

const principles = [
    { icon: HiLockClosed, title: 'Data Encryption', desc: 'All personal data and uploaded documents are encrypted using AES-256 standard encryption, both in transit and at rest.' },
    { icon: HiShieldCheck, title: 'No Third-Party Sharing', desc: 'Your information is never shared with third parties. We maintain strict data isolation and access controls.' },
    { icon: HiEye, title: 'Access Controls', desc: 'Only authorized team members can access your project details, and all access is logged and audited.' },
    { icon: HiUserGroup, title: 'Academic Integrity', desc: 'We provide guidance and mentorship—never ghostwriting. Our goal is to help you learn and produce your own best work.' },
    { icon: HiDocumentText, title: 'Secure File Handling', desc: 'Uploaded files are encrypted before storage with no public access links. Files are permanently deleted upon project completion.' },
    { icon: HiHeart, title: 'Ethical Standards', desc: 'We adhere to the highest ethical standards in academic support, ensuring our guidance enhances your learning experience.' },
];

export default function ConfidentialityPage() {
    return (
        <>
            <section className="hero-gradient pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-sm font-medium rounded-full mb-4">Confidentiality & Ethics</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-heading)] mb-4">Your Privacy, Our Priority</h1>
                    <p className="text-primary-200 text-lg max-w-2xl mx-auto">We maintain the highest standards of confidentiality and ethical conduct. Your trust is the foundation of our service.</p>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {principles.map((p, i) => (
                            <div key={i} className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100 card-hover">
                                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-5">
                                    <p.icon className="w-6 h-6 text-primary-700" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2 text-lg">{p.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-[var(--font-heading)] mb-8 text-center">Our Commitment</h2>
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-6 text-sm text-slate-600 leading-relaxed">
                        <p>At ScholarAssist, we believe that academic support should empower students to learn, grow, and produce their own best work. Our services are designed as educational guidance—mentorship that enhances your understanding and capabilities.</p>
                        <p>We strictly prohibit any form of academic dishonesty. Our advisors serve as mentors and guides, helping you develop the skills and knowledge needed to excel independently. We never write assignments on behalf of students.</p>
                        <p>All client interactions are governed by our confidentiality agreement. Personal information, project details, and communications are protected with enterprise-grade security measures and are never disclosed to external parties.</p>
                        <p>We comply with all applicable data protection regulations and regularly audit our security practices to ensure your information remains safe.</p>
                    </div>
                </div>
            </section>
        </>
    );
}
