'use client';
import { useState, useEffect } from 'react';
import { 
    HiX, HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff, 
    HiPhone, HiBriefcase, HiOfficeBuilding, HiArrowRight 
} from 'react-icons/hi';
import { useAuth } from '@/lib/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { login, signup, authModalMode, setShowAuthModal } = useAuth();
    const [mode, setMode] = useState<'login' | 'signup'>(authModalMode);
    
    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [designation, setDesignation] = useState('');
    const [placeOfWork, setPlaceOfWork] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [signupStep, setSignupStep] = useState(1); // 1: Account, 2: Professional

    useEffect(() => {
        setMode(authModalMode);
        setSignupStep(1);
    }, [authModalMode, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === 'signup' && signupStep === 1) {
            setSignupStep(2);
            return;
        }

        setError('');
        setLoading(true);

        try {
            if (mode === 'signup') {
                await signup({
                    name,
                    email,
                    password,
                    phone,
                    designation,
                    place_of_work: placeOfWork
                });
            } else {
                await login(email, password);
            }
            // Success
            resetForm();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setError(axiosErr.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setDesignation('');
        setPlaceOfWork('');
        setSignupStep(1);
    };

    const switchMode = () => {
        const newMode = mode === 'login' ? 'signup' : 'login';
        setMode(newMode);
        setShowAuthModal(true, newMode);
        setError('');
        setSignupStep(1);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-md auth-modal-backdrop"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden auth-modal-content border border-white/20">
                {/* Header Section */}
                <div className="hero-gradient px-8 pt-8 pb-14 relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-400/20 rounded-full blur-3xl"></div>
                    
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-4 animate-fade-in">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
                            <span className="text-white font-bold text-xl font-[var(--font-heading)]">S</span>
                        </div>
                        <span className="text-white font-bold text-2xl tracking-tight hidden sm:block">ScholarAssist</span>
                    </div>
                    
                    <h2 className="text-3xl font-extrabold text-white animate-slide-down">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-primary-100/80 text-sm mt-2 animate-fade-in">
                        {mode === 'login'
                            ? 'Your gateway to elite academic tools.'
                            : mode === 'signup' && signupStep === 1 
                                ? 'Step 1: Account Essentials'
                                : 'Step 2: Professional Profile'
                        }
                    </p>
                </div>

                {/* Form Body */}
                <div className="px-8 pb-10 -mt-8 relative z-10">
                    <form onSubmit={handleSubmit} className="bg-white rounded-[1.5rem] p-7 shadow-2xl border border-slate-100 space-y-5 animate-slide-down">
                        
                        {mode === 'login' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email</label>
                                    <div className="relative group">
                                        <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="you@email.com"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Password</label>
                                    <div className="relative group">
                                        <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors"
                                        >
                                            {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {mode === 'signup' && signupStep === 1 && (
                            <div className="animate-fade-in space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                                    <div className="relative group">
                                        <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="John Doe"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                                    <div className="relative group">
                                        <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="you@email.com"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Create Password</label>
                                    <div className="relative group">
                                        <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors"
                                        >
                                            {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {mode === 'signup' && signupStep === 2 && (
                            <div className="animate-fade-in space-y-4">
                                <button 
                                    type="button"
                                    onClick={() => setSignupStep(1)}
                                    className="text-xs text-primary-600 font-bold hover:underline mb-2 block"
                                >
                                    ← Back to Step 1
                                </button>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Contact Number</label>
                                    <div className="relative group">
                                        <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="+1 234 567 890"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Designation</label>
                                    <div className="relative group">
                                        <HiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={designation}
                                            onChange={e => setDesignation(e.target.value)}
                                            placeholder="Student / Researcher / Professor"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Place of Work / Institute</label>
                                    <div className="relative group">
                                        <HiOfficeBuilding className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={placeOfWork}
                                            onChange={e => setPlaceOfWork(e.target.value)}
                                            placeholder="University / School / Company"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-3 animate-fade-in">
                                <div className="w-1.5 h-7 bg-red-500 rounded-full"></div>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-xl shadow-primary-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {mode === 'login' ? 'Sign In Now' : signupStep === 1 ? 'Next Details' : 'Complete Registration'}
                                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <p className="text-slate-500 text-sm">
                            {mode === 'login' ? "New to ScholarAssist?" : "Already have an account?"}{' '}
                            <button
                                onClick={switchMode}
                                className="text-primary-600 font-bold hover:text-primary-700 transition px-1"
                            >
                                {mode === 'login' ? 'Create Free Account' : 'Back to Login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
