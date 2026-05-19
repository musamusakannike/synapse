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
    background: "#f9f8f6",
    card: "#ffffff",
    text: "#3d4654",
    textSecondary: "#7c8698",
    border: "#e6e9ee",
    error: "#f44336",
    success: "#4caf50",
    warning: "#ff9800",
    inputBackground: "#ffffff",
    placeholder: "#7c8698",
    shadow: "rgba(0, 0, 0, 0.04)",
    overlay: "rgba(0, 0, 0, 0.5)",
};

const darkColors: ThemeColors = lightColors;

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
    const [theme, setThemeState] = useState<Theme>("light");
    const [isLoading, setIsLoading] = useState(false);

    const isDark = false;
    const colors = lightColors;

    const setTheme = (newTheme: Theme) => {
        // Lock to light
        setThemeState("light");
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(THEME_STORAGE_KEY, "light");
                document.documentElement.classList.remove("dark");
            } catch (error) {
                console.error("Error saving theme preference:", error);
            }
        }
    };

    const toggleTheme = () => {
        setTheme("light");
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                document.documentElement.classList.remove("dark");
                localStorage.setItem(THEME_STORAGE_KEY, "light");
            } catch (error) {
                console.error("Error setting light theme on load:", error);
            }
        }
    }, []);

    // Apply theme class on mount and when theme changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            document.documentElement.classList.remove("dark");
        }
    }, []);

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
