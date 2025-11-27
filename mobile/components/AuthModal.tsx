import React, { useState, useMemo, forwardRef, useImperativeHandle, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { UserAPI } from "../lib/api";
import * as SecureStore from "expo-secure-store";
import { useTheme, Theme } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

// Configuration for web-based OAuth
const FRONTEND_URL = "https://synapsebot.vercel.app";
const MOBILE_AUTH_URL = `${FRONTEND_URL}/mobile-auth?auto=true`;

type Props = {
    onSuccess?: () => void;
    onLogout?: () => void;
    isAuthenticated?: boolean;
};

type UserData = {
    id: string;
    email: string;
    name?: string;
    profilePicture?: string;
};

export type AuthModalRef = {
    present: () => void;
    dismiss: () => void;
};

const AuthModal = forwardRef<AuthModalRef, Props>(({ onSuccess, onLogout, isAuthenticated = false }, ref) => {
    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const [sending, setSending] = useState(false);
    const [socialError, setSocialError] = useState("");
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);
    const { colors, theme, setTheme } = useTheme();

    // Snap points for the bottom sheet
    const snapPoints = useMemo(() => isAuthenticated ? ["55%"] : ["40%"], [isAuthenticated]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        present: () => bottomSheetRef.current?.expand(),
        dismiss: () => bottomSheetRef.current?.close(),
    }));

    // Fetch user data when authenticated
    useEffect(() => {
        const fetchUserData = async () => {
            if (isAuthenticated) {
                try {
                    setLoadingUser(true);
                    const { data } = await UserAPI.getCurrentUser();
                    setUserData(data);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoadingUser(false);
                }
            } else {
                setUserData(null);
            }
        };
        fetchUserData();
    }, [isAuthenticated]);

    // Handle Google OAuth via web browser
    const handleGoogleAuth = async () => {
        try {
            setSending(true);
            setSocialError("");

            // Open the mobile-auth page in an in-app browser
            const result = await WebBrowser.openAuthSessionAsync(
                MOBILE_AUTH_URL,
                "synapse-ai://auth-callback"
            );

            if (result.type === "success" && result.url) {
                // Extract token from the callback URL
                const url = Linking.parse(result.url);
                const token = url.queryParams?.token as string;

                if (token) {
                    // Store the JWT token securely
                    await SecureStore.setItemAsync("accessToken", token);

                    // Call success callback and close modal
                    onSuccess?.();
                    bottomSheetRef.current?.close();
                } else {
                    throw new Error("No token received from authentication");
                }
            } else if (result.type === "cancel") {
                setSocialError("Authentication cancelled");
            }
        } catch (error: any) {
            console.error("Google auth error:", error);
            setSocialError(error?.message || "Authentication failed. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const handleGithub = () => {
        setSocialError("GitHub authentication is not yet configured for mobile. Please use Google sign-in.");
    };

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync("accessToken");
            setUserData(null);
            bottomSheetRef.current?.close();
            onLogout?.();
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const renderBackdrop = React.useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.6}
            />
        ),
        []
    );

    const getThemeIcon = () => {
        switch (theme) {
            case 'light':
                return 'sunny';
            case 'dark':
                return 'moon';
            default:
                return 'phone-portrait-outline';
        }
    };

    const getThemeLabel = () => {
        switch (theme) {
            case 'light':
                return 'Light';
            case 'dark':
                return 'Dark';
            default:
                return 'System';
        }
    };

    const cycleTheme = () => {
        const themes: Theme[] = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            backdropComponent={renderBackdrop}
            backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: colors.bottomSheet }]}
            handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.bottomSheetHandle }]}
        >
            <BottomSheetView style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{isAuthenticated ? "Profile" : "Welcome"}</Text>
                    <TouchableOpacity onPress={() => bottomSheetRef.current?.close()} style={styles.closeButton}>
                        <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {isAuthenticated ? (
                        // Show profile when authenticated
                        <View style={styles.profileContainer}>
                            {loadingUser ? (
                                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
                            ) : userData ? (
                                <>
                                    {/* Profile Picture */}
                                    <View style={styles.profileImageContainer}>
                                        {userData.profilePicture ? (
                                            <Image
                                                source={{ uri: userData.profilePicture }}
                                                style={styles.profileImage}
                                            />
                                        ) : (
                                            <View style={[styles.profilePlaceholder, { backgroundColor: colors.inputBackground }]}>
                                                <Text style={styles.profilePlaceholderText}>
                                                    {userData.name?.charAt(0).toUpperCase() || userData.email.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* User Info */}
                                    <View style={styles.userInfo}>
                                        {userData.name && (
                                            <Text style={[styles.userName, { color: colors.text }]}>{userData.name}</Text>
                                        )}
                                        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userData.email}</Text>
                                    </View>

                                    {/* Theme Toggle */}
                                    <View style={[styles.themeToggleContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                                        <View style={styles.themeToggleLeft}>
                                            <Ionicons name={getThemeIcon() as any} size={20} color={colors.primary} />
                                            <Text style={[styles.themeToggleLabel, { color: colors.text }]}>Theme</Text>
                                        </View>
                                        <TouchableOpacity onPress={cycleTheme} style={[styles.themeToggleButton, { backgroundColor: colors.card }]}>
                                            <Text style={[styles.themeToggleValue, { color: colors.textSecondary }]}>{getThemeLabel()}</Text>
                                            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Logout Button */}
                                    <TouchableOpacity
                                        onPress={handleLogout}
                                        style={styles.logoutButton}
                                    >
                                        <Text style={styles.logoutButtonText}>Logout</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <Text style={styles.errorText}>Failed to load profile</Text>
                            )}
                        </View>
                    ) : (
                        // Show login options when not authenticated
                        <View style={styles.stepContainer}>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                Sign in or create an account to continue
                            </Text>

                            {/* Social Auth Buttons */}
                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity
                                    onPress={handleGoogleAuth}
                                    disabled={sending}
                                    style={[styles.socialButton, { borderColor: colors.border, backgroundColor: colors.card }, sending && styles.buttonDisabled]}
                                >
                                    <Text style={[styles.googleIcon, { color: colors.text }]}>G</Text>
                                    <Text style={[styles.socialButtonText, { color: colors.text }]}>
                                        {sending ? "Connecting..." : "Continue with Google"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleGithub}
                                    disabled={sending}
                                    style={[styles.socialButton, { borderColor: colors.border, backgroundColor: colors.card }, sending && styles.buttonDisabled]}
                                >
                                    <Text style={[styles.githubIcon, { color: colors.text }]}>⚙</Text>
                                    <Text style={[styles.socialButtonText, { color: colors.text }]}>
                                        Continue with GitHub
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {socialError ? (
                                <Text style={styles.errorText}>{socialError}</Text>
                            ) : null}
                        </View>
                    )}
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    bottomSheetBackground: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    handleIndicator: {
        backgroundColor: "#ccc",
        width: 40,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1f1f1f",
        fontFamily: "Outfit_500Medium",
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 24,
        color: "#666",
    },
    content: {
        padding: 24,
    },
    stepContainer: {
        gap: 16,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        fontFamily: "Outfit_400Regular",
    },
    buttonsContainer: {
        gap: 12,
        marginTop: 8,
    },
    socialButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    socialButtonText: {
        fontSize: 16,
        color: "#1f1f1f",
        fontWeight: "500",
        fontFamily: "Outfit_500Medium",
    },
    googleIcon: {
        fontSize: 20,
        fontWeight: "bold",
    },
    githubIcon: {
        fontSize: 20,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    errorText: {
        fontSize: 14,
        color: "#f44336",
        textAlign: "center",
        fontFamily: "Outfit_400Regular",
    },
    // Profile styles
    profileContainer: {
        alignItems: "center",
        gap: 20,
        paddingVertical: 10,
    },
    profileImageContainer: {
        marginBottom: 8,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: "#4285F4",
    },
    profilePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#e8f0fe",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#4285F4",
    },
    profilePlaceholderText: {
        fontSize: 32,
        color: "#4285F4",
        fontWeight: "600",
        fontFamily: "Outfit_600SemiBold",
    },
    userInfo: {
        alignItems: "center",
        gap: 4,
    },
    userName: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1f1f1f",
        fontFamily: "Outfit_600SemiBold",
    },
    userEmail: {
        fontSize: 14,
        color: "#666",
        fontFamily: "Outfit_400Regular",
    },
    logoutButton: {
        backgroundColor: "#f44336",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginTop: 8,
        width: "100%",
        alignItems: "center",
    },
    logoutButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "600",
        fontFamily: "Outfit_600SemiBold",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
        fontFamily: "Outfit_400Regular",
    },
    themeToggleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    themeToggleLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    themeToggleLabel: {
        fontSize: 16,
        fontFamily: "Outfit_500Medium",
    },
    themeToggleButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 4,
    },
    themeToggleValue: {
        fontSize: 14,
        fontFamily: "Outfit_400Regular",
    },
});

AuthModal.displayName = "AuthModal";

export default AuthModal;
