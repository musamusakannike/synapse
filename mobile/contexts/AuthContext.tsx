import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthModal, { AuthModalRef } from "../components/AuthModal";
import * as SecureStore from "expo-secure-store";
import { initializeNotifications } from "../services/notifications.service";
import { UserAPI } from "../lib/api";

type AuthContextShape = {
    openAuthModal: () => void;
    closeAuthModal: () => void;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
    checkAuth: () => Promise<boolean>;
    onChatSelect?: (chatId: string) => void;
    setOnChatSelect: (callback: (chatId: string) => void) => void;
    isSubscribed: boolean;
    subscriptionTier: string | null;
    refreshSubscriptionStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextShape>({
    openAuthModal: () => { },
    closeAuthModal: () => { },
    signOut: async () => { },
    isAuthenticated: false,
    checkAuth: async () => false,
    setOnChatSelect: () => { },
    isSubscribed: false,
    subscriptionTier: null,
    refreshSubscriptionStatus: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const authModalRef = useRef<AuthModalRef>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [onChatSelect, setOnChatSelect] = useState<((chatId: string) => void) | undefined>();
    const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
    const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);

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
            setSubscriptionTier(null);
            setSubscriptionExpiresAt(null);
            authModalRef.current?.present();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const refreshSubscriptionStatus = async () => {
        try {
            const { data } = await UserAPI.getCurrentUser();
            if (data) {
                setSubscriptionTier(data.subscriptionTier || null);
                setSubscriptionExpiresAt(data.subscriptionExpiresAt || null);
            }
        } catch (error) {
            console.error("Error fetching subscription status:", error);
        }
    };

    // Check if user has an active subscription
    const isSubscribed = (() => {
        if (!subscriptionTier || subscriptionTier === 'FREE') return false;
        if (!subscriptionExpiresAt) return false;
        return new Date(subscriptionExpiresAt) > new Date();
    })();

    const handleAuthSuccess = async () => {
        await checkAuth();
        // Fetch subscription status after successful authentication
        await refreshSubscriptionStatus();
        // Initialize notifications after successful authentication
        initializeNotifications().catch(error => {
            console.error('Failed to initialize notifications:', error);
        });
    };

    // Check authentication on mount
    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            const authenticated = await checkAuth();
            if (authenticated) {
                // Fetch subscription status for already-authenticated users
                await refreshSubscriptionStatus();
                // Initialize notifications for already-authenticated users
                initializeNotifications().catch(error => {
                    console.error('Failed to initialize notifications on app start:', error);
                });
            } else {
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

    const updateOnChatSelect = (callback: (chatId: string) => void) => {
        setOnChatSelect(() => callback);
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <AuthContext.Provider
                    value={{ 
                        openAuthModal, 
                        closeAuthModal, 
                        signOut, 
                        isAuthenticated, 
                        checkAuth,
                        onChatSelect,
                        setOnChatSelect: updateOnChatSelect,
                        isSubscribed,
                        subscriptionTier,
                        refreshSubscriptionStatus
                    }}
                >
                    {children}
                    <AuthModal
                        ref={authModalRef}
                        onSuccess={handleAuthSuccess}
                        onLogout={signOut}
                        isAuthenticated={isAuthenticated}
                    />
                </AuthContext.Provider>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );
};

export const useAuth = () => useContext(AuthContext);
