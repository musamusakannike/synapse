"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedButtonProps {
    children: React.ReactNode;
    delay?: number;
    icon?: string;
    onClick?: () => void;
    className?: string;
}

export default function AnimatedButton({
    children,
    delay = 0,
    icon,
    onClick,
    className = "",
}: AnimatedButtonProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <button
                onClick={onClick}
                className={`w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 py-4 px-6 rounded-3xl text-left transition-colors ${className}`}
            >
                <span className="text-base">
                    {icon && <span className="mr-2">{icon}</span>}
                    {children}
                </span>
            </button>
        </motion.div>
    );
}
