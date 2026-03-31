'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import TestimonialCard from '@/components/TestimonialCard';
import { HiStar, HiPlus, HiChatAlt2, HiSparkles } from 'react-icons/hi';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
}

export default function TestimonialsPage() {
    const { user } = useAuth();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/testimonials')
            .then(res => setTestimonials(res.data))
            .catch(err => console.error('Failed to fetch testimonials:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 text-primary-700 text-xs font-black uppercase tracking-[0.2em] rounded-full mb-6">
                        <HiSparkles className="w-4 h-4" />
                        Success Stories
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 font-[var(--font-heading)] leading-tight">
                        Trusted by thousands of <span className="text-primary-600">Scholars</span> worldwide.
                    </h1>
                    <p className="text-lg text-slate-600 font-medium leading-relaxed">
                        Read what students and researchers have to say about our tools and how it helped them achieve academic excellence.
                    </p>
                    
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            href={user ? "/testimonials/submit" : "#"} 
                            onClick={(e) => {
                                if (!user) {
                                    e.preventDefault();
                                    // The auth modal will handle it if we trigger it, 
                                    // but for now, let's just point to submit which will check auth
                                    window.location.href = "/testimonials/submit";
                                }
                            }}
                            className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95"
                        >
                            <HiPlus className="w-5 h-5" />
                            Share Your Story
                        </Link>
                        <div className="flex items-center gap-2 px-6 py-4 bg-white text-slate-600 font-bold text-sm rounded-2xl border border-slate-200">
                            <HiChatAlt2 className="w-5 h-5 text-primary-500" />
                            {testimonials.length} Verified Reviews
                        </div>
                    </div>
                </div>

                {/* Testimonials Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 font-bold animate-pulse">Loading amazing stories...</p>
                    </div>
                ) : testimonials.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <HiChatAlt2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No testimonials yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Be the first one to share your experience with ScholarAssist!</p>
                        <Link 
                            href="/testimonials/submit"
                            className="mt-6 inline-block text-primary-600 font-bold hover:text-primary-700 underline underline-offset-4"
                        >
                            Submit your review now &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((t) => (
                            <div key={t.id} className="h-full">
                                <TestimonialCard 
                                    name={t.name}
                                    role={t.role}
                                    content={t.content}
                                    rating={t.rating}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Call to action */}
                <div className="mt-20 p-10 sm:p-16 bg-gradient-to-br from-primary-900 to-indigo-950 rounded-[3rem] text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Ready to improve your writing?</h2>
                        <p className="text-primary-100 text-lg mb-10 max-w-xl mx-auto font-medium">Join 50,000+ researchers using our advanced AI tools to polish their work.</p>
                        <Link 
                            href="/"
                            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-primary-950 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-95"
                        >
                            Get Started for Free
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
