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
import * as Google from "expo-auth-session/providers/google";
import { AuthAPI, UserAPI } from "../lib/api";
import * as SecureStore from "expo-secure-store";

// This is required for expo-auth-session to work properly
WebBrowser.maybeCompleteAuthSession();

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

    // Snap points for the bottom sheet
    const snapPoints = useMemo(() => ["40%"], []);

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

    // Google Auth Request without proxy
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: "49669304081-pbml5pmtl0bfrq6p8bnu4le1sm93j3fj.apps.googleusercontent.com", // Web ID
        androidClientId: "49669304081-0t0d28nmsbo77242eajsepk1pdv1htl5.apps.googleusercontent.com",
        iosClientId: "49669304081-djefs8u6in5p1nrd79fv3u1l1rma9efb.apps.googleusercontent.com",
    })

    const getUserInfo = React.useCallback(async (token: string) => {
        if (!token) return;

        try {
            setSending(true);
            const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const user = await response.json();

            // Authenticate with our backend server
            const { data } = await AuthAPI.googleSignInWithToken(token, user);
            const accessToken = data?.accessToken;

            if (!accessToken) {
                throw new Error("Invalid server response");
            }

            // Store the JWT token securely
            await SecureStore.setItemAsync("accessToken", accessToken);

            // Call success callback and close modal
            onSuccess?.();
            bottomSheetRef.current?.close();
        } catch (error: any) {
            setSocialError(error?.message || "Authentication failed. Please try again.");
        } finally {
            setSending(false);
        }
    }, [onSuccess]);

    useEffect(() => {
        if (response?.type === "success" && response?.authentication?.accessToken) {
            getUserInfo(response.authentication.accessToken);
        }
    }, [response, getUserInfo]);

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

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.bottomSheetBackground}
            handleIndicatorStyle={styles.handleIndicator}
        >
            <BottomSheetView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{isAuthenticated ? "Profile" : "Welcome"}</Text>
                    <TouchableOpacity onPress={() => bottomSheetRef.current?.close()} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {isAuthenticated ? (
                        // Show profile when authenticated
                        <View style={styles.profileContainer}>
                            {loadingUser ? (
                                <Text style={styles.loadingText}>Loading...</Text>
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
                                            <View style={styles.profilePlaceholder}>
                                                <Text style={styles.profilePlaceholderText}>
                                                    {userData.name?.charAt(0).toUpperCase() || userData.email.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* User Info */}
                                    <View style={styles.userInfo}>
                                        {userData.name && (
                                            <Text style={styles.userName}>{userData.name}</Text>
                                        )}
                                        <Text style={styles.userEmail}>{userData.email}</Text>
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
                            <Text style={styles.subtitle}>
                                Sign in or create an account to continue
                            </Text>

                            {/* Social Auth Buttons */}
                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity
                                    onPress={() => promptAsync()}
                                    disabled={sending}
                                    style={[styles.socialButton, sending && styles.buttonDisabled]}
                                >
                                    <Text style={styles.googleIcon}>G</Text>
                                    <Text style={styles.socialButtonText}>
                                        {sending ? "Connecting..." : "Continue with Google"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleGithub}
                                    disabled={sending}
                                    style={[styles.socialButton, sending && styles.buttonDisabled]}
                                >
                                    <Text style={styles.githubIcon}>⚙</Text>
                                    <Text style={styles.socialButtonText}>
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
});

AuthModal.displayName = "AuthModal";

export default AuthModal;
