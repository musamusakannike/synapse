"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronRight, User, ShieldAlert, Receipt, LogOut } from "lucide-react";
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

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUserData();
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

    const handleNavigation = (path: string) => {
        onClose();
        router.push(path);
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
                className="absolute inset-0 bg-gray-900/30 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full sm:w-[380px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150">
                    <h2 className="text-sm font-bold text-gray-800">
                        Account Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-xl transition-all"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-400 font-semibold">Loading profile data...</p>
                        </div>
                    ) : userData ? (
                        <>
                            {/* Profile Picture and Info */}
                            <div className="flex flex-col items-center space-y-3">
                                <div className="relative">
                                    {userData.profilePicture ? (
                                        <img
                                            src={userData.profilePicture}
                                            alt={userData.name || "Profile"}
                                            className="w-16 h-16 rounded-2xl border-2 border-blue-100 object-cover shadow-xs"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100/30 flex items-center justify-center shadow-xs">
                                            <span className="text-2xl font-bold text-blue-600">
                                                {userData.name?.charAt(0).toUpperCase() ||
                                                    userData.email.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center">
                                    {userData.name && (
                                        <h3 className="text-sm font-bold text-gray-800">
                                            {userData.name}
                                        </h3>
                                    )}
                                    <p className="text-xs text-gray-500 font-semibold mt-0.5">
                                        {userData.email}
                                    </p>
                                </div>
                            </div>

                            {/* Options List */}
                            <div className="space-y-2.5">
                                <button
                                    onClick={() => handleNavigation("/dashboard/subscription")}
                                    className="w-full flex items-center justify-between p-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 hover:border-gray-150 rounded-xl transition-all text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShieldAlert className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-bold text-gray-700">
                                            Manage Subscription
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>

                                <button
                                    onClick={() => handleNavigation("/dashboard/transactions")}
                                    className="w-full flex items-center justify-between p-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 hover:border-gray-150 rounded-xl transition-all text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <Receipt className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-bold text-gray-700">
                                            Billing History
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded-xl border border-red-200/40 transition-all text-xs flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-xs text-red-500 font-semibold">Failed to load profile details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
