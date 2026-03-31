'use client';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';
import UpgradeModal from '@/components/UpgradeModal';
import ProfileModal from '@/components/ProfileModal';

function GlobalModals() {
    const { showAuthModal, setShowAuthModal, showUpgradeModal, setShowUpgradeModal, showProfileModal, setShowProfileModal } = useAuth();

    return (
        <>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            <ProfileModal />
        </>
    );
}

export default function AuthWrapper({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            {children}
            <GlobalModals />
        </AuthProvider>
    );
}
