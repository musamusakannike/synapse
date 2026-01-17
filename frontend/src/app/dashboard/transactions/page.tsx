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
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "successful":
                return "text-green-400 bg-green-400/20";
            case "pending":
                return "text-yellow-400 bg-yellow-400/20";
            case "failed":
                return "text-red-400 bg-red-400/20";
            case "cancelled":
                return "text-slate-400 bg-slate-400/20";
            default:
                return "text-slate-400 bg-slate-400/20";
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
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-slate-400">Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="flex-1 text-center text-lg font-semibold text-white">
                        Transaction History
                    </h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-24 h-24 rounded-full bg-blue-500/15 flex items-center justify-center mb-6">
                            <Crown className="w-12 h-12 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-3">
                            No Transactions Yet
                        </h2>
                        <p className="text-slate-400 text-center max-w-sm mb-6">
                            Your subscription transactions will appear here once you make a
                            purchase.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/subscription")}
                            className="px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors"
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
                                    className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
                                    style={{
                                        animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                                    }}
                                >
                                    {/* Transaction Header */}
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Crown className="w-6 h-6 text-yellow-400" />
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {transaction.plan} Plan
                                                </p>
                                                <p className="text-sm text-slate-400">
                                                    {getDurationLabel(transaction.duration)}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                transaction.status
                                            )}`}
                                        >
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {transaction.status.charAt(0).toUpperCase() +
                                                transaction.status.slice(1)}
                                        </span>
                                    </div>

                                    {/* Transaction Details */}
                                    <div className="p-4 pt-0 border-t border-slate-700/50 space-y-2.5">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-400">Amount</span>
                                            <span className="text-sm font-medium text-white">
                                                {formatPrice(transaction.amount, transaction.currency)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-400">Date</span>
                                            <span className="text-sm font-medium text-white">
                                                {formatDate(transaction.createdAt)} at{" "}
                                                {formatTime(transaction.createdAt)}
                                            </span>
                                        </div>

                                        {transaction.paymentMethod && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-400">
                                                    Payment Method
                                                </span>
                                                <span className="text-sm font-medium text-white">
                                                    {transaction.paymentMethod.charAt(0).toUpperCase() +
                                                        transaction.paymentMethod.slice(1)}
                                                </span>
                                            </div>
                                        )}

                                        {transaction.status === "successful" &&
                                            transaction.startsAt &&
                                            transaction.expiresAt && (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-slate-400">
                                                            Valid From
                                                        </span>
                                                        <span className="text-sm font-medium text-white">
                                                            {formatDate(transaction.startsAt)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-slate-400">
                                                            Valid Until
                                                        </span>
                                                        <span className="text-sm font-medium text-white">
                                                            {formatDate(transaction.expiresAt)}
                                                        </span>
                                                    </div>
                                                </>
                                            )}

                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-400">Reference</span>
                                            <span className="text-xs text-slate-500 truncate max-w-[60%]">
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
