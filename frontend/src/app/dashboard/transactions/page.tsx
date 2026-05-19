"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Crown, CheckCircle, Clock, XCircle, Ban, HelpCircle, Loader2 } from "lucide-react";
import { SubscriptionAPI } from "@/lib/api";

interface Transaction {
    _id: string;
    plan: string;
    duration: string;
    amount: number;
    currency: string;
    status: string;
    startsAt: string;
    expiresAt: string;
    paymentMethod?: string;
    createdAt: string;
    txRef: string;
}

export default function TransactionsPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadTransactions = useCallback(async () => {
        try {
            const response = await SubscriptionAPI.getHistory();
            setTransactions(response.data.data || []);
        } catch (error) {
            console.error("Error loading transactions:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPrice = (amount: number, currency: string) => {
        if (currency === "NGN") {
            return `₦${amount.toLocaleString()}`;
        }
        return `${currency} ${amount.toLocaleString()}`;
    };

    const getDurationLabel = (duration: string) => {
        switch (duration) {
            case "day":
                return "1 Day";
            case "week":
                return "1 Week";
            case "month":
                return "1 Month";
            default:
                return duration;
        }
    };    const getStatusColor = (status: string) => {
        switch (status) {
            case "successful":
                return "text-green-700 bg-green-50 border border-green-200/50";
            case "pending":
                return "text-yellow-700 bg-yellow-50 border border-yellow-200/50";
            case "failed":
                return "text-red-650 bg-red-50 border border-red-200/50";
            case "cancelled":
                return "text-gray-500 bg-gray-50 border border-gray-200/55";
            default:
                return "text-gray-500 bg-gray-50 border border-gray-200/55";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "successful":
                return CheckCircle;
            case "pending":
                return Clock;
            case "failed":
                return XCircle;
            case "cancelled":
                return Ban;
            default:
                return HelpCircle;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-gray-500 text-sm font-semibold">Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f8f6]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200/60 h-16 flex items-center">
                <div className="w-full max-w-2xl mx-auto px-6 flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
                        aria-label="Back"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h1 className="flex-1 text-center text-base font-bold text-gray-800">
                        Transaction History
                    </h1>
                    <div className="w-8" /> {/* Spacer for centering */}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200/60 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100/30 flex items-center justify-center mb-4">
                            <Crown className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-base font-bold text-gray-850 mb-2">
                            No Transactions Yet
                        </h2>
                        <p className="text-gray-500 text-center max-w-xs text-xs font-semibold mb-6">
                            Your subscription transactions will appear here once you make a
                            purchase.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/subscription")}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-xs shadow-sm"
                        >
                            View Plans
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((transaction, index) => {
                            const StatusIcon = getStatusIcon(transaction.status);

                            return (
                                <div
                                    key={transaction._id}
                                    className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-xs"
                                    style={{
                                        animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                                    }}
                                >
                                    {/* Transaction Header */}
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-yellow-50 rounded-xl">
                                                <Crown className="w-5 h-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">
                                                    {transaction.plan} Plan
                                                </p>
                                                <p className="text-xs text-gray-500 font-semibold">
                                                    {getDurationLabel(transaction.duration)}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${getStatusColor(
                                                transaction.status
                                            )}`}
                                        >
                                            <StatusIcon className="w-3 h-3" />
                                            <span>
                                                {transaction.status.charAt(0).toUpperCase() +
                                                    transaction.status.slice(1)}
                                            </span>
                                        </span>
                                    </div>

                                    {/* Transaction Details */}
                                    <div className="p-4 pt-3 border-t border-gray-100 space-y-2.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-semibold">Amount</span>
                                            <span className="text-xs font-bold text-gray-800">
                                                {formatPrice(transaction.amount, transaction.currency)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-semibold">Date</span>
                                            <span className="text-xs font-bold text-gray-800">
                                                {formatDate(transaction.createdAt)} at{" "}
                                                {formatTime(transaction.createdAt)}
                                            </span>
                                        </div>

                                        {transaction.paymentMethod && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500 font-semibold">
                                                    Payment Method
                                                </span>
                                                <span className="text-xs font-bold text-gray-800">
                                                    {transaction.paymentMethod.charAt(0).toUpperCase() +
                                                        transaction.paymentMethod.slice(1)}
                                                </span>
                                            </div>
                                        )}

                                        {transaction.status === "successful" &&
                                            transaction.startsAt &&
                                            transaction.expiresAt && (
                                                <>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500 font-semibold">
                                                            Valid From
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-800">
                                                            {formatDate(transaction.startsAt)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500 font-semibold">
                                                            Valid Until
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-800">
                                                            {formatDate(transaction.expiresAt)}
                                                        </span>
                                                    </div>
                                                </>
                                            )}

                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-semibold">Reference</span>
                                            <span className="text-[10px] font-mono text-gray-405 truncate max-w-[60%]">
                                                {transaction.txRef}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
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
