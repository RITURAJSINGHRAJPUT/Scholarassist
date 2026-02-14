'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import BlogCard from '@/components/BlogCard';
import api from '@/lib/api';

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    category_name?: string;
    author?: string;
    created_at: string;
    featured_image?: string;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/blog/posts')
            .then(res => setPosts(res.data.posts || []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <section className="hero-gradient pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-sm font-medium rounded-full mb-4">Blog</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-heading)] mb-4">Academic Insights &amp; Tips</h1>
                    <p className="text-primary-200 text-lg max-w-2xl mx-auto">Expert advice, research tips, and academic writing guidance from our team of specialists.</p>
                </div>
            </section>

            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                            <p className="text-slate-500 mt-4">Loading posts...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Posts Yet</h3>
                            <p className="text-slate-500">Blog posts will appear here once published from the admin panel.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <BlogCard
                                    key={post.id}
                                    title={post.title}
                                    excerpt={post.excerpt || ''}
                                    slug={post.slug}
                                    category={post.category_name}
                                    date={post.created_at}
                                    author={post.author}
                                    featured_image={post.featured_image}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
