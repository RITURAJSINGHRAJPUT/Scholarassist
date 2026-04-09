'use client';
import { useEffect, useState } from 'react';
import { HiTrash, HiSearch } from 'react-icons/hi';
import api from '@/lib/api';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
}

export default function ContactsAdmin() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/contact');
            setMessages(res.data);
        } catch (error) {
            console.error('Error fetching contact messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await api.delete(`/contact/${id}`);
            setMessages(messages.filter(m => m.id !== id));
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message');
        }
    };

    const filteredMessages = messages.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.subject?.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center p-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)]">Contact Messages</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium">Name / Email</th>
                                <th className="p-4 font-medium">Subject</th>
                                <th className="p-4 font-medium">Message</th>
                                <th className="p-4 font-medium">Date received</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMessages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        {search ? 'No matching messages found.' : 'No messages received yet.'}
                                    </td>
                                </tr>
                            ) : filteredMessages.map((msg) => (
                                <tr key={msg.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 align-top">
                                        <div className="font-medium text-slate-900">{msg.name}</div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            <a href={`mailto:${msg.email}`} className="hover:text-primary-600 hover:underline">{msg.email}</a>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="text-slate-900 text-sm">{msg.subject || <span className="text-slate-400 italic">No subject</span>}</div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="text-slate-600 text-sm whitespace-pre-wrap max-w-md">{msg.message}</div>
                                    </td>
                                    <td className="p-4 align-top text-sm text-slate-500">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 align-top text-right">
                                        <button
                                            onClick={() => deleteMessage(msg.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                            title="Delete message"
                                        >
                                            <HiTrash className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
