import { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function AuthCallback() {
    const { token } = useLocalSearchParams<{ token?: string }>();
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            if (token) {
                try {
                    // Store the token securely
                    await SecureStore.setItemAsync("accessToken", token);
                    console.log("OAuth token received and stored successfully");

                    // Navigate back to home after a brief delay
                    setTimeout(() => {
                        router.replace("/");
                    }, 500);
                } catch (error) {
                    console.error("Error storing OAuth token:", error);
                    // Still navigate back even if there's an error
                    router.replace("/");
                }
            } else {
                // No token provided, navigate back
                router.replace("/");
            }
        };

        handleAuthCallback();
    }, [token, router]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.text}>Completing authentication...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        gap: 16,
    },
    text: {
        fontSize: 16,
        color: "#666",
        fontFamily: "Outfit_400Regular",
    },
});
