"use client";

import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export type SubscriptionTier = "free" | "starter" | "pro";

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

export function useBilling(): BillingContextValue {
    const ctx = useContext(BillingContext);
    if (!ctx) throw new Error("useBilling must be used within a BillingProvider");
    return ctx;
}
