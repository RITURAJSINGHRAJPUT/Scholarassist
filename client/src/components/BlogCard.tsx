import Link from 'next/link';

interface BlogCardProps {
    title: string;
    excerpt: string;
    slug: string;
    category?: string;
    date: string;
    author?: string;
    featured_image?: string;
}

function getImageUrl(path: string): string {
    const base = typeof window !== 'undefined'
        ? (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000')
        : 'http://localhost:5000';
    return `${base}${path}`;
}

export default function BlogCard({ title, excerpt, slug, category, date, author, featured_image }: BlogCardProps) {
    return (
        <article className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 card-hover">
            {featured_image ? (
                <div className="h-48 overflow-hidden">
                    <img
                        src={getImageUrl(featured_image)}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement) {
                                target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100 flex items-center justify-center"><div class="w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm"><svg class="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div></div>`;
                            }
                        }}
                    />
                </div>
            ) : (
                <div className="h-48 bg-gradient-to-br from-primary-100 via-primary-50 to-accent-400/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
                        <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                </div>
            )}
            <div className="p-6">
                {category && (
                    <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full mb-3">{category}</span>
                )}
                <h3 className="font-bold text-lg text-slate-900 mb-2 font-[var(--font-heading)] group-hover:text-primary-700 transition-colors line-clamp-2">
                    <Link href={`/blog/${slug}`}>{title}</Link>
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">{excerpt}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{author || 'ScholarAssist'}</span>
                    <time>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                </div>
            </div>
        </article>
    );
}
