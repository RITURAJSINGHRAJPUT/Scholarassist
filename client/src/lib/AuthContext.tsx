'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    subscriptionExpiry: string | null;
    phone?: string;
    designation?: string;
    placeOfWork?: string;
    premiumStatus?: 'none' | 'pending' | 'approved' | 'rejected';
    requestedPlan?: 'monthly' | 'yearly';
}

interface Usage {
    plagiarismCount: number;
    aiDetectorCount: number;
    editorCount: number;
    totalUsed: number;
    limit: number;
    remaining: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    usage: Usage | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => void;
    refreshUsage: () => Promise<void>;
    refreshUser: () => Promise<void>;
    showAuthModal: boolean;
    setShowAuthModal: (show: boolean, mode?: 'login' | 'signup') => void;
    authModalMode: 'login' | 'signup';
    showUpgradeModal: boolean;
    setShowUpgradeModal: (show: boolean) => void;
    showProfileModal: boolean;
    setShowProfileModal: (show: boolean) => void;
}

export interface SignupData {
    name: string;
    email: string;
    password: string;
    phone?: string;
    designation?: string;
    place_of_work?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [usage, setUsage] = useState<Usage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleSetShowAuthModal = (show: boolean, mode: 'login' | 'signup' = 'login') => {
        setAuthModalMode(mode);
        setShowAuthModal(show);
    };

    const refreshUsage = useCallback(async () => {
        try {
            const token = localStorage.getItem('user_token');
            if (!token) return;
            const res = await api.get('/users/usage', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsage(res.data);
        } catch {
            // silent fail
        }
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('user_token');
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }
            const res = await api.get('/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data.user);
            setUsage(res.data.usage);
        } catch {
            localStorage.removeItem('user_token');
            localStorage.removeItem('user_data');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = async (email: string, password: string) => {
        const res = await api.post('/users/login', { email, password });
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user_data', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setShowAuthModal(false);
        await refreshUsage();
    };

    const signup = async (data: SignupData) => {
        const res = await api.post('/users/signup', data);
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user_data', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setShowAuthModal(false);
        await refreshUsage();
    };

    const logout = () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        setUser(null);
        setUsage(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                usage,
                login,
                signup,
                logout,
                refreshUsage,
                refreshUser,
                showAuthModal,
                setShowAuthModal: handleSetShowAuthModal,
                authModalMode,
                showUpgradeModal,
                setShowUpgradeModal,
                showProfileModal,
                setShowProfileModal,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
