import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = "https://synapse-tzlh.onrender.com/api"; // Assuming the server runs on port 5000

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Keep for cookie support if needed
});

// Add request interceptor to include JWT token in headers
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.log("Error getting token:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Sign Up
export const signUp = async (email: string, password: string, name: string) => {
    try {
        const response = await api.post("/auth/signup", { email, password, name });
        
        // Store the JWT token securely
        if (response.data.token) {
            await SecureStore.setItemAsync("authToken", response.data.token);
        }
        
        return response.data.user;
    } catch (error: any) {
        console.error("Sign up failed:", error);
        throw new Error(error.response?.data?.message || "Sign up failed");
    }
};

// Sign In
export const signIn = async (email: string, password: string) => {
    try {
        const response = await api.post("/auth/signin", { email, password });
        
        // Store the JWT token securely
        if (response.data.token) {
            await SecureStore.setItemAsync("authToken", response.data.token);
        }
        
        return response.data.user;
    } catch (error: any) {
        console.error("Sign in failed:", error);
        throw new Error(error.response?.data?.message || "Sign in failed");
    }
};

// Get Current User
export async function getCurrentUser() {
    try {
        const response = await api.get("/auth/me");
        return response.data.user;
    } catch (error) {
        console.log(error);
        return null;
    }
}

// Sign Out
export async function signOut() {
    try {
        await api.post("/auth/signout");
        
        // Remove the stored token
        await SecureStore.deleteItemAsync("authToken");
    } catch (error: any) {
        // Always clear the token even if the server request fails
        await SecureStore.deleteItemAsync("authToken");
        throw new Error(error.response?.data?.message || "Sign out failed");
    }
}

// Delete Chat
export const deleteChat = async (chatId: string) => {
    try {
        await api.delete(`/chats/${chatId}`);
    } catch (error: any) {
        console.error("Delete chat failed:", error);
        throw new Error(error.response?.data?.message || "Delete chat failed");
    }
};

// Clear Chat History
export const clearChatHistory = async () => {
    try {
        await api.delete("/chats");
    } catch (error: any) {
        console.error("Clear chat history failed:", error);
        throw new Error(error.response?.data?.message || "Clear chat history failed");
    }
};
