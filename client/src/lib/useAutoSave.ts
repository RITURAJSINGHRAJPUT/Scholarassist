import { useRef, useCallback, useState } from 'react';
import { useDocuments } from './useDocuments';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave(documentId: string | null) {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { updateDocument } = useDocuments();

    const triggerSave = useCallback(
        (data: { title?: string; content?: Record<string, unknown>; layout?: string }) => {
            if (!documentId) return;

            setSaveStatus('saving');

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(async () => {
                try {
                    await updateDocument(documentId, data);
                    setSaveStatus('saved');
                    // Reset to idle after 2 seconds
                    setTimeout(() => setSaveStatus('idle'), 2000);
                } catch {
                    setSaveStatus('error');
                    setTimeout(() => setSaveStatus('idle'), 3000);
                }
            }, 3000);
        },
        [documentId, updateDocument]
    );

    const cancelSave = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    return { saveStatus, triggerSave, cancelSave };
}
