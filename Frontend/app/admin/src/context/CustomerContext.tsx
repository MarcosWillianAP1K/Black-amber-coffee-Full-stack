/**
 * CustomerContext — Centralized customer state with auto-polling.
 *
 * Fetches customers once on mount, then polls every 45s.
 */

import {
    createContext,
    useContext,
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import type { User as Customer, UserUpdateInput as CustomerUpdateInput } from "shared-utils/types/user";
import * as customerService from "../services/customerService";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const POLL_INTERVAL_MS = 45_000; // 45 seconds — staggered from OrderContext (30s) and EmployeeContext (40s)

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface CustomerContextValue {
    customers: Customer[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    deleteCustomer: (publicId: string) => Promise<void>;
    updateCustomer: (publicId: string, updates: Partial<CustomerUpdateInput>) => Promise<void>;
}

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────

const CustomerContext = createContext<CustomerContextValue | undefined>(undefined);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function CustomerProvider({ children }: { children: ReactNode }) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mountedRef = useRef(false);
    const abortedRef = useRef(false);

    // ── Fetch customers ──────────────────────

    const refresh = useCallback(async () => {
        if (abortedRef.current) return;
        setError(null);
        try {
            const data = await customerService.fetchCustomers();
            if (!abortedRef.current) setCustomers(data);
        } catch (err) {
            if (!abortedRef.current) {
                const message = err instanceof Error ? err.message : "Failed to load customers";
                setError(message);
            }
        } finally {
            if (!abortedRef.current) setIsLoading(false);
        }
    }, []);

    // ── Initial fetch + polling ──────────────
    // Staggered 9s after mount to spread out requests

    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;
        abortedRef.current = false;

        const initialTimer = setTimeout(refresh, 9_000);

        pollingRef.current = setInterval(refresh, POLL_INTERVAL_MS);

        return () => {
            abortedRef.current = true;
            clearTimeout(initialTimer);
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
            mountedRef.current = false;
        };
    }, [refresh]);

    // ── Actions ──────────────────────────────

    const deleteCustomer = useCallback(
        async (publicId: string) => {
            try {
                await customerService.deleteCustomer(publicId);
                setCustomers((prev) => prev.filter((c) => c.publicId !== publicId));
                refresh();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to delete customer";
                setError(message);
                throw err;
            }
        },
        [refresh],
    );

    const updateCustomer = useCallback(
        async (publicId: string, updates: Partial<CustomerUpdateInput>) => {
            try {
                const updated = await customerService.updateCustomer(publicId, updates);
                setCustomers((prev) => prev.map((c) => (c.publicId === publicId ? updated : c)));
                refresh();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to update customer";
                setError(message);
                throw err;
            }
        },
        [refresh],
    );

    // ── Render ───────────────────────────────

    return (
        <CustomerContext.Provider
            value={{
                customers,
                isLoading,
                error,
                refresh,
                deleteCustomer,
                updateCustomer,
            }}
        >
            {children}
        </CustomerContext.Provider>
    );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useCustomerContext(): CustomerContextValue {
    const context = useContext(CustomerContext);
    if (!context) {
        throw new Error("useCustomerContext must be used within a CustomerProvider");
    }
    return context;
}
