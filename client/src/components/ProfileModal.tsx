'use client';

import { useAuth } from '@/lib/AuthContext';
import { 
    HiX, 
    HiMail, 
    HiPhone, 
    HiBadgeCheck, 
    HiAcademicCap, 
    HiOfficeBuilding, 
    HiCalendar,
    HiSparkles,
    HiRefresh,
    HiArrowRight,
    HiCheckCircle
} from 'react-icons/hi';
import { useEffect, useState } from 'react';

export default function ProfileModal() {
    const { user, usage, showProfileModal, setShowProfileModal, setShowUpgradeModal } = useAuth();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (showProfileModal) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [showProfileModal]);

    if (!showProfileModal && !isVisible) return null;

    if (!user) return null;

    const initial = user.name.charAt(0).toUpperCase();

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'No expiry';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isPremium = user.premiumStatus === 'approved';

    return (
        <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ease-out ${
                showProfileModal ? 'opacity-100 backdrop-blur-xl' : 'opacity-0 backdrop-blur-0'
            }`}
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40"
                onClick={() => setShowProfileModal(false)}
            />

            {/* Modal Card */}
            <div 
                className={`relative w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(30,41,59,0.25)] border border-white overflow-hidden transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) transform ${
                    showProfileModal ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-12 opacity-0'
                }`}
            >
                {/* Brand Banner */}
                <div className={`h-32 w-full relative overflow-hidden ${
                    isPremium 
                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600' 
                        : 'bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900'
                }`}>
                    {/* Animated Background Orbs */}
                    <div className="absolute inset-0 opacity-30 pointer-events-none">
                        <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/20 rounded-full blur-[80px] animate-pulse" />
                        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-white/10 rounded-full blur-[60px]" 
                             style={{ animation: 'float 10s ease-in-out infinite' }} />
                        <div className="absolute -bottom-20 -right-10 w-80 h-80 bg-primary-400/20 rounded-full blur-[100px]" />
                    </div>

                    <button 
                        type="button"
                        onClick={() => setShowProfileModal(false)}
                        className="absolute top-6 right-6 p-2.5 bg-black/10 hover:bg-black/20 text-white rounded-full backdrop-blur-lg transition-all active:scale-90 z-50"
                    >
                        <HiX className="w-4 h-4" />
                    </button>
                    
                    <div className="absolute top-6 left-6 z-10">
                        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.15em] text-white/90">
                            Scholar Identity
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-10 -mt-12 relative z-10">
                    {/* Profile Header section */}
                    <div className="flex flex-col md:flex-row md:items-end gap-8 mb-10">
                        {/* High-Fidelity Avatar */}
                        <div className="relative group shrink-0">
                            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl font-black text-white shadow-2xl transition-all duration-700 group-hover:rotate-6 group-hover:scale-105 ${
                                isPremium 
                                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 ring-[8px] ring-white' 
                                    : 'bg-gradient-to-br from-primary-600 to-primary-900 ring-[8px] ring-white'
                            }`}>
                                {initial}
                            </div>
                            {isPremium && (
                                <div className="absolute -bottom-3 -right-3 bg-amber-500 text-white p-3 rounded-2xl shadow-[0_10px_20px_-5px_rgba(245,158,11,0.5)] ring-4 ring-white animate-bounce-slow">
                                    <HiSparkles className="w-7 h-7" />
                                </div>
                            )}
                        </div>

                        {/* Name & Account Status */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                    {user.name}
                                </h2>
                                {isPremium && <HiBadgeCheck className="w-6 h-6 text-primary-500" />}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5 text-slate-500 font-bold text-[13px] tracking-tight">
                                    <HiMail className="w-4 h-4 text-slate-400" /> {user.email}
                                </span>
                                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-wider">Verified</span>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid - Compact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        <div className="group relative p-4 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5 active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                                    <HiPhone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 mb-0.5">Contact No</p>
                                    <p className="text-sm font-black text-slate-800">{user.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="group relative p-4 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5 active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                                    <HiAcademicCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 mb-0.5">Role</p>
                                    <p className="text-sm font-black text-slate-800">{user.designation || 'Scholar'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="group relative sm:col-span-2 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5 active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                                    <HiOfficeBuilding className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 mb-0.5">Workplace</p>
                                    <p className="text-sm font-black text-slate-800">{user.placeOfWork || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription & Usage - Neo-SaaS Redesign */}
                    <div className="space-y-4">
                        {/* Validity Card */}
                        <div className={`relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-500 ${
                            isPremium 
                                ? 'bg-amber-500/5 border-amber-200/50 text-amber-900' 
                                : 'bg-primary-500/5 border-primary-100 text-slate-800'
                        }`}>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                                    isPremium ? 'bg-amber-500 text-white' : 'bg-primary-600 text-white'
                                }`}>
                                    <HiCalendar className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                                        Account Validity
                                    </p>
                                    <p className="text-xl font-black tracking-tight leading-none">
                                        Until {formatDate(user.subscriptionExpiry)}
                                    </p>
                                </div>
                                {!isPremium && (
                                    <button 
                                        onClick={() => { setShowProfileModal(false); setShowUpgradeModal(true); }}
                                        className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-600/20"
                                    >
                                        Upgrade
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Usage Card */}
                        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group/usage">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                        <HiRefresh className="w-4 h-4 text-primary-400 animate-spin-slow" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Daily Resources</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black font-mono tracking-tighter">
                                        {usage?.remaining} <span className="text-white/20 text-lg mx-0.5">/</span> {usage?.limit}
                                    </span>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-primary-400">Credits Left</p>
                                </div>
                            </div>
                            
                            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner z-10">
                                <div 
                                    className={`h-full rounded-full transition-all duration-[1.5s] ease-out relative overflow-hidden ${
                                        (usage?.remaining || 0) === 0 ? 'bg-rose-500' : 'bg-gradient-to-r from-primary-500 to-indigo-500'
                                    }`}
                                    style={{ width: `${((usage?.remaining || 0) / (usage?.limit || 1)) * 100}%` }}
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer" style={{ backgroundSize: '150% 100%' }} />
                                </div>
                            </div>
                            
                            {!isPremium && (
                                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between relative z-10">
                                    <p className="text-[10px] font-medium text-slate-400 italic">Get unlimited access today.</p>
                                    <button 
                                        onClick={() => { setShowProfileModal(false); setShowUpgradeModal(true); }}
                                        className="sm:hidden flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                                    >
                                        Upgrade
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Security Note */}
                    <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <HiCheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Secure Academic Hub • All Rights Reserved
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(20px, -20px); }
                }
                @keyframes shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
                .animate-shimmer {
                    animation: shimmer 2.5s infinite;
                }
            `}</style>
        </div>
    );
}
