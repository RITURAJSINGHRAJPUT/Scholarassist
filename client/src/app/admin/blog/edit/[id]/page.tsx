'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import ImageModal from '@/components/admin/ImageModal';
import { getImageUrl } from '@/lib/imageUtils';

interface Category { id: string; name: string; }

export default function EditBlogPostPage() {
    const router = useRouter();
    const params = useParams();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ 
        title: '', content: '', excerpt: '', category_id: '', 
        published: false, meta_title: '', meta_description: '', featured_image: '' 
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get('/blog/categories').then(res => setCategories(res.data)),
            api.get(`/blog/admin/posts`).then(res => {
                const post = res.data.find((p: { id: string }) => p.id === params.id);
                if (post) {
                    setForm({ 
                        title: post.title, 
                        content: post.content || '', 
                        excerpt: post.excerpt || '', 
                        category_id: post.category_id || '', 
                        published: post.published, 
                        meta_title: post.meta_title || '', 
                        meta_description: post.meta_description || '',
                        featured_image: post.featured_image || ''
                    });
                    if (post.featured_image) {
                        setImagePreview(getImageUrl(post.featured_image));
                    }
                }
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
                    {/* Featured Image */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Featured Image</label>
                        {imagePreview ? (
                            <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[256px]">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="w-full h-64 object-cover" 
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.setAttribute('data-error', 'true');
                                    }}
                                    onLoad={(e) => {
                                        e.currentTarget.style.display = 'block';
                                        e.currentTarget.parentElement?.setAttribute('data-error', 'false');
                                    }}
                                />
                                <div className="hidden group-[[data-error=true]]:flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                    <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-sm font-bold text-slate-500">Image not visible</p>
                                    <p className="text-xs mt-1">If using Google Drive, ensure the file is shared with <strong>"Anyone with the link"</strong>.</p>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => setIsImageModalOpen(true)}
                                        className="px-4 py-2 bg-white text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-50 shadow-lg">
                                        Change Image
                                    </button>
                                    <button type="button" onClick={() => { setImagePreview(null); setForm(prev => ({ ...prev, featured_image: '' })); }}
                                        className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 shadow-lg">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => setIsImageModalOpen(true)}
                                className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors">
                                <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-slate-500">Click to add featured image</p>
                                <p className="text-xs text-slate-400 mt-1">Upload file or use external / Google Drive link</p>
                            </div>
                        )}
                    </div>

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
            <ImageModal 
                isOpen={isImageModalOpen} 
                onClose={() => setIsImageModalOpen(false)} 
                onSelect={(url) => {
                    setForm(prev => ({ ...prev, featured_image: url }));
                    setImagePreview(getImageUrl(url));
                }}
                currentImage={form.featured_image}
            />
        </div>
    );
}
