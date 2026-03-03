"use client";

import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/useBilling";
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

    useEffect(() => {
        if (user) {
            const fetchExtras = async () => {
                try {
                    const envUrl =
                        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
                    const baseUrl = envUrl.endsWith("/api")
                        ? envUrl.slice(0, -4)
                        : envUrl;

                    const [usageRes, historyRes] = await Promise.all([
                        fetch(`${baseUrl}/api/billing/usage/${user.id}?days=30`),
                        fetch(`${baseUrl}/api/billing/history/${user.id}?limit=20`),
                    ]);

                    if (usageRes.ok) setUsageData(await usageRes.json());
                    if (historyRes.ok) setHistory(await historyRes.json());
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
                <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16">
                {/* Header */}
                <header className="mb-10">
                    <h1 className="text-2xl font-serif text-[var(--text-primary)] mb-1">
                        Usage & Billing
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Credits, usage breakdown, and spending history.
                    </p>
                </header>

                <div className="space-y-4">
                    {/* ─── Credit Balance ─── */}
                    <section className="bg-[var(--bg-surface)] rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                                    Credit Balance
                                </p>
                                <p className="text-3xl font-semibold text-[var(--text-primary)] font-mono">
                                    ${balanceValue.toFixed(2)}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
                                <Wallet size={18} className="text-[var(--accent)]" />
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-5">
                            <div className="h-1.5 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAddCredits(true)}
                                className="px-4 py-2 bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-medium rounded-lg hover:opacity-80 transition-opacity"
                            >
                                Add Credits
                            </button>
                            <button className="px-4 py-2 bg-[var(--bg-deep)] text-[var(--text-secondary)] text-xs font-medium rounded-lg hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
                                <RefreshCw size={12} />
                                {balanceData?.auto_refill_enabled
                                    ? "Manage Auto-Refill"
                                    : "Auto-Refill"}
                            </button>
                        </div>
                    </section>

                    {/* ─── Usage Summary ─── */}
                    <section className="bg-[var(--bg-surface)] rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-[var(--border)]">
                            <div className="flex items-center gap-2">
                                <Activity size={14} className="text-[var(--text-muted)]" />
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                    Usage Summary
                                </p>
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                                {usageData?.period || "Last 30 days"}
                            </p>
                        </div>

                        {usageData && Object.keys(usageData.summary).length > 0 ? (
                            <div className="divide-y divide-[var(--border)]">
                                {Object.entries(usageData.summary).map(
                                    ([model, data]: [string, any]) => (
                                        <div key={model} className="px-6 py-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                                    {model}
                                                </p>
                                                <span className="text-sm font-mono text-[var(--accent)]">
                                                    ${data.cost.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex gap-4">
                                                <div>
                                                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                                                        Input
                                                    </p>
                                                    <p className="text-xs font-mono text-[var(--text-secondary)]">
                                                        {data.input_tokens.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                                                        Output
                                                    </p>
                                                    <p className="text-xs font-mono text-[var(--text-secondary)]">
                                                        {data.output_tokens.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                                {/* Total */}
                                <div className="px-6 py-3 bg-[var(--bg-deep)]">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-medium text-[var(--text-muted)]">
                                            Total
                                        </p>
                                        <p className="text-sm font-mono font-semibold text-[var(--accent)]">
                                            ${usageData.total_cost.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="px-6 py-10 text-center">
                                <p className="text-sm text-[var(--text-muted)]">
                                    {loadingExtras
                                        ? "Loading usage..."
                                        : "No usage recorded yet."}
                                </p>
                            </div>
                        )}
                    </section>

                    {/* ─── Spending History ─── */}
                    <section className="bg-[var(--bg-surface)] rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-[var(--border)]">
                            <div className="flex items-center gap-2">
                                <History size={14} className="text-[var(--text-muted)]" />
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                    Spending History
                                </p>
                            </div>
                        </div>

                        {history.length > 0 ? (
                            <div className="divide-y divide-[var(--border)]">
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
                                                    : "bg-[var(--bg-deep)]"
                                                    }`}
                                            >
                                                {isPositive ? (
                                                    <ArrowUpRight size={14} className="text-emerald-400" />
                                                ) : (
                                                    <ArrowDownRight
                                                        size={14}
                                                        className="text-[var(--text-muted)]"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-[var(--text-primary)] truncate">
                                                    {tx.description}
                                                </p>
                                                <p className="text-[11px] text-[var(--text-muted)]">
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
                                                    className={`text-sm font-mono font-medium ${isPositive ? "text-emerald-400" : "text-[var(--text-muted)]"
                                                        }`}
                                                >
                                                    {isPositive ? "+" : ""}${Math.abs(tx.amount).toFixed(isPositive ? 2 : 4)}
                                                </p>
                                                <p className="text-[11px] font-mono text-[var(--text-muted)]">
                                                    ${tx.balance.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="px-6 py-10 text-center">
                                <p className="text-sm text-[var(--text-muted)]">
                                    {loadingExtras
                                        ? "Loading history..."
                                        : "No transaction history."}
                                </p>
                            </div>
                        )}
                    </section>
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
                        className="absolute inset-0 bg-[var(--bg-deep)]/80 backdrop-blur-sm"
                        onClick={() => setShowAddCredits(false)}
                    />
                    <div className="relative bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-7 shadow-2xl">
                        <button
                            onClick={() => setShowAddCredits(false)}
                            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-[var(--bg-deep)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <X size={14} />
                        </button>

                        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-0.5">
                            Add Credits
                        </h2>
                        <p className="text-xs text-[var(--text-muted)] mb-5">
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
                                        ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]"
                                        : "bg-[var(--bg-deep)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-muted)]"
                                        }`}
                                >
                                    ${amt}
                                </button>
                            ))}
                        </div>

                        {/* Custom */}
                        <div className="mb-5">
                            <label className="text-xs font-medium text-[var(--text-primary)] mb-1.5 block">
                                Custom amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">
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
                                    className="w-full py-2.5 pl-7 pr-4 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
                                />
                            </div>
                            {customAmount && parseFloat(customAmount) < 5 && (
                                <p className="text-[11px] text-red-400 mt-1.5">Minimum $5.00</p>
                            )}
                        </div>

                        {/* Pay */}
                        {(() => {
                            const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
                            const isValid = amount && amount >= 5 && amount <= 500;
                            return (
                                <button
                                    onClick={() => {
                                        if (!isValid) return;
                                        // TODO: Redirect to Stripe Checkout
                                        console.log(`Redirect to Stripe for $${amount}`);
                                        setShowAddCredits(false);
                                    }}
                                    disabled={!isValid}
                                    className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-opacity ${isValid
                                        ? "bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-80 cursor-pointer"
                                        : "bg-[var(--bg-deep)] text-[var(--text-muted)] cursor-not-allowed opacity-50"
                                        }`}
                                >
                                    <CreditCard size={15} />
                                    Pay with Stripe
                                    <ExternalLink size={13} />
                                </button>
                            );
                        })()}

                        <p className="text-[10px] text-[var(--text-muted)] text-center mt-3">
                            You will be redirected to Stripe to complete your payment.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
