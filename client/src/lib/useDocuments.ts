import { useCallback } from 'react';

export interface Document {
    id: string;
    user_id: string | null;
    title: string;
    content: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface DocumentListItem {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

const STORAGE_KEY = 'scholarassist_documents';

const getLocalDocs = (): Document[] => {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveLocalDocs = (docs: Document[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};

export function useDocuments() {
    const createDocument = useCallback(async (title?: string, content?: Record<string, unknown>) => {
        const docs = getLocalDocs();
        const newDoc: Document = {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
            user_id: null,
            title: title || 'Untitled Document',
            content: content || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        docs.push(newDoc);
        saveLocalDocs(docs);
        return newDoc;
    }, []);

    const listDocuments = useCallback(async () => {
        const docs = getLocalDocs();
        return docs
            .map(d => ({
                id: d.id,
                title: d.title,
                created_at: d.created_at,
                updated_at: d.updated_at
            }))
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }, []);

    const getDocument = useCallback(async (id: string) => {
        const docs = getLocalDocs();
        const doc = docs.find(d => d.id === id);
        if (!doc) throw new Error('Document not found');
        return doc;
    }, []);

    const updateDocument = useCallback(async (id: string, data: { title?: string; content?: Record<string, unknown> }) => {
        const docs = getLocalDocs();
        const index = docs.findIndex(d => d.id === id);
        if (index === -1) throw new Error('Document not found');
        
        docs[index] = {
            ...docs[index],
            ...data,
            updated_at: new Date().toISOString()
        };
        
        saveLocalDocs(docs);
        return docs[index];
    }, []);

    const deleteDocument = useCallback(async (id: string) => {
        const docs = getLocalDocs();
        const filtered = docs.filter(d => d.id !== id);
        saveLocalDocs(filtered);
    }, []);

    return { createDocument, listDocuments, getDocument, updateDocument, deleteDocument };
}
