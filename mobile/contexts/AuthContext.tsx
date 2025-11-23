import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthModal, { AuthModalRef } from "../components/AuthModal";
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
    const authModalRef = useRef<AuthModalRef>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const openAuthModal = () => authModalRef.current?.present();
    const closeAuthModal = () => authModalRef.current?.dismiss();

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
            authModalRef.current?.present();
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
                // Delay opening the modal slightly to ensure the component is mounted
                setTimeout(() => {
                    authModalRef.current?.present();
                }, 100);
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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <AuthContext.Provider
                    value={{ openAuthModal, closeAuthModal, signOut, isAuthenticated, checkAuth }}
                >
                    {children}
                    <AuthModal
                        ref={authModalRef}
                        onSuccess={handleAuthSuccess}
                    />
                </AuthContext.Provider>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );
};

export const useAuth = () => useContext(AuthContext);
