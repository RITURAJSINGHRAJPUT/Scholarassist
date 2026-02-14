'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HiAcademicCap, HiDocumentText, HiPencilAlt, HiShieldCheck, HiClock, HiUserGroup } from 'react-icons/hi';
import ServiceCard from '@/components/ServiceCard';
import TestimonialCard from '@/components/TestimonialCard';
import FAQAccordion from '@/components/FAQAccordion';
import api from '@/lib/api';

interface Testimonial { id: string; name: string; role: string; content: string; rating: number; }

const faqs = [
  { question: 'What types of academic assistance do you provide?', answer: 'We provide expert guidance for thesis writing, research papers, essays, literature reviews, project documentation, and dissertation support across all academic levels from undergraduate to post-doctoral.' },
  { question: 'How does the consultation process work?', answer: 'Simply fill out our consultation form with your project details. Our team reviews your requirements within 24 hours and provides a personalized guidance plan with timeline and recommendations.' },
  { question: 'Is my information kept confidential?', answer: 'Absolutely. We maintain strict confidentiality protocols. All personal data and project details are encrypted and never shared with third parties. We adhere to the highest ethical standards.' },
  { question: 'What academic levels do you support?', answer: 'We support students at all levels including high school, undergraduate, master\'s, PhD/doctorate, and post-doctoral researchers across various disciplines and fields of study.' },
  { question: 'How quickly can I get help?', answer: 'After submitting your consultation request, our team typically responds within 24 hours. We accommodate urgent deadlines and can expedite our guidance process when needed.' },
];

export default function HomePage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    api.get('/testimonials').then(res => setTestimonials(res.data)).catch(() => { });
  }, []);

  return (
    <>

      {/* Hero Section */}
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm mb-6">
                <HiShieldCheck className="w-4 h-4" />
                Trusted by 10,000+ Students Worldwide
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight font-[var(--font-heading)]">
                Expert Academic<br />
                <span className="text-primary-200">Guidance</span> You Can<br />
                <span className="text-accent-400">Trust</span>
              </h1>
              <p className="mt-6 text-lg text-primary-100 leading-relaxed max-w-lg">
                Professional assistance for thesis writing, research papers, essays, and project documentation. Let our experts guide you to academic excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  href="/consultation"
                  className="px-8 py-4 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-xl hover:-translate-y-0.5 text-center"
                >
                  Get Free Consultation
                </Link>
                <Link
                  href="/services"
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all text-center"
                >
                  Explore Services
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-3xl bg-white/10 backdrop-blur border border-white/20 p-8 animate-float">
                  <div className="space-y-4">
                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                    <div className="h-4 bg-white/15 rounded w-full"></div>
                    <div className="h-4 bg-white/15 rounded w-5/6"></div>
                    <div className="h-20 bg-white/10 rounded-xl mt-4"></div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-8 bg-primary-400/40 rounded-lg w-24"></div>
                      <div className="h-8 bg-white/20 rounded-lg w-20"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl bg-accent-400/20 backdrop-blur border border-accent-400/30 flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                  <HiAcademicCap className="w-12 h-12 text-white/70" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white/10 backdrop-blur border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '10,000+', label: 'Students Helped' },
                { value: '98%', label: 'Satisfaction Rate' },
                { value: '50+', label: 'Expert Advisors' },
                { value: '24/7', label: 'Support Available' },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-3xl font-bold text-white font-[var(--font-heading)]">{s.value}</p>
                  <p className="text-primary-200 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-4">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-[var(--font-heading)]">Comprehensive Academic Support</h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">From thesis writing to project documentation, we provide expert guidance tailored to your academic needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard
              title="Thesis Assistance"
              description="Expert guidance for your thesis from topic selection to final submission. Our advisors help you craft a compelling research narrative."
              icon={HiAcademicCap}
              href="/services/thesis"
              features={['Topic Selection & Refinement', 'Research Methodology', 'Literature Review']}
            />
            <ServiceCard
              title="Research Paper Support"
              description="Comprehensive support for research papers including methodology, data analysis, and publication-ready formatting."
              icon={HiDocumentText}
              href="/services/research-paper"
              features={['Data Analysis Guidance', 'Citation & Formatting', 'Peer Review Preparation']}
            />
            <ServiceCard
              title="Essay & Project Help"
              description="Professional guidance for essays, assignments, and project documentation across all academic disciplines."
              icon={HiPencilAlt}
              href="/services/essay-project"
              features={['Structure & Outline', 'Content Development', 'Quality Review']}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-4">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-[var(--font-heading)]">Simple Steps to Academic Success</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Submit Your Request', desc: 'Fill out our consultation form with your project details, requirements, and deadline.', icon: HiDocumentText },
              { step: '02', title: 'Expert Review', desc: 'Our team of academic advisors reviews your request and creates a personalized guidance plan.', icon: HiUserGroup },
              { step: '03', title: 'Get Results', desc: 'Receive expert guidance and support throughout your project for outstanding academic results.', icon: HiClock },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/20 group-hover:-translate-y-1 transition-transform">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-accent-400 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 font-[var(--font-heading)]">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-primary-50 to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-4">Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-[var(--font-heading)]">What Our Students Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map(t => (
                <TestimonialCard key={t.id} name={t.name} role={t.role} content={t.content} rating={t.rating} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-4">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-[var(--font-heading)]">Frequently Asked Questions</h2>
          </div>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-[var(--font-heading)] mb-4">Ready to Excel in Your Academic Journey?</h2>
          <p className="text-primary-200 text-lg mb-8 max-w-2xl mx-auto">Get started with a free consultation today. Our expert advisors are ready to help you achieve your academic goals.</p>
          <Link
            href="/consultation"
            className="inline-block px-10 py-4 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-xl hover:-translate-y-0.5"
          >
            Start Your Free Consultation
          </Link>
        </div>
      </section>
    </>
  );
}
