import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Assuming the server runs on port 5000

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // This is important for sending cookies
});

// Sign Up
export const signUp = async (email: string, password: string, name: string) => {
    try {
        const response = await api.post("/auth/signup", { email, password, name });
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
    } catch (error: any) {
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
