"use client";
import React, { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { AuthAPI } from "@/lib/api";
import Loader from "@/components/Loader";

export default function MobileAuthPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Auto-trigger OAuth if coming from mobile app
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const autoAuth = params.get("auto");

        if (autoAuth === "true" && !loading && !success && !error) {
            handleGoogleSignIn();
        }
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            setError("");
            setLoading(true);

            // Step 1: Sign in with Google using Firebase
            const cred = await signInWithPopup(auth, googleProvider);
            const idToken = await cred.user.getIdToken();

            // Step 2: Exchange Firebase token for our JWT
            const { data } = await AuthAPI.googleSignIn(idToken);
            const token = data?.accessToken;

            if (!token) {
                throw new Error("Failed to get authentication token");
            }

            // Step 3: Redirect back to mobile app with token
            setSuccess(true);

            // Use setTimeout to show success message briefly before redirect
            setTimeout(() => {
                const deepLink = `synapse-ai://auth-callback?token=${encodeURIComponent(token)}`;
                window.location.href = deepLink;

                // Fallback: if deep link doesn't work, show instructions
                setTimeout(() => {
                    setError("Please return to the app manually. If the app didn't open automatically, please close this page and try again.");
                }, 2000);
            }, 1000);
        } catch (err: any) {
            console.error("Auth error:", err);
            setError(err?.message || "Authentication failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Synapse AI
                    </h1>
                    <p className="text-gray-600">
                        Sign in to continue to the mobile app
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    Authentication Successful!
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Returning to the app...
                                </p>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="text-center space-y-4 py-8">
                            <Loader />
                            <p className="text-gray-600">Authenticating...</p>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <svg
                                    className="w-6 h-6"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span className="font-medium text-gray-700 group-hover:text-gray-900">
                                    Continue with Google
                                </span>
                            </button>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div className="text-center pt-4">
                                <p className="text-xs text-gray-500">
                                    By continuing, you agree to our Terms of Service and Privacy Policy
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
