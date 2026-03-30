"use client";

import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export type SubscriptionTier = "free" | "starter" | "pro";

/**
 * Represents the user's current billing quota and subscription status,
 * as returned by `GET /billing/balance/:userId`.
 *
 * `in_grace_period` is set when a user has exceeded their plan limit but
 * is still within a grace window before enforcement kicks in.
 */
export interface BillingBalance {
    subscription_tier: SubscriptionTier;
    chat_messages_used: number;
    chat_messages_limit: number;
    trigger_fires_today: number;
    trigger_fires_limit: number;
    in_grace_period?: boolean;
    grace_period_ends?: string;
}

interface BillingContextValue {
    balanceData: BillingBalance | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<BillingBalance | null>;
}

const BillingContext = createContext<BillingContextValue | null>(null);

/**
 * Fetches and caches billing quota data for the authenticated user.
 * Subscribes to Supabase Realtime on the `user_credits` table so quota
 * counters update instantly without polling. The initial fetch and the
 * Realtime subscription are both deferred to avoid blocking first paint.
 *
 * @example
 * ```tsx
 * <BillingProvider>
 *   <App />
 * </BillingProvider>
 * ```
 */
export function BillingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [balanceData, setBalanceData] = useState<BillingBalance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = async (): Promise<BillingBalance | null> => {
        if (!user) {
            setIsLoading(false);
            return null;
        }

        try {
            setIsLoading(true);
            const data = await api.get(`/billing/balance/${user.id}`);
            setBalanceData(data);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load plan status");
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Defer initial fetch so it doesn't block first paint
    useEffect(() => {
        if (!user) { setIsLoading(false); return; }
        const id = requestAnimationFrame(() => { fetchBalance(); });
        return () => cancelAnimationFrame(id);
    }, [user]);

    // Supabase Realtime — defer subscription until after initial paint
    useEffect(() => {
        if (!user) return;

        let channel: ReturnType<typeof supabase.channel> | null = null;
        const timerId = setTimeout(() => {
            channel = supabase
                .channel(`billing:${user.id}`)
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "user_credits",
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        const row = payload.new as Record<string, unknown>;
                        setBalanceData((prev) =>
                            prev
                                ? {
                                    ...prev,
                                    subscription_tier: (row.subscription_tier as SubscriptionTier) ?? prev.subscription_tier,
                                    chat_messages_used: parseInt(String(row.chat_messages_used ?? prev.chat_messages_used)),
                                    chat_messages_limit: parseInt(String(row.chat_messages_limit ?? prev.chat_messages_limit)),
                                    trigger_fires_today: parseInt(String(row.trigger_fires_today ?? prev.trigger_fires_today)),
                                    trigger_fires_limit: parseInt(String(row.trigger_fires_limit ?? prev.trigger_fires_limit)),
                                }
                                : prev
                        );
                    }
                )
                .subscribe();
        }, 3000);

        return () => {
            clearTimeout(timerId);
            if (channel) supabase.removeChannel(channel);
        };
    }, [user]);

    return (
        <BillingContext.Provider value={{ balanceData, isLoading, error, refetch: fetchBalance }}>
            {children}
        </BillingContext.Provider>
    );
}

/**
 * Hook to access billing quota and subscription data from any component.
 * Must be rendered inside `BillingProvider`.
 *
 * @returns `balanceData`, `isLoading`, `error`, and a `refetch` function
 *   to manually refresh quota from the backend.
 *
 * @throws If called outside of `BillingProvider`.
 *
 * @example
 * ```tsx
 * const { balanceData } = useBilling();
 * const remaining = balanceData?.chat_messages_limit - balanceData?.chat_messages_used;
 * ```
 */
export function useBilling(): BillingContextValue {
    const ctx = useContext(BillingContext);
    if (!ctx) throw new Error("useBilling must be used within a BillingProvider");
    return ctx;
}
