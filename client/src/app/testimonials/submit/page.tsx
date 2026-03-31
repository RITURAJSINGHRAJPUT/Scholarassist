'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { HiStar, HiCheckCircle, HiClock, HiExclamationCircle, HiChevronLeft, HiSparkles, HiChatAlt2 } from 'react-icons/hi';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function SubmitTestimonialPage() {
    const { user, setShowAuthModal } = useAuth();
    const router = useRouter();
    const [existing, setExisting] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    
    const [form, setForm] = useState({
        content: '',
        rating: 5
    });

    const fetchMyTestimonial = async () => {
        try {
            const res = await api.get('/testimonials/my');
            if (res.data) {
                setExisting(res.data);
                setForm({
                    content: res.data.content,
                    rating: res.data.rating
                });
            }
        } catch (err) {
            console.error('Failed to fetch my testimonial:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyTestimonial();
        } else {
            setLoading(false);
            // Redirect to testimonials if not logged in after some delay or show modal
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setShowAuthModal(true, 'login');
            return;
        }

        if (form.content.length < 20) {
            setError('Please write at least 20 characters.');
            return;
        }

        setSubmitting(true);
        setError('');
        
        try {
            if (existing) {
                await api.put('/testimonials/my', form);
            } else {
                await api.post('/testimonials/submit', form);
            }
            setSuccess(true);
            fetchMyTestimonial();
            setTimeout(() => {
                setSuccess(false);
            }, 5000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full font-bold"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-32">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100 font-[var(--font-heading)]">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-600">
                        <HiExclamationCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Authentication Required</h1>
                    <p className="text-slate-500 mb-8 font-medium">Please sign in to your account to share your experience with us.</p>
                    <button 
                        onClick={() => setShowAuthModal(true, 'login')}
                        className="w-full py-4 bg-primary-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                    >
                        Sign In Now
                    </button>
                    <Link href="/testimonials" className="inline-block mt-6 text-sm text-slate-400 font-bold hover:text-slate-600">
                        &larr; Back to Testimonials
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link 
                    href="/testimonials" 
                    className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-primary-600 transition mb-8"
                >
                    <HiChevronLeft className="w-5 h-5" />
                    Back to Testimonials
                </Link>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col md:flex-row">
                    {/* Left: Info Side */}
                    <div className="md:w-1/3 bg-primary-900 p-8 md:p-12 text-white relative flex-shrink-0">
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Feedback</span>
                            <h2 className="text-3xl font-black mb-6 font-[var(--font-heading)]">Share your journey.</h2>
                            <p className="text-primary-100/80 text-sm leading-relaxed mb-8 font-medium">
                                Your feedback helps us improve and inspires other researchers to excel in their academic endeavors.
                            </p>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                        <HiCheckCircle className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <p className="text-xs font-medium text-primary-50">Manual review for high-quality community standards.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                        <HiSparkles className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <p className="text-xs font-medium text-primary-50">Top testimonials get featured on our homepage.</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-600/20 rounded-full blur-3xl"></div>
                    </div>

                    {/* Right: Form Side */}
                    <div className="flex-1 p-8 md:p-12">
                        {existing && (
                            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 border ${
                                existing.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
                                existing.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-800' : 
                                'bg-red-50 border-red-100 text-red-800'
                            }`}>
                                <div className="shrink-0">
                                    {existing.status === 'approved' ? <HiCheckCircle className="w-6 h-6" /> : 
                                     existing.status === 'pending' ? <HiClock className="w-6 h-6" /> : 
                                     <HiExclamationCircle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest leading-none mb-1">
                                        {existing.status === 'approved' ? 'Approved' : existing.status === 'pending' ? 'Pending' : 'Rejected'}
                                    </p>
                                    <p className="text-xs font-medium opacity-80">
                                        {existing.status === 'approved' ? 'Your testimonial is live on our website!' : 
                                         existing.status === 'pending' ? 'We are currently reviewing your testimonial.' : 
                                         'Your testimonial was not approved. You can update it here.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Rate your experience</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setForm({ ...form, rating: star })}
                                            className={`w-12 h-12 rounded-2xl border-2 transition-all flex items-center justify-center ${
                                                star <= form.rating
                                                    ? 'bg-amber-50 border-amber-400 text-amber-500 shadow-lg shadow-amber-500/10'
                                                    : 'bg-white border-slate-100 text-slate-200 hover:border-slate-200'
                                            }`}
                                        >
                                            <HiStar className={`w-6 h-6 ${star <= form.rating ? 'animate-bounce' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Your Testimonial</label>
                                <textarea
                                    className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[1.5rem] text-slate-900 font-medium placeholder-slate-300 transition-all outline-none min-h-[200px]"
                                    placeholder="Tell us how ScholarAssist helped you in your work..."
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                />
                                <div className="flex justify-between mt-3 px-2">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                        Minimum 20 characters
                                    </p>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${form.content.length < 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {form.content.length} characters
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold border border-rose-100 animate-shake">
                                    <HiExclamationCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-3 text-emerald-600 text-xs font-bold border border-emerald-100">
                                    <HiCheckCircle className="w-5 h-5 shrink-0" />
                                    Your testimonial has been submitted for review!
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-5 bg-primary-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <HiChatAlt2 className="w-5 h-5" />
                                        {existing ? 'Update My Testimonial' : 'Share Success Story'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
