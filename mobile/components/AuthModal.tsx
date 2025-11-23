import React, { useState, useMemo, forwardRef, useImperativeHandle } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import { AuthAPI } from "../lib/api";
import * as SecureStore from "expo-secure-store";

// This is required for expo-auth-session to work properly
WebBrowser.maybeCompleteAuthSession();

type Props = {
    onSuccess?: () => void;
};

export type AuthModalRef = {
    present: () => void;
    dismiss: () => void;
};

const AuthModal = forwardRef<AuthModalRef, Props>(({ onSuccess }, ref) => {
    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const [step, setStep] = useState<"choose" | "code">("choose");
    const [email] = useState("");
    const [code, setCode] = useState("");
    const [sending, setSending] = useState(false);
    const [codeError, setCodeError] = useState("");
    const [socialError, setSocialError] = useState("");

    // Snap points for the bottom sheet
    const snapPoints = useMemo(() => ["30%", "45%"], []);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        present: () => bottomSheetRef.current?.expand(),
        dismiss: () => bottomSheetRef.current?.close(),
    }));

    // Google OAuth configuration using the web client ID from Firebase
    // For Expo Go, we use Expo's auth proxy since Google doesn't accept exp:// URLs
    const redirectUri = "https://auth.expo.io/@musamusakannike/synapse-ai";

    // Log the redirect URI for debugging
    React.useEffect(() => {
        console.log("OAuth Redirect URI:", redirectUri);
    }, [redirectUri]);

    const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
        clientId: "49669304081-pbml5pmtl0bfrq6p8bnu4le1sm93j3fj.apps.googleusercontent.com",
        redirectUri,
    });

    const handleGoogleSuccess = React.useCallback(async (idToken: string) => {
        try {
            setSocialError("");
            setSending(true);
            const { data } = await AuthAPI.googleSignIn(idToken);
            const token = data?.accessToken;
            if (!token) throw new Error("Invalid server response");
            await SecureStore.setItemAsync("accessToken", token);
            onSuccess?.();
            bottomSheetRef.current?.close();
        } catch (err: any) {
            setSocialError(err?.message || "Google sign-in failed");
        } finally {
            setSending(false);
        }
    }, [onSuccess]);

    // Handle Google OAuth response
    React.useEffect(() => {
        if (googleResponse?.type === "success") {
            const { id_token } = googleResponse.params;
            if (id_token) {
                handleGoogleSuccess(id_token);
            }
        } else if (googleResponse?.type === "error") {
            setSocialError("Google sign-in failed. Please try again.");
            console.error("Google OAuth error:", googleResponse.error);
        }
    }, [googleResponse, handleGoogleSuccess]);

    const handleGoogle = async () => {
        try {
            setSocialError("");
            await googlePromptAsync();
        } catch (err: any) {
            setSocialError(err?.message || "Google sign-in failed");
        }
    };

    const handleGithub = async () => {
        setSocialError("GitHub authentication is not yet configured for mobile. Please use Google sign-in.");
    };

    const verifyCode = async () => {
        if (!code || code.length < 6) {
            setCodeError("Please enter a valid 6-digit code");
            return;
        }
        try {
            setCodeError("");
            setSending(true);
            const { data } = await AuthAPI.verifyCode(email, code);
            const token = data?.accessToken;
            if (!token) throw new Error("Invalid server response");
            await SecureStore.setItemAsync("accessToken", token);
            onSuccess?.();
            bottomSheetRef.current?.close();
        } catch (err: any) {
            setCodeError(err?.message || "Verification failed");
        } finally {
            setSending(false);
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
                    <Text style={styles.headerTitle}>
                        {step === "choose" && "Welcome"}
                        {step === "code" && "Enter verification code"}
                    </Text>
                    <TouchableOpacity onPress={() => bottomSheetRef.current?.close()} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {step === "choose" && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.subtitle}>
                                Sign in or create an account to continue
                            </Text>

                            {/* Social Auth Buttons */}
                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity
                                    onPress={handleGoogle}
                                    disabled={!googleRequest || sending}
                                    style={[styles.socialButton, (!googleRequest || sending) && styles.buttonDisabled]}
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

                    {step === "code" && (
                        <View style={styles.stepContainer}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.iconText}>✓</Text>
                            </View>

                            <Text style={styles.subtitle}>
                                Enter the 6-digit code we sent to
                            </Text>
                            <Text style={styles.emailText}>{email}</Text>

                            <TextInput
                                value={code}
                                onChangeText={(value) => {
                                    const cleaned = value.replace(/\D/g, "").slice(0, 6);
                                    setCode(cleaned);
                                    if (codeError) setCodeError("");
                                }}
                                style={[styles.codeInput, codeError && styles.inputError]}
                                placeholder="000000"
                                keyboardType="number-pad"
                                maxLength={6}
                                textAlign="center"
                            />
                            {codeError ? (
                                <Text style={styles.errorText}>{codeError}</Text>
                            ) : null}

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    onPress={() => setStep("choose")}
                                    style={styles.backButton}
                                >
                                    <Text style={styles.backButtonText}>← Start over</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={verifyCode}
                                    disabled={sending || code.length < 6}
                                    style={[
                                        styles.primaryButton,
                                        styles.successButton,
                                        (sending || code.length < 6) && styles.buttonDisabled,
                                    ]}
                                >
                                    {sending ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Verify & continue</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
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
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#e8f0fe",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    iconText: {
        fontSize: 28,
    },
    emailText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1f1f1f",
        textAlign: "center",
        fontFamily: "Outfit_500Medium",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    backButton: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: "#1f1f1f",
        fontFamily: "Outfit_400Regular",
    },
    primaryButton: {
        flex: 1,
        backgroundColor: "#4285F4",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    successButton: {
        backgroundColor: "#34A853",
    },
    primaryButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "600",
        fontFamily: "Outfit_500Medium",
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    codeInput: {
        fontSize: 28,
        fontFamily: "monospace",
        letterSpacing: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        textAlign: "center",
    },
    inputError: {
        borderColor: "#f44336",
        backgroundColor: "#ffebee",
    },
    errorText: {
        fontSize: 14,
        color: "#f44336",
        textAlign: "center",
        fontFamily: "Outfit_400Regular",
    },
});

AuthModal.displayName = "AuthModal";

export default AuthModal;
