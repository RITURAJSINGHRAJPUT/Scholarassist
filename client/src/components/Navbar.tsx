'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiMenu, HiX, HiChevronDown } from 'react-icons/hi';

const services = [
    { name: 'Thesis Assistance', href: '/services/thesis' },
    { name: 'Research Paper Support', href: '/services/research-paper' },
    { name: 'Essay & Project Help', href: '/services/essay-project' },
];

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services', children: services },
    { name: 'Confidentiality', href: '/confidentiality' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
        setServicesOpen(false);
    }, [pathname]);

    if (pathname?.startsWith('/admin')) return null;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-primary-100'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg group-hover:shadow-primary-400/30 transition-shadow">
                            <span className="text-white font-bold text-lg font-[var(--font-heading)]">S</span>
                        </div>
                        <span className={`text-xl font-bold font-[var(--font-heading)] transition-colors ${scrolled ? 'text-primary-800' : 'text-white'}`}>
                            Scholar<span className="text-primary-400">Assist</span>
                        </span>
                    </Link>

                    {/* Desktop navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <div key={link.name} className="relative group">
                                {link.children ? (
                                    <>
                                        <button
                                            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-primary-50/80 ${pathname?.startsWith(link.href)
                                                    ? scrolled ? 'text-primary-700 bg-primary-50' : 'text-white bg-white/15'
                                                    : scrolled ? 'text-slate-700 hover:text-primary-700' : 'text-white/90 hover:text-white'
                                                }`}
                                        >
                                            {link.name}
                                            <HiChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                                        </button>
                                        <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                            <div className="bg-white rounded-xl shadow-xl border border-slate-100 py-2 min-w-[220px] animate-slide-down">
                                                {link.children.map((child) => (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={`block px-4 py-3 text-sm hover:bg-primary-50 transition-colors ${pathname === child.href ? 'text-primary-700 bg-primary-50 font-medium' : 'text-slate-600 hover:text-primary-700'
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
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-primary-50/80 ${pathname === link.href
                                                ? scrolled ? 'text-primary-700 bg-primary-50' : 'text-white bg-white/15'
                                                : scrolled ? 'text-slate-700 hover:text-primary-700' : 'text-white/90 hover:text-white'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                        <Link
                            href="/consultation"
                            className="ml-4 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 hover:-translate-y-0.5"
                        >
                            Free Consultation
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
                            }`}
                    >
                        {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl animate-slide-down">
                    <div className="px-4 py-4 space-y-1">
                        {navLinks.map((link) => (
                            <div key={link.name}>
                                {link.children ? (
                                    <>
                                        <button
                                            onClick={() => setServicesOpen(!servicesOpen)}
                                            className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-slate-700 hover:bg-primary-50 rounded-lg"
                                        >
                                            {link.name}
                                            <HiChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {servicesOpen && (
                                            <div className="ml-4 space-y-1">
                                                {link.children.map((child) => (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className="block px-4 py-2 text-sm text-slate-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg"
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
                                        className={`block px-4 py-3 text-sm font-medium rounded-lg ${pathname === link.href ? 'text-primary-700 bg-primary-50' : 'text-slate-700 hover:bg-primary-50'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                        <div className="pt-3 border-t border-slate-100">
                            <Link
                                href="/consultation"
                                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl"
                            >
                                Free Consultation
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
