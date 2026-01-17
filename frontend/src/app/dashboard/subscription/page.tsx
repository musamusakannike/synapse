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
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-slate-400">Loading subscription info...</p>
                </div>
            </div>
        );
    }

    const currentPlan = plans[0];

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-lg font-semibold text-white">Subscription</h1>
                    <button
                        onClick={() => router.push("/dashboard/transactions")}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        title="Transaction History"
                    >
                        <Receipt className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Current Status Card */}
                {status && (
                    <div
                        className={`p-6 rounded-2xl border ${status.isActive
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-slate-800/50 border-slate-700/50"
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${status.isActive
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-slate-600/50 text-slate-300"
                                    }`}
                            >
                                {status.isActive ? "ACTIVE" : "FREE"}
                            </span>
                            <span
                                className={`text-xl font-bold ${status.isActive ? "text-green-400" : "text-white"
                                    }`}
                            >
                                {status.tier} Plan
                            </span>
                        </div>
                        {status.isActive && status.expiresAt ? (
                            <p className="text-green-400/80 text-sm">
                                Expires on {formatDate(status.expiresAt)}
                            </p>
                        ) : (
                            <p className="text-slate-400 text-sm">
                                Upgrade to GURU for unlimited access
                            </p>
                        )}
                    </div>
                )}

                {/* Plan Card */}
                {currentPlan && (
                    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                        {/* Plan Header */}
                        <div className="p-6 border-b border-slate-700/50">
                            <div className="flex items-center gap-3 mb-2">
                                <Crown className="w-7 h-7 text-yellow-400" />
                                <span className="text-2xl font-bold text-white">
                                    {currentPlan.name}
                                </span>
                            </div>
                            <p className="text-slate-400">{currentPlan.description}</p>
                        </div>

                        {/* Duration Selection */}
                        <div className="p-4 flex gap-3">
                            {(["day", "week", "month"] as Duration[]).map((duration) => {
                                const isSelected = selectedDuration === duration;
                                const savings = getSavingsPercentage(duration);

                                return (
                                    <button
                                        key={duration}
                                        onClick={() => setSelectedDuration(duration)}
                                        className={`relative flex-1 p-4 rounded-xl border-2 transition-all ${isSelected
                                            ? "border-blue-500 bg-blue-500/10"
                                            : "border-slate-600 hover:border-slate-500 bg-slate-700/30"
                                            }`}
                                    >
                                        {savings > 0 && (
                                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                                                Save {savings}%
                                            </span>
                                        )}
                                        <p
                                            className={`text-xs font-medium mb-1 ${isSelected ? "text-blue-400" : "text-slate-400"
                                                }`}
                                        >
                                            {getDurationLabel(duration)}
                                        </p>
                                        <p
                                            className={`text-lg font-bold ${isSelected ? "text-blue-400" : "text-white"
                                                }`}
                                        >
                                            {formatPrice(currentPlan.pricing[duration])}
                                        </p>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Features List */}
                        <div className="p-6 pt-2">
                            <h3 className="text-sm font-semibold text-white mb-4">
                                What&apos;s included:
                            </h3>
                            <div className="space-y-3">
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
                                            <div className="w-9 h-9 rounded-full bg-blue-500/15 flex items-center justify-center">
                                                <Icon className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <span className="text-sm text-slate-300">
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
                    className={`w-full py-4 rounded-full font-semibold text-lg transition-all ${isProcessing
                        ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                        : "bg-linear-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]"
                        }`}
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </span>
                    ) : status?.isActive ? (
                        "Extend Subscription"
                    ) : (
                        "Subscribe Now"
                    )}
                </button>

                {/* Terms */}
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                    Subscription will be charged immediately upon confirmation.
                </p>
            </main>

            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
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
