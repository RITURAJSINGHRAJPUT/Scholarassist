'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiMenu, HiX, HiChevronDown } from 'react-icons/hi';
import { useAuth } from '@/lib/AuthContext';
import UserBadge from '@/components/UserBadge';
import UsageIndicator from '@/components/UsageIndicator';

const services = [
    { name: 'Thesis Assistance', href: '/services/thesis' },
    { name: 'Research Paper Support', href: '/services/research-paper' },
    { name: 'Academic Project Support', href: '/services/essay-project' },
];

const tools = [
    { name: 'Plagiarism Checker', href: '/plagiarism-checker' },
    { name: 'AI Content Detector', href: '/ai-detector' },
    { name: 'Research Editor', href: '/editor' },
];

const resourceLinks = [
    { name: 'Blog', href: '/blog' },
    { name: 'Testimonials', href: '/testimonials' },
];

const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Confidentiality', href: '/confidentiality' },
];

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services', children: services },
    { name: 'Tools', href: '/plagiarism-checker', children: tools },
    { name: 'Resources', href: '#', children: resourceLinks },
    { name: 'Company', href: '#', children: companyLinks },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [servicesOpen, setServicesOpen] = useState<string | null>(null);
    const pathname = usePathname();
    const { isAuthenticated, setShowAuthModal } = useAuth();

    // Pages with dark hero backgrounds that need transparent navbar
    const darkHeroPages = ['/', '/services', '/services/thesis', '/services/research-paper', '/services/essay-project', '/confidentiality', '/contact', '/about', '/plagiarism-checker', '/ai-detector', '/testimonials'];
    const hasDarkHero = darkHeroPages.some(p => pathname === p);
    const showSolid = scrolled || !hasDarkHero;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
        setServicesOpen(null);
    }, [pathname]);

    if (pathname?.startsWith('/admin')) return null;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-medium ${showSolid
                ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg group-hover:shadow-primary-400/30 transition-all active:scale-95">
                            <span className="text-white font-black text-xl font-[var(--font-heading)]">S</span>
                        </div>
                        <span className={`text-xl font-black font-[var(--font-heading)] tracking-tight transition-colors ${showSolid ? 'text-slate-900' : 'text-white'}`}>
                            Scholar<span className="text-primary-500">Assist</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 ml-auto mr-8">
                        {navLinks.map((link) => (
                            <div key={link.name} className="relative group">
                                {link.children ? (
                                    <>
                                        <button
                                            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-bold transition-all hover:bg-slate-100/50 ${pathname?.startsWith(link.href) && link.href !== '#'
                                                ? showSolid ? 'text-primary-700 bg-primary-50/50' : 'text-white bg-white/10'
                                                : showSolid ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'
                                                }`}
                                        >
                                            {link.name}
                                            <HiChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform opacity-60" />
                                        </button>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 min-w-[200px] font-bold overflow-hidden">
                                                {link.children.map((child) => (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={`block px-5 py-3 text-[13px] transition-colors ${pathname === child.href ? 'text-primary-600 bg-primary-50/50' : 'text-slate-500 hover:text-primary-600 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        href={link.href}
                                        className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all hover:bg-slate-100/50 ${pathname === link.href
                                            ? showSolid ? 'text-primary-700 bg-primary-50/50' : 'text-white bg-white/10'
                                            : showSolid ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="hidden lg:flex items-center gap-2 shrink-0">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-1.5 py-1 px-1">
                                <UsageIndicator />
                                <div className="w-px h-8 bg-slate-200/60 mx-1.5"></div>
                                <UserBadge />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 font-bold">
                                <button
                                    onClick={() => setShowAuthModal(true, 'login')}
                                    className={`px-5 py-2.5 text-[13px] transition-all hover:bg-slate-100/10 ${
                                        showSolid ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50' : 'text-white/90 hover:text-white'
                                    }`}
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => setShowAuthModal(true, 'signup')}
                                    className="px-6 py-3 bg-primary-600 text-white text-[13px] rounded-xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95"
                                >
                                    Get Started
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`lg:hidden p-3 rounded-xl transition-all ${showSolid ? 'text-slate-800 hover:bg-slate-100' : 'text-white hover:bg-white/10'
                            }`}
                    >
                        {isOpen ? <HiX className="w-7 h-7" /> : <HiMenu className="w-7 h-7" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 shadow-2xl h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top duration-300">
                    <div className="px-6 py-8 space-y-6">
                        {navLinks.map((link) => (
                            <div key={link.name} className="border-b border-slate-50 pb-4 last:border-0">
                                {link.children ? (
                                    <>
                                        <button
                                            onClick={() => setServicesOpen(servicesOpen === link.name ? null : link.name)}
                                            className="flex items-center justify-between w-full py-2 text-lg font-black text-slate-800"
                                        >
                                            {link.name}
                                            <HiChevronDown className={`w-6 h-6 transition-transform ${servicesOpen === link.name ? 'rotate-180' : ''}`} />
                                        </button>
                                        {servicesOpen === link.name && (
                                            <div className="mt-4 space-y-3 pl-4">
                                                {link.children.map((child) => (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={`block py-2 text-sm font-bold ${pathname === child.href ? 'text-primary-600' : 'text-slate-500'}`}
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={link.href}
                                        className={`block py-2 text-lg font-black ${pathname === link.href ? 'text-primary-600' : 'text-slate-800'}`}
                                    >
                                        {link.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                        <div className="pt-8 space-y-4">
                            {isAuthenticated ? (
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Daily Credits</p>
                                        <UsageIndicator />
                                    </div>
                                    <UserBadge />
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { setIsOpen(false); setShowAuthModal(true, 'login'); }}
                                        className="w-full py-5 bg-slate-50 text-slate-900 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all font-[var(--font-heading)]"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => { setIsOpen(false); setShowAuthModal(true, 'signup'); }}
                                        className="w-full py-5 bg-primary-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-600/20 font-[var(--font-heading)]"
                                    >
                                        Join ScholarAssist
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
