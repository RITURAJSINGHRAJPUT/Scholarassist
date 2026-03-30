'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';
import { getImageUrl, convertDriveLink } from '@/lib/imageUtils';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    currentImage?: string;
}

export default function ImageModal({ isOpen, onClose, onSelect, currentImage }: ImageModalProps) {
    const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
    const [imageUrl, setImageUrl] = useState(currentImage || '');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('image', file);
            const { data } = await api.post('/blog/admin/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onSelect(data.url);
            onClose();
        } catch (err) {
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleLinkSubmit = () => {
        if (!imageUrl) return;
        const finalUrl = convertDriveLink(imageUrl);
        onSelect(finalUrl);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Select Featured Image</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'upload' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Upload File
                    </button>
                    <button
                        onClick={() => setActiveTab('link')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'link' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        URL / Google Drive
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && <p className="text-red-500 text-xs mb-4 p-2 bg-red-50 rounded-lg border border-red-100">{error}</p>}

                    {activeTab === 'upload' ? (
                        <div className="space-y-4">
                            <div
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                className={`w-full h-40 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? (
                                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm text-slate-500 font-medium">Click to upload image</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Image URL or Drive Link</label>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 italic">Support for Google Drive share links is built-in.</p>
                            </div>
                            
                            {imageUrl && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preview</label>
                                        <a 
                                            href={imageUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[9px] font-bold text-primary-600 hover:underline flex items-center gap-1"
                                        >
                                            Verify Link ↗
                                        </a>
                                    </div>
                                    <div 
                                        className="w-full h-32 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 relative group flex items-center justify-center"
                                        id="preview-container"
                                    >
                                        {convertDriveLink(imageUrl) === 'FOLDER_LINK_ERROR' ? (
                                            <div className="flex flex-col items-center justify-center p-4 text-center">
                                                <svg className="w-8 h-8 mb-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Folder Link Detected</p>
                                                <p className="text-[9px] mt-1 text-slate-500 leading-tight">Please paste a link to an <strong>individual image file</strong>, not a folder.</p>
                                            </div>
                                        ) : (
                                            <>
                                                <img
                                                    src={convertDriveLink(imageUrl)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const container = document.getElementById('preview-container');
                                                        if (container) container.setAttribute('data-error', 'true');
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                    onLoad={(e) => {
                                                        const container = document.getElementById('preview-container');
                                                        if (container) container.setAttribute('data-error', 'false');
                                                        e.currentTarget.style.display = 'block';
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-0 group-[[data-error=true]]:opacity-100 transition-opacity p-4 text-center pointer-events-none">
                                                    <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    <p className="text-[10px] font-bold">Failed to load preview</p>
                                                    <p className="text-[9px] mt-1 leading-tight">Double-check the link and ensure the file is shared with <strong>"Anyone with the link"</strong>.</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleLinkSubmit}
                                disabled={!imageUrl}
                                className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 disabled:opacity-50"
                            >
                                Confirm Link
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
