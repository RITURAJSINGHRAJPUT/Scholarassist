'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';
import { FaLinkedin, FaInstagram, FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export default function Footer() {
    const pathname = usePathname();
    if (pathname?.startsWith('/admin')) return null;

    return (
        <footer className="bg-primary-950 text-white">
            {/* CTA Bar */}
            <div className="bg-gradient-to-r from-primary-700 to-primary-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-bold font-[var(--font-heading)]">Ready to Excel Academically?</h3>
                        <p className="text-primary-200 mt-1">Get expert guidance for your academic projects today.</p>
                    </div>
                    <Link
                        href="/consultation"
                        className="px-8 py-3.5 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:-translate-y-0.5"
                    >
                        Start Your Consultation
                    </Link>
                </div>
            </div>

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <span className="text-white font-bold text-lg font-[var(--font-heading)]">S</span>
                            </div>
                            <span className="text-xl font-bold font-[var(--font-heading)]">
                                Scholar<span className="text-primary-400">Assist</span>
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Professional academic guidance and support for students worldwide. Expert assistance with thesis writing, research papers, and academic projects.
                        </p>
                        <div className="flex gap-3 mt-6">
                            {[
                                { Icon: FaXTwitter, href: '#' },
                                { Icon: FaLinkedin, href: '#' },
                                { Icon: FaInstagram, href: '#' },
                                { Icon: FaGithub, href: '#' },
                                { Icon: HiMail, href: 'mailto:contact@scholarassist.com' }
                            ].map((item, i) => (
                                <a
                                    key={i}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary-600 transition-colors"
                                >
                                    <item.Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4">Services</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/services/thesis" className="hover:text-primary-400 transition-colors">Thesis Assistance</Link></li>
                            <li><Link href="/services/research-paper" className="hover:text-primary-400 transition-colors">Research Paper Support</Link></li>
                            <li><Link href="/services/essay-project" className="hover:text-primary-400 transition-colors">Academic Project Support</Link></li>
                            <li><Link href="/consultation" className="hover:text-primary-400 transition-colors">Free Consultation</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
                            <li><Link href="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
                            <li><Link href="/confidentiality" className="hover:text-primary-400 transition-colors">Confidentiality & Ethics</Link></li>
                            <li><Link href="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <HiMail className="w-5 h-5 text-primary-400 mt-0.5 shrink-0" />
                                <span>contact@scholarassist.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <HiPhone className="w-5 h-5 text-primary-400 mt-0.5 shrink-0" />
                                <span>+91 9979550377</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <HiLocationMarker className="w-5 h-5 text-primary-400 mt-0.5 shrink-0" />
                                <span>Surat, Gujarat, India</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} ScholarAssist. All rights reserved.</p>
                    <div className="flex gap-6 mt-3 md:mt-0">
                        <Link href="/confidentiality" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
                        <Link href="/confidentiality" className="hover:text-primary-400 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
