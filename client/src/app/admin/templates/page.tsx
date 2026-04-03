'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { HiPlus, HiTrash, HiPencil, HiEye, HiEyeOff, HiTemplate } from 'react-icons/hi';

interface Template {
    id: string;
    title: string;
    description: string;
    category: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
}

export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTemplates = async () => {
        try {
            const res = await api.get('/templates/admin');
            setTemplates(res.data);
        } catch (error) {
            console.error('Fetch templates error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const deleteTemplate = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template? This cannot be undone.')) return;
        try {
            await api.delete(`/templates/admin/${id}`);
            setTemplates(templates.filter(t => t.id !== id));
        } catch (error) {
            alert('Failed to delete template');
        }
    };

    const toggleActive = async (id: string) => {
        try {
            const res = await api.patch(`/templates/admin/${id}/toggle`);
            setTemplates(templates.map(t => t.id === id ? { ...t, is_active: res.data.is_active } : t));
        } catch (error) {
            alert('Failed to toggle status');
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)]">Template Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage dynamic editor templates for students.</p>
                </div>
                <Link 
                    href="/admin/templates/new" 
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
                >
                    <HiPlus className="w-5 h-5" /> New Template
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {templates.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiTemplate className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No templates found</h3>
                        <p className="text-slate-500 text-sm mt-1">Create your first template to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-600">Template</th>
                                    <th className="p-4 font-semibold text-slate-600 hidden md:table-cell">Category</th>
                                    <th className="p-4 font-semibold text-slate-600 hidden lg:table-cell">Order</th>
                                    <th className="p-4 font-semibold text-slate-600">Status</th>
                                    <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {templates.map(template => (
                                    <tr key={template.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div>
                                                <div className="font-bold text-slate-900">{template.title}</div>
                                                <div className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-xs">{template.description}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                                {template.category}
                                            </span>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell text-slate-500 font-mono italic">
                                            #{template.display_order}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                template.is_active 
                                                    ? 'bg-green-50 text-green-700' 
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${template.is_active ? 'bg-green-500' : 'bg-slate-400'}`} />
                                                {template.is_active ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => toggleActive(template.id)} 
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title={template.is_active ? 'Disable Template' : 'Enable Template'}
                                                >
                                                    {template.is_active ? <HiEyeOff className="w-4.5 h-4.5 text-slate-400" /> : <HiEye className="w-4.5 h-4.5 text-primary-500" />}
                                                </button>
                                                <Link 
                                                    href={`/admin/templates/${template.id}`} 
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Edit Template"
                                                >
                                                    <HiPencil className="w-4.5 h-4.5 text-primary-500" />
                                                </Link>
                                                <button 
                                                    onClick={() => deleteTemplate(template.id)} 
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                                    title="Delete Template"
                                                >
                                                    <HiTrash className="w-4.5 h-4.5 text-red-400 group-hover:text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
