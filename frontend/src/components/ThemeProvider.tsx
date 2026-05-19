"use client";

import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Initialize theme on mount - permanently Light Mode
        const initializeTheme = () => {
            document.documentElement.classList.remove("dark");
        };

        initializeTheme();

        // Listen for system theme changes - do nothing or force remove dark class
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            document.documentElement.classList.remove("dark");
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return <>{children}</>;
}
