import { useCallback } from 'react';
import api from './api';

export interface Document {
    id: string;
    user_id: string | null;
    title: string;
    content: any;
    layout: string;
    is_saved: boolean;
    created_at: string;
    updated_at: string;
}

export interface DocumentListItem {
    id: string;
    title: string;
    layout: string;
    is_saved: boolean;
    created_at: string;
    updated_at: string;
}

const API_BASE = '/documents';

export function useDocuments() {
    const listDocuments = useCallback(async () => {
        const res = await api.get(API_BASE);
        return res.data as DocumentListItem[];
    }, []);

    const createDocument = useCallback(async (title?: string, content?: any, layout?: string) => {
        const res = await api.post(API_BASE, { 
            title, 
            content, 
            layout: layout || 'single' 
        });
        return res.data as Document;
    }, []);

    const getDocument = useCallback(async (id: string) => {
        const res = await api.get(`${API_BASE}/${id}`);
        return res.data as Document;
    }, []);

    const updateDocument = useCallback(async (id: string, data: { title?: string; content?: any; layout?: string; is_saved?: boolean }) => {
        const res = await api.put(`${API_BASE}/${id}`, data);
        return res.data as Document;
    }, []);

    const deleteDocument = useCallback(async (id: string) => {
        await api.delete(`${API_BASE}/${id}`);
    }, []);

    return { createDocument, listDocuments, getDocument, updateDocument, deleteDocument };
}
