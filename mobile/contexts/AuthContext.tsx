import React, { createContext, useContext, useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";
import * as SecureStore from "expo-secure-store";

type AuthContextShape = {
    openAuthModal: () => void;
    closeAuthModal: () => void;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
    checkAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextShape>({
    openAuthModal: () => { },
    closeAuthModal: () => { },
    signOut: async () => { },
    isAuthenticated: false,
    checkAuth: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const openAuthModal = () => setModalOpen(true);
    const closeAuthModal = () => setModalOpen(false);

    const checkAuth = async (): Promise<boolean> => {
        try {
            const token = await SecureStore.getItemAsync("accessToken");
            const authenticated = !!token;
            setIsAuthenticated(authenticated);
            return authenticated;
        } catch (error) {
            console.error("Error checking authentication:", error);
            setIsAuthenticated(false);
            return false;
        }
    };

    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync("accessToken");
            setIsAuthenticated(false);
            setModalOpen(true);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleAuthSuccess = async () => {
        await checkAuth();
    };

    // Check authentication on mount
    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            const authenticated = await checkAuth();
            if (!authenticated) {
                setModalOpen(true);
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    // Don't render children until we've checked auth status
    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider
            value={{ openAuthModal, closeAuthModal, signOut, isAuthenticated, checkAuth }}
        >
            {children}
            <AuthModal
                visible={modalOpen}
                onClose={closeAuthModal}
                onSuccess={handleAuthSuccess}
            />
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
