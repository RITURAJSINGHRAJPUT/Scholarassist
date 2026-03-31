'use client';
import { useState, useRef, useEffect } from 'react';
import { HiChevronDown, HiLogout, HiSparkles, HiUser, HiCreditCard, HiAcademicCap } from 'react-icons/hi';
import { useAuth } from '@/lib/AuthContext';

export default function UserBadge() {
    const { user, usage, logout, setShowUpgradeModal, setShowProfileModal } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const initial = user.name.charAt(0).toUpperCase();

    return (
        <div className="relative shrink-0" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-3 p-1.5 md:pr-4 rounded-2xl transition-all duration-300 group border border-transparent ${
                    open ? 'bg-white shadow-xl shadow-slate-200/50 border-slate-100' : 'hover:bg-slate-50/80 hover:border-slate-100'
                }`}
            >
                {/* Avatar with status ring */}
                <div className="relative group/avatar">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg transition-all duration-500 active:scale-95 group-hover:rotate-6 ${
                        user.premiumStatus === 'approved'
                            ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-amber-500/20 ring-2 ring-amber-400 ring-offset-2 overflow-hidden'
                            : 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-400/20'
                    }`}>
                        {initial}
                        {user.premiumStatus === 'approved' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
                        )}
                    </div>
                </div>

                {/* User details hidden on narrow desktop screens */}
                <div className="hidden xl:block text-left">
                    <p className="text-[13px] font-black text-slate-900 leading-none mb-1 group-hover:text-primary-600 transition-colors">
                        {user.name}
                    </p>
                    <div className="flex items-center gap-1.5 opacity-60">
                        {user.premiumStatus === 'approved' && <HiSparkles className="w-3 h-3 text-amber-500" />}
                        <p className={`text-[10px] font-black uppercase tracking-widest ${
                            user.premiumStatus === 'approved' ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                            {user.premiumStatus === 'approved' ? 'Premium' : 'Standard'}
                        </p>
                    </div>
                </div>
                
                <HiChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-500 ${open ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
            </button>

            {/* Premium Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-4 w-72 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-100 p-2 z-[60] animate-in fade-in slide-in-from-top-4 duration-500 ease-out overflow-hidden">
                    {/* User Profile Summary */}
                    <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-[1.5rem] mb-2 border border-slate-100/50">
                        <div className="flex items-center gap-4 mb-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl ${
                                user.premiumStatus === 'approved' ? 'bg-gradient-to-br from-amber-400 to-orange-600' : 'bg-primary-900'
                            }`}>
                                {initial}
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-lg tracking-tight leading-tight">{user.name}</h3>
                                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{user.email}</p>
                            </div>
                        </div>

                        {user.premiumStatus === 'approved' ? (
                            <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200/50 rounded-xl relative overflow-hidden group/premium">
                                <HiSparkles className="w-4 h-4 text-amber-500 animate-pulse relative z-10" />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-700 relative z-10">Premium Member</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/premium:translate-x-full transition-transform duration-1000" />
                            </div>
                        ) : (
                            <button 
                                onClick={() => { setOpen(false); setShowUpgradeModal(true); }}
                                className="w-full relative group/btn flex items-center justify-center gap-2.5 px-4 py-4 bg-primary-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary-700 transition shadow-lg shadow-primary-600/20 active:scale-95 overflow-hidden"
                            >
                                <HiCreditCard className="w-4 h-4 relative z-10" /> 
                                <span className="relative z-10">Go Premium</span>
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                            </button>
                        )}
                    </div>

                    {/* Quick Info (Status etc) */}
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100/50">
                                <HiAcademicCap className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Today&apos;s Usage</p>
                                <p className="text-[13px] font-black text-slate-900 font-mono">
                                    {usage?.remaining} <span className="text-slate-300 mx-0.5">/</span> {usage?.limit} <span className="text-[10px] uppercase font-sans text-slate-400 ml-1">Credits</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions List */}
                    <div className="p-2 pt-3 space-y-1">
                        <button
                            onClick={() => { setOpen(false); setShowProfileModal(true); }}
                            className="group flex items-center gap-4 w-full px-5 py-4 text-[13px] text-slate-600 font-black uppercase tracking-widest hover:bg-primary-50 hover:text-primary-700 rounded-2xl transition-all duration-300"
                        >
                            <HiUser className="w-4 h-4 opacity-40 group-hover:opacity-100" /> Profile
                        </button>
                        
                        <div className="h-px bg-slate-50 mx-4" />
                        
                        <button
                            onClick={() => { setOpen(false); logout(); }}
                            className="group flex items-center gap-4 w-full px-5 py-4 text-[13px] text-rose-500 font-black uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all duration-300"
                        >
                            <HiLogout className="w-4 h-4 opacity-40 group-hover:opacity-100" /> Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
