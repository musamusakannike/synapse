"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Crown, Check, Zap, BookOpen, HelpCircle, FileText, Sparkles, Receipt, Loader2, Infinity } from "lucide-react";
import { SubscriptionAPI } from "@/lib/api";

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    pricing: {
        day: number;
        week: number;
        month: number;
    };
}

interface SubscriptionStatus {
    tier: string;
    expiresAt: string | null;
    isActive: boolean;
}

type Duration = "day" | "week" | "month";

const FEATURES = [
    { icon: Infinity, text: "Unlimited AI conversations" },
    { icon: BookOpen, text: "Unlimited course generation" },
    { icon: HelpCircle, text: "Unlimited quiz creation" },
    { icon: FileText, text: "Unlimited flashcards" },
    { icon: FileText, text: "Unlimited document uploads" },
    { icon: Zap, text: "Priority response times" },
    { icon: Sparkles, text: "Access to premium features" },
];

export default function SubscriptionPage() {
    const router = useRouter();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<Duration>("month");
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [plansResponse, statusResponse] = await Promise.all([
                SubscriptionAPI.getPlans(),
                SubscriptionAPI.getStatus(),
            ]);
            setPlans(plansResponse.data.data || []);
            setStatus(statusResponse.data.data || null);
        } catch (error) {
            console.error("Error loading subscription data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubscribe = useCallback(async () => {
        if (!plans.length) return;

        setIsProcessing(true);
        try {
            const response = await SubscriptionAPI.initiatePayment("GURU", selectedDuration);
            const { paymentLink } = response.data.data;

            if (paymentLink) {
                window.open(paymentLink, "_blank");
            }
        } catch (error: any) {
            console.error("Payment initiation error:", error);
            alert(error.message || "Failed to initiate payment");
        } finally {
            setIsProcessing(false);
        }
    }, [plans, selectedDuration]);

    const formatPrice = (price: number) => {
        return `₦${price.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getDurationLabel = (duration: Duration) => {
        switch (duration) {
            case "day":
                return "Daily";
            case "week":
                return "Weekly";
            case "month":
                return "Monthly";
        }
    };

    const getSavingsPercentage = (duration: Duration) => {
        if (!plans.length) return 0;
        const plan = plans[0];
        const dailyRate = plan.pricing.day;

        switch (duration) {
            case "week":
                return Math.round((1 - plan.pricing.week / (dailyRate * 7)) * 100);
            case "month":
                return Math.round((1 - plan.pricing.month / (dailyRate * 30)) * 100);
            default:
                return 0;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Loading subscription info...</p>
                </div>
            </div>
        );
    }

    const currentPlan = plans[0];

    return (
        <div className="min-h-screen bg-[#f9f8f6]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700/60 h-16 flex items-center">
                <div className="w-full max-w-2xl mx-auto px-6 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors font-medium text-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-base font-bold text-gray-800 dark:text-gray-200">Subscription</h1>
                    <button
                        onClick={() => router.push("/dashboard/transactions")}
                        className="p-2 text-gray-400 hover:text-gray-800 dark:text-gray-200 rounded-xl transition-all"
                        title="Transaction History"
                    >
                        <Receipt className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
                {/* Current Status Card */}
                {status && (
                    <div
                        className={`p-6 rounded-2xl border ${status.isActive
                            ? "bg-green-50/50 border-green-200/80"
                            : "bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700/60"
                            } shadow-xs`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span
                                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase ${status.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 dark:bg-slate-800 text-gray-550"
                                    }`}
                            >
                                {status.isActive ? "ACTIVE" : "FREE"}
                            </span>
                            <span
                                className={`text-base font-bold ${status.isActive ? "text-green-800" : "text-gray-800 dark:text-gray-200"
                                    }`}
                            >
                                {status.tier} Plan
                            </span>
                        </div>
                        {status.isActive && status.expiresAt ? (
                            <p className="text-green-755 text-xs font-semibold">
                                Expires on {formatDate(status.expiresAt)}
                            </p>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">
                                Upgrade to GURU for unlimited access
                            </p>
                        )}
                    </div>
                )}

                {/* Plan Card */}
                {currentPlan && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-xs overflow-hidden">
                        {/* Plan Header */}
                        <div className="p-6 border-b border-gray-150">
                            <div className="flex items-center gap-2.5 mb-1.5">
                                <Crown className="w-6 h-6 text-yellow-500" />
                                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {currentPlan.name}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{currentPlan.description}</p>
                        </div>

                        {/* Duration Selection */}
                        <div className="p-6 grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-800">
                            {(["day", "week", "month"] as Duration[]).map((duration) => {
                                const isSelected = selectedDuration === duration;
                                const savings = getSavingsPercentage(duration);

                                return (
                                    <button
                                        key={duration}
                                        onClick={() => setSelectedDuration(duration)}
                                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${isSelected
                                            ? "border-blue-600 bg-blue-50/30"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:bg-slate-800/50"
                                            }`}
                                    >
                                        {savings > 0 && (
                                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-lg shadow-sm whitespace-nowrap">
                                                Save {savings}%
                                            </span>
                                        )}
                                        <p
                                            className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? "text-blue-700" : "text-gray-400"
                                                }`}
                                        >
                                            {getDurationLabel(duration)}
                                        </p>
                                        <p
                                            className={`text-base font-bold ${isSelected ? "text-blue-700" : "text-gray-800 dark:text-gray-200"
                                                }`}
                                        >
                                            {formatPrice(currentPlan.pricing[duration])}
                                        </p>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-4 h-4 bg-blue-650 rounded-full flex items-center justify-center shadow-xs">
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Features List */}
                        <div className="p-6 space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                What&apos;s included:
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {FEATURES.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3"
                                            style={{
                                                animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                                            }}
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100/30 flex items-center justify-center shrink-0">
                                                <Icon className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                            <span className="text-xs text-gray-650 font-semibold leading-snug">
                                                {feature.text}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Subscribe Button */}
                <button
                    onClick={handleSubscribe}
                    disabled={isProcessing}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${isProcessing
                        ? "bg-gray-200 text-gray-450 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : status?.isActive ? (
                        "Extend Subscription"
                    ) : (
                        "Subscribe Now"
                    )}
                </button>

                {/* Terms */}
                <p className="text-[10px] font-semibold text-gray-400 text-center leading-relaxed max-w-md mx-auto">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                    Subscription will be charged immediately upon confirmation.
                </p>
            </main>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(6px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
