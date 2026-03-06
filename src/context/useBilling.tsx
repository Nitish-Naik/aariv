import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

export interface BillingBalance {
    balance: number;
    total_spent: number;
    auto_refill_enabled: boolean;
    auto_refill_threshold: number;
    auto_refill_amount: number;
}

interface BillingContextValue {
    balanceData: BillingBalance | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const BillingContext = createContext<BillingContextValue | null>(null);

export function BillingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [balanceData, setBalanceData] = useState<BillingBalance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const data = await api.get(`/billing/balance/${user.id}`);
            setBalanceData(data);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to load balance");
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchBalance();
    }, [user]);

    // Supabase Realtime — single subscription shared across all consumers
    useEffect(() => {
        if (!user) return;

        const channel = supabase
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
                    const row = payload.new as any;
                    setBalanceData((prev) =>
                        prev
                            ? {
                                  ...prev,
                                  balance: parseFloat(row.balance),
                                  total_spent: parseFloat(row.total_spent),
                                  auto_refill_enabled: row.auto_refill_enabled,
                                  auto_refill_threshold: parseFloat(row.auto_refill_threshold ?? 1),
                                  auto_refill_amount: parseFloat(row.auto_refill_amount ?? 10),
                              }
                            : prev
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
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
