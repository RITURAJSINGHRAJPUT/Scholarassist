'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { HiDownload, HiTrash, HiEye, HiDocumentDownload } from 'react-icons/hi';

interface Inquiry {
    id: string; name: string; email: string; phone: string; academic_level: string; service_type: string;
    deadline: string; message: string; status: string; created_at: string;
    files: { id: string; original_name: string; size: number }[];
}

const statusOptions = ['new', 'in_progress', 'completed'];
const statusColor = (s: string) => s === 'new' ? 'bg-amber-100 text-amber-700' : s === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';

export default function AdminInquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selected, setSelected] = useState<Inquiry | null>(null);

    const fetchInquiries = () => {
        const url = filter ? `/inquiries?status=${filter}` : '/inquiries';
        api.get(url).then(res => setInquiries(res.data.inquiries || [])).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchInquiries(); }, [filter]);

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/inquiries/${id}/status`, { status });
            setInquiries(inquiries.map(i => i.id === id ? { ...i, status } : i));
            if (selected?.id === id) setSelected({ ...selected, status });
        } catch { /* ignore */ }
    };

    const deleteInquiry = async (id: string) => {
        if (!confirm('Delete this inquiry?')) return;
        try {
            await api.delete(`/inquiries/${id}`);
            setInquiries(inquiries.filter(i => i.id !== id));
            if (selected?.id === id) setSelected(null);
        } catch { /* ignore */ }
    };

    const exportCSV = async () => {
        try {
            const res = await api.get('/inquiries/export/csv', { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a'); a.href = url; a.download = 'inquiries.csv'; a.click();
        } catch { /* ignore */ }
    };

    const downloadFile = async (fileId: string, filename: string) => {
        try {
            const res = await api.get(`/files/${fileId}/download`, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
        } catch { /* ignore */ }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)]">Inquiries</h1>
                <div className="flex gap-3">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                        <option value="">All Status</option>
                        {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
                        <HiDownload className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inquiry List */}
                <div className={`${selected ? 'lg:col-span-1' : 'lg:col-span-3'} bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden`}>
                    {inquiries.length === 0 ? (
                        <p className="p-8 text-slate-500 text-sm text-center">No inquiries found. {!loading && 'Make sure the backend is running.'}</p>
                    ) : (
                        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                            {inquiries.map((inq) => (
                                <div
                                    key={inq.id}
                                    onClick={() => setSelected(inq)}
                                    className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selected?.id === inq.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium text-slate-900 text-sm">{inq.name}</p>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor(inq.status)}`}>{inq.status.replace('_', ' ')}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">{inq.service_type} • {new Date(inq.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                {selected && (
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Inquiry Details</h2>
                            <div className="flex gap-2">
                                <button onClick={() => deleteInquiry(selected.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><HiTrash className="w-5 h-5" /></button>
                                <button onClick={() => setSelected(null)} className="text-sm text-slate-500 hover:text-slate-700">Close</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                            <div><span className="text-slate-500 block">Name</span><span className="font-medium text-slate-900">{selected.name}</span></div>
                            <div><span className="text-slate-500 block">Email</span><span className="font-medium text-slate-900">{selected.email}</span></div>
                            <div><span className="text-slate-500 block">Phone</span><span className="font-medium text-slate-900">{selected.phone || 'N/A'}</span></div>
                            <div><span className="text-slate-500 block">Academic Level</span><span className="font-medium text-slate-900">{selected.academic_level || 'N/A'}</span></div>
                            <div><span className="text-slate-500 block">Service</span><span className="font-medium text-slate-900">{selected.service_type}</span></div>
                            <div><span className="text-slate-500 block">Deadline</span><span className="font-medium text-slate-900">{selected.deadline ? new Date(selected.deadline).toLocaleDateString() : 'N/A'}</span></div>
                        </div>

                        {selected.message && (
                            <div className="mb-6">
                                <span className="text-sm text-slate-500 block mb-1">Message</span>
                                <p className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed">{selected.message}</p>
                            </div>
                        )}

                        {/* Status Update */}
                        <div className="mb-6">
                            <span className="text-sm text-slate-500 block mb-2">Status</span>
                            <div className="flex gap-2">
                                {statusOptions.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => updateStatus(selected.id, s)}
                                        className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${selected.status === s ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Files */}
                        {selected.files && selected.files.length > 0 && (
                            <div>
                                <span className="text-sm text-slate-500 block mb-2">Attached Files</span>
                                <div className="space-y-2">
                                    {selected.files.map(f => (
                                        <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm text-slate-700 truncate">{f.original_name}</span>
                                            <button onClick={() => downloadFile(f.id, f.original_name)} className="flex items-center gap-1 text-primary-600 hover:text-primary-800 text-sm">
                                                <HiDocumentDownload className="w-4 h-4" /> Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
