'use client';

import { Inter } from 'next/font/google';
import { HiExclamation, HiRefresh, HiHome } from 'react-icons/hi';
import Link from 'next/link';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
});

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-50 min-h-screen flex items-center justify-center p-4`}>
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-600/5 rounded-full blur-3xl -ml-16 -mb-16" />

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <HiExclamation className="w-10 h-10" />
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                            Something Went Wrong
                        </h2>
                        
                        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                            A critical error occurred in the academic hub. We&apos;ve been notified and are working on a fix to restore your Scholar tools.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => reset()}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95"
                            >
                                <HiRefresh className="w-5 h-5" />
                                Try Again
                            </button>
                            
                            <Link
                                href="/"
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95"
                            >
                                <HiHome className="w-5 h-5" />
                                Return Home
                            </Link>
                        </div>

                        <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            Error Digest: {error.digest || 'Internal Failure'}
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
}
