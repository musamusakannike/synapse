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
    const [theme, setThemeState] = useState<Theme>("system");
    const [isDark, setIsDark] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    const colors = isDark ? darkColors : lightColors;

    const applyTheme = (currentTheme: Theme) => {
        const root = window.document.documentElement;
        let activeIsDark = false;

        if (currentTheme === "system") {
            activeIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        } else {
            activeIsDark = currentTheme === "dark";
        }

        if (activeIsDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        setIsDark(activeIsDark);
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(THEME_STORAGE_KEY, newTheme);
            } catch (error) {
                console.error("Error saving theme preference:", error);
            }
        }
    };

    const toggleTheme = () => {
        const nextTheme = theme === "light" ? "dark" : (theme === "dark" ? "system" : "light");
        setTheme(nextTheme);
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
                const initialTheme = storedTheme || "system";
                setThemeState(initialTheme);
                applyTheme(initialTheme);
            } catch (error) {
                console.error("Error loading theme preference:", error);
                applyTheme("system");
            }
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                applyTheme("system");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

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
