'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { HiInbox, HiClock, HiCheckCircle, HiDocumentText, HiMail } from 'react-icons/hi';

interface DashboardData {
    totalInquiries: number;
    statusCounts: { new: number; in_progress: number; completed: number };
    serviceBreakdown: { service_type: string; count: string }[];
    recentCount: number;
    blog: { published: number; drafts: number };
    contacts: { unread: number; total: number };
    recentInquiries: { id: string; name: string; email: string; service_type: string; status: string; created_at: string }[];
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/analytics/dashboard').then(res => setData(res.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;

    if (!data) return (
        <div className="text-center py-20">
            <p className="text-slate-500">Unable to load dashboard data. Make sure the backend server is running.</p>
            <p className="text-slate-400 text-sm mt-2">Run <code className="bg-slate-100 px-2 py-1 rounded">npm run dev</code> in the server directory.</p>
        </div>
    );

    const statCards = [
        { label: 'Total Inquiries', value: data.totalInquiries, icon: HiInbox, color: 'from-blue-500 to-blue-600' },
        { label: 'New', value: data.statusCounts.new, icon: HiClock, color: 'from-amber-500 to-amber-600' },
        { label: 'In Progress', value: data.statusCounts.in_progress, icon: HiDocumentText, color: 'from-purple-500 to-purple-600' },
        { label: 'Completed', value: data.statusCounts.completed, icon: HiCheckCircle, color: 'from-green-500 to-green-600' },
    ];

    const statusColor = (s: string) => s === 'new' ? 'bg-amber-100 text-amber-700' : s === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)]">Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-slate-500">{card.label}</span>
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                                <card.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Inquiries */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="p-5 border-b border-slate-100"><h2 className="font-bold text-slate-900">Recent Inquiries</h2></div>
                    <div className="divide-y divide-slate-100">
                        {data.recentInquiries.length === 0 ? (
                            <p className="p-5 text-slate-500 text-sm text-center">No inquiries yet</p>
                        ) : data.recentInquiries.map((inq) => (
                            <div key={inq.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-900 text-sm">{inq.name}</p>
                                    <p className="text-xs text-slate-500">{inq.service_type} • {new Date(inq.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(inq.status)}`}>{inq.status.replace('_', ' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Side stats */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><HiDocumentText className="w-5 h-5 text-primary-500" /> Blog</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Published</span><span className="font-medium">{data.blog.published}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Drafts</span><span className="font-medium">{data.blog.drafts}</span></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><HiMail className="w-5 h-5 text-primary-500" /> Contact Messages</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-medium">{data.contacts.total}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Unread</span><span className="font-medium text-amber-600">{data.contacts.unread}</span></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-3">By Service Type</h3>
                        <div className="space-y-2 text-sm">
                            {data.serviceBreakdown.map((s, i) => (
                                <div key={i} className="flex justify-between">
                                    <span className="text-slate-500 truncate mr-2">{s.service_type}</span>
                                    <span className="font-medium">{s.count}</span>
                                </div>
                            ))}
                            {data.serviceBreakdown.length === 0 && <p className="text-slate-400 text-xs">No data yet</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
