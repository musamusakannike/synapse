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
                className={`w-full bg-white dark:bg-slate-900 hover:bg-[#f4f2ee] border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-gray-200 py-4.5 px-6 rounded-2xl text-left transition-all shadow-sm duration-200 ${className}`}
            >
                <span className="text-base font-medium">
                    {icon && <span className="mr-2">{icon}</span>}
                    {children}
                </span>
            </button>
        </motion.div>
    );
}
