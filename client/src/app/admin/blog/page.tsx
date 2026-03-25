'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { HiPlus, HiTrash, HiPencil, HiEye, HiEyeOff } from 'react-icons/hi';

interface Post {
    id: string; title: string; slug: string; published: boolean; category_name: string; author: string; created_at: string;
}

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/blog/admin/posts').then(res => setPosts(res.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const deletePost = async (id: string) => {
        if (!confirm('Delete this post?')) return;
        try { await api.delete(`/blog/admin/posts/${id}`); setPosts(posts.filter(p => p.id !== id)); } catch { /* ignore */ }
    };

    const togglePublish = async (id: string, published: boolean) => {
        try {
            await api.put(`/blog/admin/posts/${id}`, { published: !published });
            setPosts(posts.map(p => p.id === id ? { ...p, published: !published } : p));
        } catch { /* ignore */ }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)]">Blog Management</h1>
                <Link href="/admin/blog/new" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
                    <HiPlus className="w-4 h-4" /> New Post
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {posts.length === 0 ? (
                    <p className="p-8 text-slate-500 text-sm text-center">No blog posts yet. Create your first post!</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left p-4 font-medium text-slate-500">Title</th>
                                <th className="text-left p-4 font-medium text-slate-500 hidden md:table-cell">Category</th>
                                <th className="text-left p-4 font-medium text-slate-500 hidden md:table-cell">Date</th>
                                <th className="text-left p-4 font-medium text-slate-500">Status</th>
                                <th className="text-right p-4 font-medium text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {posts.map(post => (
                                <tr key={post.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-900">{post.title}</td>
                                    <td className="p-4 text-slate-500 hidden md:table-cell">{post.category_name || '—'}</td>
                                    <td className="p-4 text-slate-500 hidden md:table-cell">{new Date(post.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${post.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => togglePublish(post.id, post.published)} className="p-2 hover:bg-slate-100 rounded-lg" title={post.published ? 'Unpublish' : 'Publish'}>
                                                {post.published ? <HiEyeOff className="w-4 h-4 text-slate-500" /> : <HiEye className="w-4 h-4 text-green-500" />}
                                            </button>
                                            <Link href={`/admin/blog/edit/${post.id}`} className="p-2 hover:bg-slate-100 rounded-lg"><HiPencil className="w-4 h-4 text-primary-500" /></Link>
                                            <button onClick={() => deletePost(post.id)} className="p-2 hover:bg-red-50 rounded-lg"><HiTrash className="w-4 h-4 text-red-500" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
