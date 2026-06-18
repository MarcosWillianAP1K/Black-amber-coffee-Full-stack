/**
 * EmployeeContext — Centralized employee/staff state with auto-polling.
 *
 * Fetches workers once on mount, then polls every 30s.
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
import type { Worker, WorkerUpdateInput } from "shared-utils/types/worker";
import * as employeeService from "../services/employeeService";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const POLL_INTERVAL_MS = 40_000; // 40 seconds — staggered from OrderContext (30s) and MenuContext (35s)

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface EmployeeContextValue {
    employees: Worker[];
    isLoading: boolean;
    error: string | null;
    /**
     * Whether the backend supports blocking/unblocking employees.
     * Currently false — no API endpoint exists for toggling isActive.
     * Use this to hide/disable the block button in the UI.
     */
    canBlockEmployees: boolean;
    refresh: () => Promise<void>;
    deleteEmployee: (publicId: string) => Promise<void>;
    toggleEmployeeStatus: (publicId: string) => Promise<void>;
    updateEmployee: (publicId: string, updates: Partial<WorkerUpdateInput>) => Promise<void>;
}

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────

const EmployeeContext = createContext<EmployeeContextValue | undefined>(undefined);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function EmployeeProvider({ children }: { children: ReactNode }) {
    const [employees, setEmployees] = useState<Worker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mountedRef = useRef(false);
    const abortedRef = useRef(false);

    // ── Fetch employees ──────────────────────

    const refresh = useCallback(async () => {
        if (abortedRef.current) return;
        setError(null);
        try {
            const data = await employeeService.fetchEmployees();
            if (!abortedRef.current) setEmployees(data);
        } catch (err) {
            if (!abortedRef.current) {
                const message = err instanceof Error ? err.message : "Failed to load employees";
                setError(message);
            }
        } finally {
            if (!abortedRef.current) setIsLoading(false);
        }
    }, []);

    // ── Initial fetch + polling ──────────────
    // Staggered 6s after mount to spread out requests

    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;
        abortedRef.current = false;

        const initialTimer = setTimeout(refresh, 6_000);

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

    const deleteEmployee = useCallback(
        async (publicId: string) => {
            try {
                await employeeService.deleteEmployee(publicId);
                setEmployees((prev) => prev.filter((e) => e.publicId !== publicId));
                refresh();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to delete employee";
                setError(message);
                throw err;
            }
        },
        [refresh],
    );

    const toggleEmployeeStatus = useCallback(
        async (publicId: string) => {
            try {
                const updated = await employeeService.toggleEmployeeStatus(publicId);
                setEmployees((prev) => prev.map((e) => (e.publicId === publicId ? updated : e)));
                refresh();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to toggle employee status";
                setError(message);
                throw err;
            }
        },
        [refresh],
    );

    const updateEmployee = useCallback(
        async (publicId: string, updates: Partial<WorkerUpdateInput>) => {
            try {
                const updated = await employeeService.updateEmployee(publicId, updates);
                setEmployees((prev) => prev.map((e) => (e.publicId === publicId ? updated : e)));
                refresh();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to update employee";
                setError(message);
                throw err;
            }
        },
        [refresh],
    );

    // ── Render ───────────────────────────────

    return (
        <EmployeeContext.Provider
            value={{
                employees,
                isLoading,
                error,
                canBlockEmployees: false, // No API endpoint for toggling isActive
                refresh,
                deleteEmployee,
                toggleEmployeeStatus,
                updateEmployee,
            }}
        >
            {children}
        </EmployeeContext.Provider>
    );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useEmployeeContext(): EmployeeContextValue {
    const context = useContext(EmployeeContext);
    if (!context) {
        throw new Error("useEmployeeContext must be used within an EmployeeProvider");
    }
    return context;
}
