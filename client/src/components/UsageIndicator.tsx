'use client';
import { useAuth } from '@/lib/AuthContext';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';

export default function UsageIndicator() {
    const { user, usage, isAuthenticated, setShowUpgradeModal } = useAuth();

    if (!isAuthenticated || !usage) return null;

    // Premium users see a glowing, high-end "∞" badge
    if (user?.premiumStatus === 'approved') {
        return (
            <div className="group relative flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/40 rounded-xl transition-all duration-500 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95">
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-30 group-hover:opacity-100 transition-opacity" />
                <HiSparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-700 font-mono">Unlimited</span>
            </div>
        );
    }

    const percentage = ((usage.limit - usage.remaining) / usage.limit) * 100;
    const isLow = usage.remaining <= 1;
    const isDepleted = usage.remaining <= 0;

    return (
        <div className="flex items-center gap-3 pr-1">
            <div className="flex flex-col gap-1 items-end">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Credits</span>
                    <span className={`text-[11px] font-black font-mono tracking-tighter ${
                        isDepleted ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-slate-600'
                    }`}>
                        {usage.remaining}<span className="text-slate-300 mx-0.5">/</span>{usage.limit}
                    </span>
                </div>
                {/* Slim, elegant progress bar */}
                <div className="w-14 h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                            isDepleted ? 'bg-rose-500 shadow-rose-200' : isLow ? 'bg-amber-500 shadow-amber-200' : 'bg-primary-600 shadow-primary-200'
                        }`}
                        style={{ width: `${100 - percentage}%` }}
                    />
                </div>
            </div>
            
            {isLow && !isDepleted && (
                <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="relative group p-2 bg-white/50 backdrop-blur-md border border-amber-200 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-90 overflow-hidden"
                    title="Get Unlimited Credits"
                >
                    <HiLightningBolt className="w-3.5 h-3.5 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            )}
        </div>
    );
}
