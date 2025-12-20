"use client";

import React, { useState, useEffect } from "react";
import { X, Sun, Moon, Monitor, ChevronRight } from "lucide-react";
import { UserAPI } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UserData {
    id: string;
    email: string;
    name?: string;
    profilePicture?: string;
}

type Theme = "light" | "dark" | "system";

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState<Theme>("system");

    useEffect(() => {
        if (isOpen) {
            fetchUserData();
            loadTheme();
        }
    }, [isOpen]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const { data } = await UserAPI.getCurrentUser();
            setUserData(data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadTheme = () => {
        const savedTheme = localStorage.getItem("theme") as Theme;
        if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
            setTheme(savedTheme);
        }
    };

    const cycleTheme = () => {
        const themes: Theme[] = ["light", "dark", "system"];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);

        // Apply theme
        if (nextTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else if (nextTheme === "light") {
            document.documentElement.classList.remove("dark");
        } else {
            // System theme
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }

        // Dispatch custom event for other components to react
        window.dispatchEvent(new CustomEvent("themeChange", { detail: nextTheme }));
    };

    const getThemeIcon = () => {
        switch (theme) {
            case "light":
                return <Sun className="w-5 h-5 text-blue-600" />;
            case "dark":
                return <Moon className="w-5 h-5 text-blue-600" />;
            default:
                return <Monitor className="w-5 h-5 text-blue-600" />;
        }
    };

    const getThemeLabel = () => {
        switch (theme) {
            case "light":
                return "Light";
            case "dark":
                return "Dark";
            default:
                return "System";
        }
    };

    const handleLogout = () => {
        clearToken();
        onClose();
        router.replace("/");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center sm:justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full sm:w-[400px] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                        </div>
                    ) : userData ? (
                        <>
                            {/* Profile Picture and Info */}
                            <div className="flex flex-col items-center space-y-3">
                                {/* Profile Picture */}
                                <div className="relative">
                                    {userData.profilePicture ? (
                                        <img
                                            src={userData.profilePicture}
                                            alt={userData.name || "Profile"}
                                            className="w-20 h-20 rounded-full border-2 border-blue-600"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                            <span className="text-3xl font-semibold text-blue-600">
                                                {userData.name?.charAt(0).toUpperCase() ||
                                                    userData.email.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="text-center">
                                    {userData.name && (
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                            {userData.name}
                                        </h3>
                                    )}
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {userData.email}
                                    </p>
                                </div>
                            </div>

                            {/* Theme Toggle */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    {getThemeIcon()}
                                    <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                                        Theme
                                    </span>
                                </div>
                                <button
                                    onClick={cycleTheme}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {getThemeLabel()}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-red-500">Failed to load profile</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
