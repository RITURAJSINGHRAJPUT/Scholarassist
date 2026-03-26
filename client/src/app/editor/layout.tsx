'use client';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            {children}
        </div>
    );
}
