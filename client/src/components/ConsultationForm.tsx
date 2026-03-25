'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HiCloudUpload, HiX, HiCheckCircle } from 'react-icons/hi';
import api from '@/lib/api';

const academicLevels = ['High School', 'Undergraduate', 'Master\'s', 'PhD / Doctorate', 'Post-Doctoral'];
const serviceTypes = ['Thesis Assistance', 'Research Paper Support', 'Essay Writing', 'Project Documentation', 'Literature Review', 'Dissertation Support', 'Other'];

export default function ConsultationForm() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [file, setFile] = useState<File | null>(null);
    const [form, setForm] = useState({
        name: '', email: '', phone: '', academic_level: '', service_type: '', deadline: '', message: '',
    });

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
        if (!form.service_type) e.service_type = 'Please select a service type';
        if (form.phone && !/^[+\d\s()-]{7,20}$/.test(form.phone)) e.phone = 'Invalid phone number';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, val]) => { if (val) formData.append(key, val); });
            if (file) formData.append('file', file);
            formData.append('recaptcha_token', 'skip'); // Placeholder until reCAPTCHA keys are configured

            await api.post('/inquiries', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            router.push('/consultation-success');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setErrors({ form: error.response?.data?.error || 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{errors.form}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                    <input
                        id="name" name="name" type="text" value={form.name} onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'} text-slate-900 placeholder-slate-400 transition-all`}
                        placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                    <input
                        id="email" name="email" type="email" value={form.email} onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'} text-slate-900 placeholder-slate-400 transition-all`}
                        placeholder="john@university.edu"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <input
                        id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-400 bg-red-50' : 'border-slate-200'} text-slate-900 placeholder-slate-400 transition-all`}
                        placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Academic Level */}
                <div>
                    <label htmlFor="academic_level" className="block text-sm font-medium text-slate-700 mb-2">Academic Level</label>
                    <select
                        id="academic_level" name="academic_level" value={form.academic_level} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white transition-all"
                    >
                        <option value="">Select your level</option>
                        {academicLevels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                {/* Service Type */}
                <div>
                    <label htmlFor="service_type" className="block text-sm font-medium text-slate-700 mb-2">Service Type *</label>
                    <select
                        id="service_type" name="service_type" value={form.service_type} onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.service_type ? 'border-red-400 bg-red-50' : 'border-slate-200'} text-slate-900 bg-white transition-all`}
                    >
                        <option value="">Select a service</option>
                        {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.service_type && <p className="text-red-500 text-xs mt-1">{errors.service_type}</p>}
                </div>

                {/* Deadline */}
                <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
                    <input
                        id="deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 transition-all"
                    />
                </div>
            </div>

            {/* Message */}
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Describe Your Requirements</label>
                <textarea
                    id="message" name="message" value={form.message} onChange={handleChange} rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 transition-all resize-none"
                    placeholder="Please describe your academic project, specific requirements, and any guidelines..."
                />
            </div>

            {/* File Upload */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Attach Document (Optional)</label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all"
                >
                    {file ? (
                        <div className="flex items-center justify-center gap-3">
                            <HiCheckCircle className="w-6 h-6 text-green-500" />
                            <span className="text-sm text-slate-700 font-medium">{file.name}</span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                <HiX className="w-5 h-5 text-slate-400 hover:text-red-500" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <HiCloudUpload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Click to upload or drag a file here</p>
                            <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, XLS, PPT, TXT, Images (Max: 10MB)</p>
                        </>
                    )}
                </div>
                <input
                    ref={fileInputRef} type="file" className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                    onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
                />
            </div>

            <button
                type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Submitting...
                    </span>
                ) : 'Submit Consultation Request'}
            </button>
        </form>
    );
}
