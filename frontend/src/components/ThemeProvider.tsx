"use client";

import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Initialize theme on mount
        const initializeTheme = () => {
            const savedTheme = localStorage.getItem("theme");

            if (savedTheme === "dark") {
                document.documentElement.classList.add("dark");
            } else if (savedTheme === "light") {
                document.documentElement.classList.remove("dark");
            } else {
                // System theme or no preference
                if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            }
        };

        initializeTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            const savedTheme = localStorage.getItem("theme");
            if (!savedTheme || savedTheme === "system") {
                if (e.matches) {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return <>{children}</>;
}
