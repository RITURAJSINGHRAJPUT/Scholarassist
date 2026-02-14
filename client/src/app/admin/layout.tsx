'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { HiHome, HiInbox, HiPencilAlt, HiLogout, HiMenu, HiX, HiStar } from 'react-icons/hi';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: HiHome },
    { name: 'Inquiries', href: '/admin/inquiries', icon: HiInbox },
    { name: 'Blog', href: '/admin/blog', icon: HiPencilAlt },
    { name: 'Testimonials', href: '/admin/testimonials', icon: HiStar },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [admin, setAdmin] = useState<{ username: string } | null>(null);

    useEffect(() => {
        if (pathname === '/admin/login') return;
        const token = localStorage.getItem('admin_token');
        const user = localStorage.getItem('admin_user');
        if (!token || !user) {
            router.push('/admin/login');
            return;
        }
        setAdmin(JSON.parse(user));
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/admin/login');
    };

    if (pathname === '/admin/login') return <>{children}</>;
    if (!admin) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-primary-950 text-white transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
                            <span className="text-white font-bold font-[var(--font-heading)]">S</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-sm">ScholarAssist</h2>
                            <p className="text-primary-400 text-xs">Admin Panel</p>
                        </div>
                    </div>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === item.href ? 'bg-primary-800 text-white' : 'text-primary-300 hover:bg-primary-900 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold">
                            {admin.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-primary-300">{admin.username}</span>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary-300 hover:bg-primary-900 hover:text-white transition-colors w-full">
                        <HiLogout className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
                        <HiMenu className="w-5 h-5" />
                    </button>
                    <div className="text-sm text-slate-500">
                        {navItems.find(n => n.href === pathname)?.name || 'Admin'}
                    </div>
                    <Link href="/" className="text-sm text-primary-600 hover:text-primary-800 font-medium" target="_blank">
                        View Website &rarr;
                    </Link>
                </header>
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
