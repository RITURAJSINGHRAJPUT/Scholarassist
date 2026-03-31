'use client';
'use client';
'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ImageModal from '@/components/admin/ImageModal';
import { getImageUrl } from '@/lib/imageUtils';

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

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const handleImageSelect = (url: string) => {
        setForm(prev => ({ ...prev, featured_image: url }));
        setImagePreview(getImageUrl(url));
    };

    const removeImage = () => {
        setImagePreview(null);
        setForm(prev => ({ ...prev, featured_image: '' }));
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
                                    <button type="button" onClick={removeImage}
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
                        <ImageModal 
                            isOpen={isImageModalOpen} 
                            onClose={() => setIsImageModalOpen(false)} 
                            onSelect={handleImageSelect}
                            currentImage={form.featured_image}
                        />
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
