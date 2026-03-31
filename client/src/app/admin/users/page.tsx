'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import {
    HiUserGroup, HiSearch, HiPlus, HiPencilAlt, HiTrash, HiShieldCheck,
    HiX, HiSparkles, HiCheck, HiChevronLeft, HiChevronRight, HiClock
} from 'react-icons/hi';

interface AppUser {
    id: string;
    name: string;
    email: string;
    isPremium: boolean;
    subscriptionExpiry: string | null;
    phone?: string;
    designation?: string;
    placeOfWork?: string;
    premiumStatus: 'none' | 'pending' | 'approved' | 'rejected';
    requestedPlan?: 'monthly' | 'yearly';
    createdAt: string;
    updatedAt: string;
    todayUsage: {
        plagiarism: number;
        aiDetector: number;
        editor: number;
        total: number;
    };
}

interface UserStats {
    total_users: string;
    premium_users: string;
    free_users: string;
    new_this_week: string;
}

interface ModalUser {
    id?: string;
    name: string;
    email: string;
    password: string;
    isPremium: boolean;
    phone: string;
    designation: string;
    placeOfWork: string;
}

const emptyUser: ModalUser = { name: '', email: '', password: '', isPremium: false, phone: '', designation: '', placeOfWork: '' };

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [modalUser, setModalUser] = useState<ModalUser>(emptyUser);
    const [modalError, setModalError] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (filter !== 'all') params.set('filter', filter);
            params.set('page', String(page));
            params.set('limit', '15');

            const res = await api.get(`/admin/users?${params.toString()}`);
            setUsers(res.data.users);
            setTotalPages(res.data.pagination.totalPages);
            setTotal(res.data.pagination.total);
        } catch {
            // silently handle
        } finally {
            setLoading(false);
        }
    }, [search, filter, page]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/admin/users/stats');
            setStats(res.data);
        } catch {
            // silently handle
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleCreate = () => {
        setModalMode('create');
        setModalUser(emptyUser);
        setModalError('');
        setShowModal(true);
    };

    const handleEdit = (user: AppUser) => {
        setModalMode('edit');
        setModalUser({
            id: user.id,
            name: user.name,
            email: user.email,
            password: '',
            isPremium: user.isPremium,
            phone: user.phone || '',
            designation: user.designation || '',
            placeOfWork: user.placeOfWork || '',
        });
        setModalError('');
        setShowModal(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
            fetchStats();
        } catch {
            alert('Failed to delete user');
        }
    };

    const handleTogglePremium = async (id: string) => {
        if (!confirm('Toggle premium status manually?')) return;
        try {
            await api.patch(`/admin/users/${id}/toggle-premium`);
            fetchUsers();
            fetchStats();
        } catch {
            alert('Failed to toggle premium');
        }
    };

    const handleUpdatePremiumStatus = async (userId: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this premium request?`)) return;
        try {
            await api.patch(`/admin/users/${userId}/update-premium-status`, { action });
            fetchUsers();
            fetchStats();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            alert(axiosErr.response?.data?.error || 'Failed to update status');
        }
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError('');
        setModalLoading(true);

        try {
            if (modalMode === 'create') {
                await api.post('/admin/users', {
                    name: modalUser.name,
                    email: modalUser.email,
                    password: modalUser.password,
                    isPremium: modalUser.isPremium,
                    phone: modalUser.phone,
                    designation: modalUser.designation,
                    placeOfWork: modalUser.placeOfWork,
                });
            } else {
                const payload: Record<string, unknown> = {
                    name: modalUser.name,
                    email: modalUser.email,
                    isPremium: modalUser.isPremium,
                    phone: modalUser.phone,
                    designation: modalUser.designation,
                    placeOfWork: modalUser.placeOfWork,
                };
                if (modalUser.password) payload.password = modalUser.password;
                await api.put(`/admin/users/${modalUser.id}`, payload);
            }
            setShowModal(false);
            fetchUsers();
            fetchStats();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setModalError(axiosErr.response?.data?.error || 'Operation failed');
        } finally {
            setModalLoading(false);
        }
    };

    const statCards = stats ? [
        { label: 'Total Users', value: stats.total_users, icon: HiUserGroup, color: 'from-blue-500 to-blue-600' },
        { label: 'Premium', value: stats.premium_users, icon: HiSparkles, color: 'from-amber-500 to-amber-600' },
        { label: 'Pending Requests', value: (stats as any).pending_requests || '0', icon: HiClock, color: 'from-orange-400 to-orange-500' },
        { label: 'New This Week', value: stats.new_this_week, icon: HiPlus, color: 'from-emerald-500 to-emerald-600' },
    ] : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)]">User Management</h1>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition shadow-md"
                >
                    <HiPlus className="w-4 h-4" /> Add User
                </button>
            </div>

            {/* Stats */}
            {stats && (
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
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pending', 'premium', 'free'].map(f => (
                            <button
                                key={f}
                                onClick={() => { setFilter(f); setPage(1); }}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                                    filter === f
                                        ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/25'
                                        : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                                }`}
                            >
                                {f === 'pending' && stats && (stats as any).pending_requests > 0 && (
                                    <span className="mr-1.5 px-1.5 py-0.5 bg-amber-400 text-white rounded-full text-[8px] animate-pulse">
                                        {(stats as any).pending_requests}
                                    </span>
                                )}
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20">
                        <HiUserGroup className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No users found</p>
                        <p className="text-slate-400 text-sm mt-1">
                            {search ? 'Try a different search term' : 'Users who sign up will appear here'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Info</th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Usage</th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-5 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                                        user.isPremium
                                                            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                                            : 'bg-gradient-to-br from-primary-500 to-primary-700'
                                                    }`}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                                        <p className="text-xs text-slate-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {user.isPremium ? (
                                                    <span 
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 cursor-pointer hover:bg-amber-100 transition"
                                                        onClick={() => handleTogglePremium(user.id)}
                                                    >
                                                        <HiSparkles className="w-3 h-3 text-amber-500" />
                                                        Premium
                                                    </span>
                                                ) : user.premiumStatus === 'pending' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-100 animate-pulse">
                                                        <HiClock className="w-3 h-3" />
                                                        Pending ({user.requestedPlan})
                                                    </span>
                                                ) : (
                                                    <span 
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100 cursor-pointer hover:bg-slate-100 transition"
                                                        onClick={() => handleTogglePremium(user.id)}
                                                    >
                                                        Free
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-[10px]">
                                                    <p className="text-slate-600 font-bold">{user.designation || 'No Designation'}</p>
                                                    <p className="text-slate-400">{user.placeOfWork || 'No Work Place'}</p>
                                                    <p className="text-primary-600">{user.phone || 'No Phone'}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span title="Plagiarism" className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">P:{user.todayUsage.plagiarism}</span>
                                                    <span title="AI Detector" className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-bold">A:{user.todayUsage.aiDetector}</span>
                                                    <span title="Editor" className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold">E:{user.todayUsage.editor}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500">
                                                {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.premiumStatus === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdatePremiumStatus(user.id, 'approve')}
                                                                className="px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdatePremiumStatus(user.id, 'reject')}
                                                                className="px-3 py-1.5 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-100 transition"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <HiPencilAlt className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.name)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <HiTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                                Showing {users.length} of {total} users
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >
                                    <HiChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-1 text-xs font-bold text-slate-600">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >
                                    <HiChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">
                                {modalMode === 'create' ? 'Create New User' : 'Edit User'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <HiX className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleModalSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Name</label>
                                <input
                                    type="text"
                                    value={modalUser.name}
                                    onChange={e => setModalUser({ ...modalUser, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={modalUser.email}
                                    onChange={e => setModalUser({ ...modalUser, email: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                                    Password {modalMode === 'edit' && <span className="text-slate-400 normal-case">(leave blank to keep current)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={modalUser.password}
                                    onChange={e => setModalUser({ ...modalUser, password: e.target.value })}
                                    required={modalMode === 'create'}
                                    minLength={6}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone</label>
                                    <input
                                        type="text"
                                        value={modalUser.phone}
                                        onChange={e => setModalUser({ ...modalUser, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Designation</label>
                                    <input
                                        type="text"
                                        value={modalUser.designation}
                                        onChange={e => setModalUser({ ...modalUser, designation: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Place of Work</label>
                                <input
                                    type="text"
                                    value={modalUser.placeOfWork}
                                    onChange={e => setModalUser({ ...modalUser, placeOfWork: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalUser({ ...modalUser, isPremium: !modalUser.isPremium })}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${
                                        modalUser.isPremium ? 'bg-amber-500' : 'bg-slate-300'
                                    }`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                        modalUser.isPremium ? 'translate-x-5.5' : 'translate-x-0.5'
                                    }`} />
                                </button>
                                <span className="text-sm font-medium text-slate-700">Premium User</span>
                            </div>

                            {modalError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    {modalError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalLoading}
                                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-bold text-sm rounded-xl hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {modalLoading ? 'Saving...' : (
                                        <>
                                            <HiCheck className="w-4 h-4" />
                                            {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
