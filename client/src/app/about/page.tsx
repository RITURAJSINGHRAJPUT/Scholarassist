import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { HiAcademicCap, HiHeart, HiLightBulb, HiGlobe } from 'react-icons/hi';

export const metadata: Metadata = generateSEO({
    title: 'About Us',
    description: 'Learn about ScholarAssist — our mission, values, and the expert team dedicated to helping students achieve academic excellence.',
    path: '/about',
});

const team = [
    { name: 'Dr. Margaret Reynolds', role: 'Founder & Lead Advisor', field: 'PhD in Education, Harvard University' },
    { name: 'Prof. James Carter', role: 'Research Director', field: 'Former Professor, MIT' },
    { name: 'Dr. Aisha Patel', role: 'Thesis Specialist', field: 'PhD in Sociology, Oxford University' },
    { name: 'Michael Brooks', role: 'Student Success Manager', field: 'M.Ed in Higher Education' },
];

export default function AboutPage() {
    return (
        <>
            <section className="hero-gradient pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-sm font-medium rounded-full mb-4">About Us</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-heading)] mb-4">Our Story</h1>
                    <p className="text-primary-200 text-lg max-w-2xl mx-auto">Empowering students worldwide with expert academic guidance since 2018.</p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 font-[var(--font-heading)] mb-6">Our Mission</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">ScholarAssist was founded with a simple yet powerful mission: to make expert academic guidance accessible to every student, regardless of their background.</p>
                            <p className="text-slate-600 leading-relaxed mb-4">We believe that every student deserves the support they need to reach their full academic potential. Our team of experienced advisors provides personalized mentorship that empowers students to think critically, research effectively, and write with confidence.</p>
                            <p className="text-slate-600 leading-relaxed">What sets us apart is our commitment to ethical academic support. We don&apos;t do the work for you — we guide you to produce your best work yourself.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { icon: HiAcademicCap, value: '10,000+', label: 'Students Guided' },
                                { icon: HiGlobe, value: '45+', label: 'Countries Served' },
                                { icon: HiLightBulb, value: '50+', label: 'Expert Advisors' },
                                { icon: HiHeart, value: '98%', label: 'Satisfaction Rate' },
                            ].map((s, i) => (
                                <div key={i} className="bg-primary-50 rounded-2xl p-6 text-center">
                                    <s.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                                    <p className="text-2xl font-bold text-primary-800 font-[var(--font-heading)]">{s.value}</p>
                                    <p className="text-sm text-slate-600 mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-slate-900 font-[var(--font-heading)] text-center mb-12">Our Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Academic Integrity', desc: 'We uphold the highest standards of academic honesty. Our guidance empowers students to learn, not to circumvent the learning process.' },
                            { title: 'Excellence', desc: 'We strive for excellence in everything we do, from the quality of our advice to the responsiveness of our support team.' },
                            { title: 'Confidentiality', desc: 'We treat your personal information and academic work with the utmost care, maintaining strict privacy protocols at all times.' },
                        ].map((v, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
                                <h3 className="font-bold text-lg text-slate-900 mb-3 font-[var(--font-heading)]">{v.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-slate-900 font-[var(--font-heading)] text-center mb-12">Meet Our Team</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((t, i) => (
                            <div key={i} className="text-center card-hover bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 font-[var(--font-heading)]">
                                    {t.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <h3 className="font-bold text-slate-900">{t.name}</h3>
                                <p className="text-primary-600 text-sm font-medium mt-1">{t.role}</p>
                                <p className="text-slate-500 text-xs mt-1">{t.field}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
