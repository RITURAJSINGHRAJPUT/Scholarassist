'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Category { id: string; name: string; }

export default function NewBlogPostPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: '', content: '', excerpt: '', category_id: '',
        published: false, meta_title: '', meta_description: '', featured_image: ''
    });

    useEffect(() => {
        api.get('/blog/categories').then(res => setCategories(res.data)).catch(() => { });
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const { data } = await api.post('/blog/admin/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setForm(prev => ({ ...prev, featured_image: data.url }));
        } catch {
            setError('Failed to upload image');
            setImagePreview(null);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setForm(prev => ({ ...prev, featured_image: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCreateCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            const { data } = await api.post('/blog/admin/categories', { name: newCategory.trim() });
            setCategories(prev => [...prev, data]);
            setForm(prev => ({ ...prev, category_id: data.id }));
            setNewCategory('');
            setShowNewCategory(false);
        } catch {
            setError('Failed to create category');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.content) { setError('Title and content are required'); return; }
        setLoading(true); setError('');
        try {
            await api.post('/blog/admin/posts', form);
            router.push('/admin/blog');
        } catch { setError('Failed to create post'); } finally { setLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)]">New Blog Post</h1>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-5">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900" placeholder="Blog post title" />
                    </div>

                    {/* Featured Image */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Featured Image</label>
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-xl border border-slate-200" />
                                <button type="button" onClick={removeImage}
                                    className="absolute top-3 right-3 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 shadow-lg">
                                    ✕
                                </button>
                                {uploading && (
                                    <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors">
                                <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-slate-500">Click to upload featured image</p>
                                <p className="text-xs text-slate-400 mt-1">JPEG, PNG, GIF, or WebP (max 10MB)</p>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageUpload} className="hidden" />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Content *</label>
                        <textarea rows={15} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-mono text-sm" placeholder="Write your content..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Excerpt */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Excerpt</label>
                            <textarea rows={3} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900" placeholder="Short excerpt..." />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                            {!showNewCategory ? (
                                <>
                                    <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white">
                                        <option value="">Select a category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setShowNewCategory(true)}
                                        className="text-xs text-primary-600 hover:text-primary-800 mt-2 font-medium">
                                        + Create new category
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)}
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-900" placeholder="Category name" />
                                        <button type="button" onClick={handleCreateCategory}
                                            className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium">Add</button>
                                    </div>
                                    <button type="button" onClick={() => setShowNewCategory(false)}
                                        className="text-xs text-slate-500 hover:text-slate-700">← Back to list</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SEO Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Title</label>
                            <input type="text" value={form.meta_title} onChange={e => setForm({ ...form, meta_title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900" placeholder="SEO title" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Description</label>
                            <input type="text" value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900" placeholder="SEO description" />
                        </div>
                    </div>

                    {/* Publish Toggle */}
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="published" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                        <label htmlFor="published" className="text-sm text-slate-700">Publish immediately</label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button type="submit" disabled={loading || uploading}
                            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60">
                            {loading ? 'Creating...' : 'Create Post'}
                        </button>
                        <button type="button" onClick={() => router.push('/admin/blog')}
                            className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
