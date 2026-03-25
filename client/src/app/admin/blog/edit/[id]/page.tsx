'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';

interface Category { id: string; name: string; }

export default function EditBlogPostPage() {
    const router = useRouter();
    const params = useParams();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ title: '', content: '', excerpt: '', category_id: '', published: false, meta_title: '', meta_description: '' });

    useEffect(() => {
        Promise.all([
            api.get('/blog/categories').then(res => setCategories(res.data)),
            api.get(`/blog/admin/posts`).then(res => {
                const post = res.data.find((p: { id: string }) => p.id === params.id);
                if (post) setForm({ title: post.title, content: post.content || '', excerpt: post.excerpt || '', category_id: post.category_id || '', published: post.published, meta_title: post.meta_title || '', meta_description: post.meta_description || '' });
            }),
        ]).catch(() => { }).finally(() => setFetching(false));
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.content) { setError('Title and content required'); return; }
        setLoading(true); setError('');
        try {
            await api.put(`/blog/admin/posts/${params.id}`, form);
            router.push('/admin/blog');
        } catch { setError('Failed to update post'); } finally { setLoading(false); }
    };

    if (fetching) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)]">Edit Blog Post</h1>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-5">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Content *</label>
                        <textarea rows={15} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-mono text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Excerpt</label>
                            <textarea rows={3} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900" /></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white">
                                <option value="">No category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Title</label>
                            <input type="text" value={form.meta_title} onChange={e => setForm({ ...form, meta_title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900" /></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Description</label>
                            <input type="text" value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900" /></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="published-edit" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                        <label htmlFor="published-edit" className="text-sm text-slate-700">Published</label>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" disabled={loading}
                            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => router.push('/admin/blog')}
                            className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
