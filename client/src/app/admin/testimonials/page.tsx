'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
    published: boolean;
    display_order: number;
}

export default function AdminTestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', role: '', content: '', rating: 5, published: true, display_order: 0 });

    const fetchTestimonials = () => {
        api.get('/testimonials/admin')
            .then(res => setTestimonials(res.data))
            .catch(() => setError('Failed to load testimonials'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchTestimonials(); }, []);

    const resetForm = () => {
        setForm({ name: '', role: '', content: '', rating: 5, published: true, display_order: 0 });
        setEditingId(null);
        setShowForm(false);
        setError('');
    };

    const handleEdit = (t: Testimonial) => {
        setForm({ name: t.name, role: t.role || '', content: t.content, rating: t.rating, published: t.published, display_order: t.display_order });
        setEditingId(t.id);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.content) { setError('Name and content are required'); return; }
        setError('');
        try {
            if (editingId) {
                await api.put(`/testimonials/admin/${editingId}`, form);
            } else {
                await api.post('/testimonials/admin', form);
            }
            resetForm();
            fetchTestimonials();
        } catch {
            setError('Failed to save testimonial');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this testimonial?')) return;
        try {
            await api.delete(`/testimonials/admin/${id}`);
            fetchTestimonials();
        } catch {
            setError('Failed to delete');
        }
    };

    const togglePublish = async (t: Testimonial) => {
        try {
            await api.put(`/testimonials/admin/${t.id}`, { published: !t.published });
            fetchTestimonials();
        } catch {
            setError('Failed to update');
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)]">Testimonials</h1>
                <button onClick={() => { resetForm(); setShowForm(true); }}
                    className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors text-sm">
                    + Add Testimonial
                </button>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">{editingId ? 'Edit' : 'New'} Testimonial</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" placeholder="Student name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role / School</label>
                                <input type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" placeholder="e.g. PhD Student, MIT" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Testimonial *</label>
                            <textarea rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" placeholder="What the student said..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rating (1-5)</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })}
                                            className={`text-2xl ${star <= form.rating ? 'text-yellow-400' : 'text-slate-300'} hover:text-yellow-400 transition-colors`}>
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
                                <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300" />
                                    <span className="text-sm text-slate-700">Published</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 text-sm">
                                {editingId ? 'Update' : 'Create'}
                            </button>
                            <button type="button" onClick={resetForm}
                                className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 text-sm">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {testimonials.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No testimonials yet. Click &quot;Add Testimonial&quot; to create one.</div>
                ) : (
                    testimonials.map(t => (
                        <div key={t.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-slate-900">{t.name}</h3>
                                    {t.role && <span className="text-xs text-slate-500">— {t.role}</span>}
                                    {!t.published && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Draft</span>}
                                </div>
                                <div className="flex gap-0.5 mb-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span key={star} className={`text-sm ${star <= t.rating ? 'text-yellow-400' : 'text-slate-300'}`}>★</span>
                                    ))}
                                </div>
                                <p className="text-slate-600 text-sm line-clamp-2">{t.content}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => togglePublish(t)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${t.published ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    {t.published ? 'Published' : 'Unpublished'}
                                </button>
                                <button onClick={() => handleEdit(t)}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(t.id)}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
