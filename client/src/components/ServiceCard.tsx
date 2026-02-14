import Link from 'next/link';
import { IconType } from 'react-icons';

interface ServiceCardProps {
    title: string;
    description: string;
    icon: IconType;
    href: string;
    features?: string[];
}

export default function ServiceCard({ title, description, icon: Icon, href, features }: ServiceCardProps) {
    return (
        <div className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 card-hover">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-6 group-hover:from-primary-500 group-hover:to-primary-700 transition-all duration-300">
                <Icon className="w-7 h-7 text-primary-700 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 font-[var(--font-heading)]">{title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">{description}</p>
            {features && (
                <ul className="space-y-2 mb-6">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                            <svg className="w-4 h-4 text-primary-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {f}
                        </li>
                    ))}
                </ul>
            )}
            <Link
                href={href}
                className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm hover:text-primary-800 transition-colors group-hover:gap-3"
            >
                Learn More
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </Link>
        </div>
    );
}
