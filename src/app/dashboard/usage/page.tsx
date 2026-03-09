"use client";

import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/useBilling";
import { api } from "@/lib/api";
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    ExternalLink,
    History,
    RefreshCw,
    Wallet,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface UsageSummary {
    period: string;
    summary: Record<string, any>;
    total_cost: number;
}

interface Transaction {
    id: string;
    date: string;
    type: string;
    description: string;
    amount: number;
    balance: number;
}

export default function UsagePage() {
    const { user } = useAuth();
    const { balanceData, isLoading: balanceLoading, refetch } = useBilling();

    const [usageData, setUsageData] = useState<UsageSummary | null>(null);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [loadingExtras, setLoadingExtras] = useState(true);
    const [showAddCredits, setShowAddCredits] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
    const [customAmount, setCustomAmount] = useState("");
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            const fetchExtras = async () => {
                try {
                    const [usageData, historyData] = await Promise.all([
                        api.get(`/billing/usage/${user.id}?days=30`),
                        api.get(`/billing/history/${user.id}?limit=20`),
                    ]);
                    if (usageData) setUsageData(usageData);
                    if (historyData) setHistory(historyData);
                } catch (e) {
                    console.error("Failed to load usage data", e);
                } finally {
                    setLoadingExtras(false);
                }
            };

            fetchExtras();
        }
    }, [user]);

    const balanceValue = balanceData?.balance || 0;
    const progressPercent = Math.min(
        Math.max((balanceValue / 10) * 100, 0),
        100
    );

    if (balanceLoading || !user) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 h-full">
                <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <div className="max-w-[1048px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <header className="mb-10">
                    <h1 className="text-2xl font-semibold text-white mb-2">
                        Usage & Billing
                    </h1>
                    <p className="text-sm text-neutral-400">
                        Credits, usage breakdown, and spending history.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-8 lg:gap-12">
                    <div className="space-y-6 flex flex-col">
                        {/* ─── Credit Balance ─── */}
                        <section className="bg-black border border-white/10 shadow-sm rounded-lg p-6">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
                                        Credit Balance
                                    </p>
                                    <p className="text-3xl font-semibold text-white font-mono">
                                        ${balanceValue.toFixed(2)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Wallet strokeWidth={1.5} size={18} className="text-white" />
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-5">
                                <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddCredits(true)}
                                    className="px-4 py-2 bg-white/5 text-white text-xs font-medium rounded-lg hover:opacity-80 transition-opacity"
                                >
                                    Add Credits
                                </button>
                                <button className="px-4 py-2 bg-black text-neutral-400 text-xs font-medium rounded-lg hover:text-white transition-colors flex items-center gap-1.5">
                                    <RefreshCw strokeWidth={1.5} size={12} />
                                    {balanceData?.auto_refill_enabled
                                        ? "Manage Auto-Refill"
                                        : "Auto-Refill"}
                                </button>
                            </div>
                        </section>

                        {/* ─── Usage Summary ─── */}
                        <section className="bg-black border border-white/10 shadow-sm rounded-lg overflow-hidden flex-1">
                            <div className="px-6 py-5 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <Activity strokeWidth={1.5} size={16} className="text-neutral-500" />
                                    <p className="text-sm font-medium text-white">
                                        Usage Summary
                                    </p>
                                </div>
                                <p className="text-[11px] text-neutral-500 mt-0.5">
                                    {usageData?.period || "Last 30 days"}
                                </p>
                            </div>

                            {usageData && Object.keys(usageData.summary).length > 0 ? (
                                <div className="divide-y divide-white/10">
                                    {Object.entries(usageData.summary).map(
                                        ([model, data]: [string, any]) => (
                                            <div key={model} className="px-6 py-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm font-medium text-white">
                                                        {model}
                                                    </p>
                                                    <span className="text-sm font-mono text-white">
                                                        ${data.cost.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div>
                                                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                                                            Input
                                                        </p>
                                                        <p className="text-xs font-mono text-neutral-400">
                                                            {data.input_tokens.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                                                            Output
                                                        </p>
                                                        <p className="text-xs font-mono text-neutral-400">
                                                            {data.output_tokens.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                    {/* Total */}
                                    <div className="px-6 py-3 bg-black">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium text-neutral-500">
                                                Total
                                            </p>
                                            <p className="text-sm font-mono font-semibold text-white">
                                                ${usageData.total_cost.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-6 py-10 text-center">
                                    <p className="text-sm text-neutral-500">
                                        {loadingExtras
                                            ? "Loading usage..."
                                            : "No usage recorded yet."}
                                    </p>
                                </div>
                            )}
                        </section>

                    </div>

                    {/* ─── Spending History ─── */}
                    <div className="lg:col-span-2">
                        <section className="bg-black border border-white/10 shadow-sm rounded-lg overflow-hidden h-full">
                            <div className="px-6 py-5 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <History strokeWidth={1.5} size={16} className="text-neutral-500" />
                                    <p className="text-sm font-medium text-white">
                                        Spending History
                                    </p>
                                </div>
                            </div>

                            {history.length > 0 ? (
                                <div className="divide-y divide-white/10">
                                    {history.map((tx) => {
                                        const dateObj = new Date(tx.date);
                                        const isPositive = tx.amount > 0;

                                        return (
                                            <div
                                                key={tx.id}
                                                className="px-6 py-3.5 flex items-center gap-3"
                                            >
                                                <div
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isPositive
                                                        ? "bg-emerald-500/10"
                                                        : "bg-black"
                                                        }`}
                                                >
                                                    {isPositive ? (
                                                        <ArrowUpRight strokeWidth={1.5} size={14} className="text-emerald-400" />
                                                    ) : (
                                                        <ArrowDownRight strokeWidth={1.5}
                                                            size={14}
                                                            className="text-neutral-500"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white truncate">
                                                        {tx.description}
                                                    </p>
                                                    <p className="text-[11px] text-neutral-500">
                                                        {dateObj.toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p
                                                        className={`text-sm font-mono font-medium ${isPositive ? "text-emerald-400" : "text-neutral-500"
                                                            }`}
                                                    >
                                                        {isPositive ? "+" : ""}${Math.abs(tx.amount).toFixed(isPositive ? 2 : 4)}
                                                    </p>
                                                    <p className="text-[11px] font-mono text-neutral-500">
                                                        ${tx.balance.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="px-6 py-10 text-center">
                                    <p className="text-sm text-neutral-500">
                                        {loadingExtras
                                            ? "Loading history..."
                                            : "No transaction history."}
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {/* ─── Add Credits Modal ─── */}
            {showAddCredits && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowAddCredits(false)}
                    />
                    <div className="relative bg-black border border-white/10 rounded-xl w-full max-w-sm p-7 shadow-2xl">
                        <button
                            onClick={() => setShowAddCredits(false)}
                            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-black flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                        >
                            <X strokeWidth={1.5} size={14} />
                        </button>

                        <h2 className="text-lg font-medium text-white mb-0.5">
                            Add Credits
                        </h2>
                        <p className="text-xs text-neutral-500 mb-5">
                            Choose an amount to add to your balance.
                        </p>

                        {/* Preset */}
                        <div className="grid grid-cols-2 gap-2 mb-5">
                            {[10, 25, 50, 100].map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => {
                                        setSelectedAmount(amt);
                                        setCustomAmount("");
                                    }}
                                    className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${selectedAmount === amt && !customAmount
                                        ? "bg-white/5 text-white border-white/30"
                                        : "bg-black text-neutral-400 border-white/10 hover:border-neutral-500"
                                        }`}
                                >
                                    ${amt}
                                </button>
                            ))}
                        </div>

                        {/* Custom */}
                        <div className="mb-5">
                            <label className="text-xs font-medium text-white mb-1.5 block">
                                Custom amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                                    $
                                </span>
                                <input
                                    type="number"
                                    min={5}
                                    max={500}
                                    step={0.01}
                                    value={customAmount}
                                    onChange={(e) => {
                                        setCustomAmount(e.target.value);
                                        setSelectedAmount(null);
                                    }}
                                    placeholder="5.00 - 500.00"
                                    className="w-full py-2.5 pl-7 pr-4 rounded-xl bg-black border border-white/10 text-white text-sm placeholder:text-neutral-500 outline-none focus:border-white/30 transition-colors"
                                />
                            </div>
                            {customAmount && parseFloat(customAmount) < 5 && (
                                <p className="text-[11px] text-red-400 mt-1.5">Minimum $5.00</p>
                            )}
                        </div>

                        {/* Pay */}
                        {(() => {
                            const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
                            const isValid = amount !== null && amount !== undefined && amount >= 5 && amount <= 500;
                            return (
                                <>
                                    <button
                                        onClick={async () => {
                                            if (!isValid || isCreatingCheckout) return;
                                            setCheckoutError(null);
                                            setIsCreatingCheckout(true);
                                            try {
                                                const data = await api.post("/billing/create-checkout", { amount });
                                                if (data?.checkout_url) {
                                                    window.location.href = data.checkout_url;
                                                } else {
                                                    setCheckoutError("No checkout URL returned. Please try again.");
                                                }
                                            } catch (e: any) {
                                                setCheckoutError(e?.message || "Failed to start checkout. Please try again.");
                                            } finally {
                                                setIsCreatingCheckout(false);
                                            }
                                        }}
                                        disabled={!isValid || isCreatingCheckout}
                                        className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-opacity ${isValid && !isCreatingCheckout
                                            ? "bg-white/5 text-white hover:opacity-80 cursor-pointer"
                                            : "bg-black text-neutral-500 cursor-not-allowed opacity-50"
                                            }`}
                                    >
                                        <CreditCard strokeWidth={1.5} size={15} />
                                        {isCreatingCheckout ? "Redirecting..." : "Pay with Dodo"}
                                        {!isCreatingCheckout && <ExternalLink strokeWidth={1.5} size={13} />}
                                    </button>
                                    {checkoutError && (
                                        <p className="text-[11px] text-red-400 text-center mt-1.5">{checkoutError}</p>
                                    )}
                                </>
                            );
                        })()}

                        <p className="text-[10px] text-neutral-500 text-center mt-3">
                            You will be redirected to Dodo Payments to complete your purchase.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
