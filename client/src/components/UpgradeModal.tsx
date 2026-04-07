'use client';
import { useState, useEffect } from 'react';
import { HiX, HiCheck, HiSparkles, HiLightningBolt, HiClock } from 'react-icons/hi';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const plans = [
    {
        id: 'monthly',
        name: 'Monthly',
        price: '₹199',
        period: '/month',
        description: 'Perfect for regular use',
        features: [
            'Unlimited Plagiarism Checks',
            'Unlimited AI Detection',
            'Unlimited Editor Access',
            'Priority Processing',
            'Cancel Anytime',
        ],
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: '₹1,499',
        period: '/year',
        description: 'Best value — save 37%',
        badge: 'Best Value',
        features: [
            'Everything in Monthly',
            'Priority Support',
            'Early Access to New Tools',
            'Export History',
            'Save ₹889 per year',
        ],
    },
];

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const { user, refreshUser } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState('yearly');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.requestedPlan) {
            setSelectedPlan(user.requestedPlan);
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('user_token');
            await api.post('/users/upgrade', { plan: selectedPlan }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess(true);
            await refreshUser();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setError(axiosErr.response?.data?.error || 'Request failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isPending = user?.premiumStatus === 'pending' || success;

    if (isPending) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <div className="relative bg-white rounded-[2rem] p-10 text-center shadow-2xl auth-modal-content max-w-sm border border-slate-100">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 transition"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20 animate-bounce">
                        <HiClock className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Request Pending</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        Your request for the <span className="font-bold text-primary-600">{selectedPlan}</span> plan has been sent to our administrators for approval.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all shadow-sm"
                    >
                        Close
                    </button>
                    <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
                        Average approval time: 2-4 hours
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm auth-modal-backdrop"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden auth-modal-content border border-white/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-8 pt-8 pb-14 relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                    
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90 z-50"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <HiSparkles className="w-6 h-6 text-yellow-200" />
                        <span className="text-white/80 text-xs font-black uppercase tracking-[0.2em]">Elite Access</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white relative z-10">Unlock Unlimited Power</h2>
                    <p className="text-white/80 text-sm mt-2 relative z-10 font-medium">Remove all daily limits and supercharge your academic workflow instantly.</p>
                </div>

                {/* Plans */}
                <div className="px-8 pb-10 -mt-10 relative z-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {plans.map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`relative p-7 rounded-[1.5rem] border-2 text-left transition-all duration-300 group ${
                                    selectedPlan === plan.id
                                        ? 'border-amber-400 bg-amber-50/30 shadow-xl shadow-amber-500/5'
                                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'
                                }`}
                            >
                                {plan.badge && (
                                    <span className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                        {plan.badge}
                                    </span>
                                )}
                                <h3 className={`font-bold uppercase tracking-widest text-[10px] mb-1 ${selectedPlan === plan.id ? 'text-amber-600' : 'text-slate-400'}`}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                                    <span className="text-slate-400 text-xs font-bold">{plan.period}</span>
                                </div>
                                <p className="text-slate-500 text-xs mt-1.5 font-medium">{plan.description}</p>
                                <ul className="mt-5 space-y-2.5">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium leading-relaxed">
                                            <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${selectedPlan === plan.id ? 'bg-amber-100' : 'bg-slate-100'}`}>
                                                <HiCheck className={`w-2.5 h-2.5 ${selectedPlan === plan.id ? 'text-amber-600' : 'text-slate-400'}`} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-shake flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-red-500 rounded-full"></div>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="mt-8 w-full py-4.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-top-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <HiLightningBolt className="w-5 h-5" />
                                Review & Get Early Access
                            </>
                        )}
                    </button>

                    <div className="flex items-center justify-center gap-6 mt-6 opacity-40">
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Secure AES-256</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Manual Approval</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Refund Policy</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
