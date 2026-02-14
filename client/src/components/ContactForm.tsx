'use client';
import { useState } from 'react';
import api from '@/lib/api';

export default function ContactForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            setError('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/contact', form);
            setSuccess(true);
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch {
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-600">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
                    <input id="contact-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400" placeholder="Your name" />
                </div>
                <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                    <input id="contact-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400" placeholder="your@email.com" />
                </div>
            </div>
            <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                <input id="contact-subject" type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400" placeholder="How can we help?" />
            </div>
            <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
                <textarea id="contact-message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 resize-none" placeholder="Your message..." />
            </div>
            <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-60">
                {loading ? 'Sending...' : 'Send Message'}
            </button>
        </form>
    );
}
