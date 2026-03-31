'use client';
import { ReactNode } from 'react';
import { HiLockClosed, HiSparkles } from 'react-icons/hi';
import { useAuth } from '@/lib/AuthContext';

interface ProtectedToolWrapperProps {
    children: ReactNode;
    toolName: string;
}

export default function ProtectedToolWrapper({ children, toolName }: ProtectedToolWrapperProps) {
    const { isAuthenticated, isLoading, usage, user, setShowAuthModal, setShowUpgradeModal } = useAuth();

    // While checking auth, show the actual content (no flash)
    if (isLoading) {
        return <>{children}</>;
    }

    // Not logged in → show blurred overlay
    if (!isAuthenticated) {
        return (
            <div className="relative">
                {/* Blurred content */}
                <div className="pointer-events-none select-none" style={{ filter: 'blur(6px)', opacity: 0.5 }}>
                    {children}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="glass rounded-3xl p-10 max-w-md text-center shadow-2xl border border-white/40 auth-modal-content">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <HiLockClosed className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            Login to Use This Tool
                        </h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            Create a free account to access our {toolName.replace(/_/g, ' ')} and other academic tools.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowAuthModal(true, 'login')}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/25"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setShowAuthModal(true, 'signup')}
                                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Sign Up Free
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Logged in but usage limit exceeded
    if (!user?.isPremium && usage && usage.remaining <= 0) {
        return (
            <div className="relative">
                {/* Content with disabled appearance */}
                <div className="pointer-events-none select-none opacity-50">
                    {children}
                </div>

                {/* Upgrade overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="glass rounded-3xl p-10 max-w-md text-center shadow-2xl border border-amber-200/60 auth-modal-content">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <HiSparkles className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            Daily Limit Reached
                        </h3>
                        <p className="text-slate-500 text-sm mb-2">
                            You&apos;ve used all {usage.limit} free checks for today.
                        </p>
                        <p className="text-slate-400 text-xs mb-6">
                            Upgrade to Premium for unlimited access to all tools.
                        </p>
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="w-full px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
                        >
                            ⚡ Upgrade to Premium
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Fully authorized → render children normally
    return <>{children}</>;
}
