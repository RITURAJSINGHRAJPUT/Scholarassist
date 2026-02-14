'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category_name?: string;
    author?: string;
    created_at: string;
    featured_image?: string;
}

const API_BASE = 'http://localhost:5000';

export default function BlogPostPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!slug) return;
        api.get(`/blog/posts/${slug}`)
            .then(res => setPost(res.data))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 mt-4">Loading post...</p>
                </div>
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <>
                <section className="hero-gradient pt-32 pb-10">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link href="/blog" className="text-primary-200 hover:text-white text-sm mb-4 inline-block">&larr; Back to Blog</Link>
                        <h1 className="text-3xl md:text-4xl font-bold text-white font-[var(--font-heading)] mb-3">Post Not Found</h1>
                    </div>
                </section>
                <section className="py-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-slate-600 mb-6">The blog post you&apos;re looking for doesn&apos;t exist or hasn&apos;t been published yet.</p>
                        <Link href="/blog" className="text-primary-600 font-semibold hover:text-primary-800">&larr; Back to All Posts</Link>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <section className="hero-gradient pt-32 pb-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/blog" className="text-primary-200 hover:text-white text-sm mb-4 inline-block">&larr; Back to Blog</Link>
                    {post.category_name && (
                        <span className="inline-block px-3 py-1 bg-white/10 text-white/90 text-xs font-medium rounded-full mb-3">{post.category_name}</span>
                    )}
                    <h1 className="text-3xl md:text-4xl font-bold text-white font-[var(--font-heading)] mb-3">{post.title}</h1>
                    <p className="text-primary-200 text-sm">
                        By {post.author || 'ScholarAssist Team'} • {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
            </section>

            <section className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {post.featured_image && (
                        <div className="mb-8">
                            <img
                                src={`${API_BASE}${post.featured_image}`}
                                alt={post.title}
                                className="w-full h-80 object-cover rounded-2xl shadow-sm"
                            />
                        </div>
                    )}
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100">
                        <div className="prose prose-lg prose-slate max-w-none whitespace-pre-wrap">
                            {post.content}
                        </div>
                    </div>
                    <div className="mt-8 text-center">
                        <Link href="/blog" className="text-primary-600 font-semibold hover:text-primary-800">&larr; Back to All Posts</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
