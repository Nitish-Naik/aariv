import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export interface BillingBalance {
    balance: number;
    total_spent: number;
    auto_refill_enabled: boolean;
    auto_refill_threshold: number;
    auto_refill_amount: number;
}

export function useBilling() {
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
            const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
            // Strip trailing /api if present to avoid /api/api
            const baseUrl = envUrl.endsWith('/api') ? envUrl.slice(0, -4) : envUrl;

            const res = await fetch(`${baseUrl}/api/billing/balance/${user.id}`);
            if (!res.ok) throw new Error("Failed to fetch balance");
            const data = await res.json();
            setBalanceData(data);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to load balance");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [user]);

    return { balanceData, isLoading, error, refetch: fetchBalance };
}
