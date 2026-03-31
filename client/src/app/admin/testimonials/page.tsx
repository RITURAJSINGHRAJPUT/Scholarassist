'use client';
'use client';
'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { HiStar, HiCheck, HiX, HiClock, HiTrash, HiPencilAlt, HiCheckCircle, HiBan } from 'react-icons/hi';

interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
    published: boolean;
    display_order: number;
    status: 'pending' | 'approved' | 'rejected';
    approved_at?: string;
    created_at?: string;
}

export default function AdminTestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [form, setForm] = useState({ 
        name: '', 
        role: '', 
        content: '', 
        rating: 5, 
        published: true, 
        display_order: 0,
        status: 'approved' as 'pending' | 'approved' | 'rejected'
    });

    const fetchTestimonials = useCallback(() => {
        setLoading(true);
        const url = filter === 'all' ? '/testimonials/admin' : `/testimonials/admin?status=${filter}`;
        api.get(url)
            .then(res => setTestimonials(res.data))
            .catch(() => setError('Failed to load testimonials'))
            .finally(() => setLoading(false));
    }, [filter]);

    useEffect(() => { 
        fetchTestimonials(); 
    }, [fetchTestimonials]);

    const resetForm = () => {
        setForm({ name: '', role: '', content: '', rating: 5, published: true, display_order: 0, status: 'approved' });
        setEditingId(null);
        setShowForm(false);
        setError('');
    };

    const handleEdit = (t: Testimonial) => {
        setForm({ 
            name: t.name, 
            role: t.role || '', 
            content: t.content, 
            rating: t.rating, 
            published: t.published, 
            display_order: t.display_order,
            status: t.status
        });
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

    const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
        try {
            await api.patch(`/testimonials/admin/${id}/status`, { status: newStatus });
            fetchTestimonials();
        } catch {
            setError('Failed to update status');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-1"><HiCheckCircle className="w-3 h-3" /> Approved</span>;
            case 'pending':
                return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 flex items-center gap-1"><HiClock className="w-3 h-3" /> Pending</span>;
            case 'rejected':
                return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-100 flex items-center gap-1"><HiBan className="w-3 h-3" /> Rejected</span>;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 font-[var(--font-heading)]">Testimonials</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage user submissions and moderation.</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95">
                    <HiPencilAlt className="w-4 h-4" />
                    Add Manual Entry
                </button>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-bold flex items-center gap-3 animate-shake">
                    <HiBan className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Form Modal/Section */}
            {showForm && (
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit' : 'New'} Testimonial</h2>
                        <button onClick={resetForm} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                            <HiX className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Full Name *</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-xl text-slate-900 font-medium transition-all" placeholder="e.g. John Doe" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Role / Institution</label>
                                <input type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-xl text-slate-900 font-medium transition-all" placeholder="e.g. PhD Student, Stanford" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Testimonial Content *</label>
                            <textarea rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-xl text-slate-900 font-medium transition-all" placeholder="The feedback content..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Star Rating</label>
                                <div className="flex gap-1.5 h-12 items-center">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })}
                                            className={`text-2xl ${star <= form.rating ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'} hover:text-amber-400 transition-all active:scale-90`}>
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sorting Order</label>
                                <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-xl text-slate-900 font-medium transition-all" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Status</label>
                                <select 
                                    value={form.status} 
                                    onChange={e => setForm({ ...form, status: e.target.value as any })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-xl text-slate-900 font-medium transition-all appearance-none"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                            <button type="submit" className="flex-1 py-4 bg-primary-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95">
                                {editingId ? 'Update Record' : 'Save Testimonial'}
                            </button>
                            <button type="button" onClick={resetForm}
                                className="flex-1 py-4 border-2 border-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit overflow-x-auto max-w-full">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2.5 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
                            filter === f 
                                ? 'bg-primary-600 text-white shadow-md' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 italic text-slate-400 font-medium">
                        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                        Refreshing records...
                    </div>
                ) : testimonials.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-medium">
                        No testimonials found matching this criteria.
                    </div>
                ) : (
                    testimonials.map(t => (
                        <div key={t.id} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center flex-wrap gap-3 mb-3">
                                        <h3 className="font-black text-slate-900 text-base">{t.name}</h3>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                        <span className="text-xs font-bold text-slate-400">{t.role || 'Unspecified Role'}</span>
                                        <div className="ml-auto block">
                                            {getStatusBadge(t.status)}
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5 mb-4">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span key={star} className={`text-base ${star <= t.rating ? 'text-amber-400' : 'text-slate-100'}`}>★</span>
                                        ))}
                                    </div>
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed italic border-l-4 border-slate-50 pl-4 py-1 mb-4">&ldquo;{t.content}&rdquo;</p>
                                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        <span>Order: {t.display_order}</span>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                        <span>Submitted: {new Date(t.created_at as any).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6">
                                    {t.status === 'pending' && (
                                        <>
                                            <button 
                                                onClick={() => updateStatus(t.id, 'approved')}
                                                className="w-full px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-1.5"
                                            >
                                                <HiCheck className="w-3.5 h-3.5" /> Approve
                                            </button>
                                            <button 
                                                onClick={() => updateStatus(t.id, 'rejected')}
                                                className="w-full px-4 py-2 bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-100 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            >
                                                <HiX className="w-3.5 h-3.5" /> Reject
                                            </button>
                                        </>
                                    )}
                                    {t.status === 'rejected' && (
                                        <button 
                                            onClick={() => updateStatus(t.id, 'approved')}
                                            className="w-full px-4 py-2 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                        >
                                            <HiCheck className="w-3.5 h-3.5" /> Re-Approve
                                        </button>
                                    )}
                                    {t.status === 'approved' && (
                                        <button 
                                            onClick={() => updateStatus(t.id, 'rejected')}
                                            className="w-full px-4 py-2 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-50 hover:text-rose-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                        >
                                            <HiBan className="w-3.5 h-3.5" /> Revoke
                                        </button>
                                    )}
                                    <div className="flex w-full gap-2 mt-2">
                                        <button onClick={() => handleEdit(t)}
                                            className="grow p-2.5 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Edit">
                                            <HiPencilAlt className="w-4 h-4 mx-auto" />
                                        </button>
                                        <button onClick={() => handleDelete(t.id)}
                                            className="grow p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                                            <HiTrash className="w-4 h-4 mx-auto" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
