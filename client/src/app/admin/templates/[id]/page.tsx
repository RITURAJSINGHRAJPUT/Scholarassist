'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { HiArrowLeft, HiSave, HiOutlineBookOpen, HiOutlineAcademicCap, HiOutlineBeaker, HiOutlineDocumentSearch, HiOutlineDocumentReport, HiOutlineCollection } from 'react-icons/hi';

const ICONS = [
    { id: 'academic', icon: HiOutlineAcademicCap, label: 'Academic' },
    { id: 'case', icon: HiOutlineCollection, label: 'Case Study' },
    { id: 'lit', icon: HiOutlineDocumentSearch, label: 'Literature' },
    { id: 'lab', icon: HiOutlineBeaker, label: 'Lab Experiment' },
    { id: 'ieee', icon: HiOutlineBookOpen, label: 'IEEE Format' },
];

const LAYOUTS = [
    { id: 'single', label: 'Single Column (Standard)' },
    { id: 'ieee-journal', label: 'Two Column (IEEE Standard)' },
    { id: 'academic', label: 'Academic Layout' },
];

export default function TemplateEditorPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: 'academic',
        content: '',
        layout: 'single',
        category: 'General',
        display_order: 0,
        is_active: true,
    });
    const [jsonError, setJsonError] = useState<string | null>(null);

    useEffect(() => {
        if (isNew) return;

        const fetchTemplate = async () => {
            try {
                const res = await api.get(`/templates/admin/${id}`);
                const template = res.data;
                setFormData({
                    title: template.title || '',
                    description: template.description || '',
                    icon: template.icon || 'academic',
                    content: JSON.stringify(template.content, null, 2),
                    layout: template.layout || 'single',
                    category: template.category || 'General',
                    display_order: template.display_order || 0,
                    is_active: template.is_active,
                });
            } catch (error) {
                console.error('Fetch template error:', error);
                alert('Failed to load template');
                router.push('/admin/templates');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [id, isNew, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setJsonError(null);

        try {
            const parsedContent = JSON.parse(formData.content);
            const payload = {
                ...formData,
                content: parsedContent,
            };

            if (isNew) {
                await api.post('/templates/admin', payload);
            } else {
                await api.put(`/templates/admin/${id}`, payload);
            }

            router.push('/admin/templates');
        } catch (error: any) {
            if (error instanceof SyntaxError) {
                setJsonError('Invalid JSON format for template content');
            } else {
                console.error('Save error:', error);
                alert('Failed to save template');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/templates" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <HiArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)]">
                        {isNew ? 'Create New Template' : `Edit: ${formData.title}`}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Template Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="e.g., Clinical Case Study"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all h-24 resize-none placeholder:text-slate-400 text-sm"
                                    placeholder="Briefly describe what this template is for..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Template Content (ProseMirror JSON)</label>
                            <span className="text-[10px] text-slate-400 font-medium">Use standardized Tiptap/ProseMirror JSON structure</span>
                        </div>
                        <div className="relative font-mono">
                            <textarea
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className={`w-full p-4 bg-slate-900 text-primary-300 border rounded-xl focus:ring-2 outline-none transition-all h-96 text-xs leading-relaxed ${
                                    jsonError ? 'border-red-500 focus:ring-red-500 shadow-red-50' : 'border-slate-800 focus:ring-primary-500'
                                }`}
                                spellCheck={false}
                                required
                            />
                            {jsonError && (
                                <div className="absolute bottom-4 left-4 right-4 p-2 bg-red-500/10 border border-red-500 text-red-500 text-[10px] font-bold rounded-lg flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                    {jsonError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Template Icon</label>
                            <div className="grid grid-cols-5 gap-2">
                                {ICONS.map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon: item.id })}
                                        className={`p-2.5 rounded-xl border transition-all group flex flex-col items-center gap-1 ${
                                            formData.icon === item.id 
                                                ? 'bg-primary-50 border-primary-500 text-primary-600 shadow-sm' 
                                                : 'bg-white border-slate-200 hover:border-primary-300 text-slate-400'
                                        }`}
                                        title={item.label}
                                    >
                                        <item.icon className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Editor Layout</label>
                            <select
                                value={formData.layout}
                                onChange={e => setFormData({ ...formData, layout: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm font-medium"
                            >
                                {LAYOUTS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm font-medium"
                                placeholder="General, Medical, Review..."
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-sm font-bold text-slate-700">Display Order</span>
                            <input
                                type="number"
                                value={formData.display_order}
                                onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-center text-xs font-bold outline-none ring-primary-500 focus:ring-1"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-sm font-bold text-slate-700">Active Status</span>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    formData.is_active ? 'bg-primary-600' : 'bg-slate-300'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    formData.is_active ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-white font-bold transition-all shadow-lg hover:shadow-xl ${
                            saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 active:scale-[0.98]'
                        }`}
                    >
                        {saving ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <HiSave className="w-6 h-6" />
                        )}
                        {isNew ? 'Create Template' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
