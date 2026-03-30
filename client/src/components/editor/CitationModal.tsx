'use client';

import React, { useState, useEffect } from 'react';
import { HiOutlineBookOpen, HiX } from 'react-icons/hi';

interface CitationFormData {
    type: string;
    author: string;
    year: string;
    title: string;
    journal: string;
    doi: string;
    volumeIssue: string;
    pages: string;
}

interface CitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CitationFormData) => void;
}

export default function CitationModal({ isOpen, onClose, onSubmit }: CitationModalProps) {
    const [formData, setFormData] = useState<CitationFormData>({
        type: 'Journal',
        author: '',
        year: '',
        title: '',
        journal: '',
        doi: '',
        volumeIssue: '',
        pages: '',
    });

    const [preview, setPreview] = useState('');

    useEffect(() => {
        // Simple APA Preview Logic
        const { author, year, title, journal, volumeIssue, pages, doi } = formData;
        let p = '';
        if (author) p += `${author} `;
        if (year) p += `(${year}). `;
        if (title) p += `${title}. `;
        if (journal) p += `${journal}, `;
        if (volumeIssue) p += `${volumeIssue}, `;
        if (pages) p += `${pages}. `;
        if (doi) p += `${doi}`;
        
        setPreview(p.trim() || 'Citation preview will appear here...');
    }, [formData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
        setFormData({
            type: 'Journal',
            author: '',
            year: '',
            title: '',
            journal: '',
            doi: '',
            volumeIssue: '',
            pages: '',
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-slate-100">
                    <h3 className="text-2xl font-bold text-slate-900">Add Citation</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Citation Type */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Citation Type</label>
                        <select 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all cursor-pointer"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option>Journal</option>
                            <option>Book</option>
                            <option>Website</option>
                            <option>Conference Paper</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Author Name</label>
                            <input 
                                type="text" required placeholder="e.g. Smith, J." 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                value={formData.author}
                                onChange={e => setFormData({ ...formData, author: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Publication Year</label>
                            <input 
                                type="text" required placeholder="2024" 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Title of Source</label>
                        <input 
                            type="text" required placeholder="Enter the full title of the source" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Publisher / Journal Name</label>
                        <input 
                            type="text" placeholder="Nature Communications" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                            value={formData.journal}
                            onChange={e => setFormData({ ...formData, journal: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">DOI / URL</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔗</span>
                            <input 
                                type="text" placeholder="https://doi.org/10.1145/..." 
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                value={formData.doi}
                                onChange={e => setFormData({ ...formData, doi: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Volume / Issue <span className="text-slate-300 font-medium normal-case">(Optional)</span></label>
                            <input 
                                type="text" placeholder="12(4)" 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                value={formData.volumeIssue}
                                onChange={e => setFormData({ ...formData, volumeIssue: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Page Numbers <span className="text-slate-300 font-medium normal-case">(Optional)</span></label>
                            <input 
                                type="text" placeholder="104-122" 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                value={formData.pages}
                                onChange={e => setFormData({ ...formData, pages: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* APA Preview Section */}
                    <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-6">
                        <label className="block text-[10px] font-bold text-primary-600 uppercase tracking-[2px] mb-3">APA Citation Preview</label>
                        <p className="text-sm italic text-slate-700 leading-relaxed font-serif">
                            {preview}
                        </p>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-[#1e3a8a] text-white text-sm font-bold rounded-2xl hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                    >
                        Submit Citation
                    </button>
                </div>
            </div>
        </div>
    );
}
