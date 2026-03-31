import { HiStar, HiBadgeCheck, HiOfficeBuilding } from 'react-icons/hi';

interface TestimonialCardProps {
    name: string;
    role: string;
    content: string;
    rating: number;
    premiumStatus?: string;
    workspace?: string;
}

export default function TestimonialCard({ name, role, content, rating, premiumStatus, workspace }: TestimonialCardProps) {
    const isPremium = premiumStatus === 'approved';
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 card-hover h-full flex flex-col group transition-all duration-500 hover:shadow-2xl hover:shadow-primary-600/5 hover:-translate-y-1">
            {/* Rating Stars */}
            <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                    <HiStar
                        key={i}
                        className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                            i < rating ? 'text-amber-400' : 'text-slate-100'
                        }`}
                        style={{ transitionDelay: `${i * 50}ms` }}
                    />
                ))}
            </div>

            {/* Testimonial Content */}
            <div className="relative flex-1 mb-8">
                <span className="absolute -top-4 -left-4 text-6xl text-slate-100 font-serif select-none group-hover:text-primary-100 transition-colors">&ldquo;</span>
                <p className="relative z-10 text-slate-600 text-[15px] leading-relaxed font-medium italic">
                    {content}
                </p>
            </div>

            {/* Scholar Identity Footer */}
            <div className="pt-6 border-t border-slate-50 mt-auto flex items-center gap-4">
                {/* High-Fidelity Avatar */}
                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-lg transition-transform group-hover:rotate-3 group-hover:scale-105 ${
                    isPremium 
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                        : 'bg-primary-900 shadow-primary-900/10'
                }`}>
                    {initial}
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-black text-slate-900 text-sm tracking-tight truncate">{name}</p>
                        {isPremium && (
                            <HiBadgeCheck className="w-4 h-4 text-primary-500 shrink-0 drop-shadow-sm" />
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none shrink-0">
                                {role || 'Scholar'}
                            </p>
                            {workspace && (
                                <div className="flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <HiOfficeBuilding className="w-3 h-3 text-slate-300 shrink-0" />
                                        <span className="text-[10px] font-bold tracking-tight truncate">
                                            {workspace}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
