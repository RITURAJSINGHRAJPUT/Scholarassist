import { HiStar } from 'react-icons/hi';

interface TestimonialCardProps {
    name: string;
    role: string;
    content: string;
    rating: number;
}

export default function TestimonialCard({ name, role, content, rating }: TestimonialCardProps) {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 card-hover h-full flex flex-col">
            <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <HiStar
                        key={i}
                        className={`w-5 h-5 ${i < rating ? 'text-amber-400' : 'text-slate-200'}`}
                    />
                ))}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 italic flex-1">&ldquo;{content}&rdquo;</p>
            <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                    {name.charAt(0)}
                </div>
                <div>
                    <p className="font-semibold text-slate-900 text-sm">{name}</p>
                    <p className="text-slate-500 text-xs">{role}</p>
                </div>
            </div>
        </div>
    );
}
