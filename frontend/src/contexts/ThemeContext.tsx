"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeColors {
    primary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    inputBackground: string;
    placeholder: string;
    shadow: string;
    overlay: string;
}

const lightColors: ThemeColors = {
    primary: "#4285F4",
    background: "#ffffff",
    card: "#ffffff",
    text: "#1f1f1f",
    textSecondary: "#666666",
    border: "#e0e0e0",
    error: "#f44336",
    success: "#4caf50",
    warning: "#ff9800",
    inputBackground: "#f8f9fa",
    placeholder: "#9e9e9e",
    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.5)",
};

const darkColors: ThemeColors = {
    primary: "#4285F4",
    background: "#0f172a",
    card: "#1e293b",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    border: "#334155",
    error: "#f44336",
    success: "#4caf50",
    warning: "#ff9800",
    inputBackground: "#1e293b",
    placeholder: "#64748b",
    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.7)",
};

interface ThemeContextType {
    theme: Theme;
    colors: ThemeColors;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "app_theme";

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>("system");
    const [isLoading, setIsLoading] = useState(true);

    const getEffectiveTheme = (currentTheme: Theme): "light" | "dark" => {
        if (currentTheme === "system") {
            if (typeof window !== "undefined") {
                return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            }
            return "light";
        }
        return currentTheme;
    };

    const isDark = getEffectiveTheme(theme) === "dark";
    const colors = isDark ? darkColors : lightColors;

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(THEME_STORAGE_KEY, newTheme);
                // Update document class for CSS
                document.documentElement.classList.toggle("dark", getEffectiveTheme(newTheme) === "dark");
            } catch (error) {
                console.error("Error saving theme preference:", error);
            }
        }
    };

    const toggleTheme = () => {
        if (theme === "light") {
            setTheme("dark");
        } else if (theme === "dark") {
            setTheme("system");
        } else {
            setTheme("light");
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
                    setThemeState(savedTheme as Theme);
                }
            } catch (error) {
                console.error("Error loading theme preference:", error);
            } finally {
                setIsLoading(false);
            }

            // Listen for system theme changes
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => {
                if (theme === "system") {
                    document.documentElement.classList.toggle("dark", mediaQuery.matches);
                }
            };
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme]);

    // Apply theme class on mount and when theme changes
    useEffect(() => {
        if (typeof window !== "undefined" && !isLoading) {
            document.documentElement.classList.toggle("dark", isDark);
        }
    }, [isDark, isLoading]);

    if (isLoading) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, colors, isDark, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export default ThemeContext;
