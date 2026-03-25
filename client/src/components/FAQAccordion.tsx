'use client';
import { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQAccordionProps {
    items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={`rounded-xl border transition-all duration-300 ${openIndex === index ? 'border-primary-200 bg-primary-50/30 shadow-sm' : 'border-slate-200 bg-white'
                        }`}
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex items-center justify-between p-5 text-left"
                    >
                        <span className={`font-semibold pr-8 ${openIndex === index ? 'text-primary-800' : 'text-slate-800'}`}>
                            {item.question}
                        </span>
                        <HiChevronDown
                            className={`w-5 h-5 shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-primary-600' : 'text-slate-400'
                                }`}
                        />
                    </button>
                    <div
                        className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 pb-5' : 'max-h-0'
                            }`}
                    >
                        <p className="px-5 text-slate-600 text-sm leading-relaxed">{item.answer}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
