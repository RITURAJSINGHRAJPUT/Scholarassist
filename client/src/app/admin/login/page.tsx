'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function AdminLoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/login', form);
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.admin));
            router.push('/admin');
        } catch {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl font-[var(--font-heading)]">S</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white font-[var(--font-heading)]">Admin Panel</h1>
                    <p className="text-primary-300 mt-1 text-sm">Sign in to manage ScholarAssist</p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                    {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-5">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="admin-username" className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                            <input id="admin-username" type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900" placeholder="admin" required />
                        </div>
                        <div>
                            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <input id="admin-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900" placeholder="••••••••" required />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-60">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
