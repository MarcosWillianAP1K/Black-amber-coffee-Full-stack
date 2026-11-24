import { create } from "zustand";
import type { Worker, WorkerUpdateInput } from "shared-utils/types/worker";
import * as employeeService from "../services/employeeService";

const POLL_INTERVAL_MS = 40_000;

export interface EmployeeStoreState {
    employees: Worker[];
    isLoading: boolean;
    error: string | null;
    canBlockEmployees: boolean;
    pendingEmployeeIds: Record<string, boolean>;
    refresh: () => Promise<void>;
    deleteEmployee: (publicId: string) => Promise<void>;
    toggleEmployeeStatus: (publicId: string) => Promise<void>;
    updateEmployee: (publicId: string, updates: Partial<WorkerUpdateInput>) => Promise<void>;
    startPolling: () => void;
    stopPolling: () => void;
    reset: () => void;
}

let pollingTimer: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

export const useEmployeeStore = create<EmployeeStoreState>((set, get) => ({
    employees: [],
    isLoading: true,
    error: null,
    canBlockEmployees: true,
    pendingEmployeeIds: {},

    refresh: async () => {
        set({ error: null });
        try {
            const data = await employeeService.fetchEmployees();
            set({ employees: data, isLoading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load employees";
            set({ error: message, isLoading: false });
        }
    },

    deleteEmployee: async (publicId) => {
        set((state) => ({
            pendingEmployeeIds: { ...state.pendingEmployeeIds, [publicId]: true },
            error: null,
        }));

        try {
            await employeeService.deleteEmployee(publicId);
            set((state) => ({
                employees: state.employees.filter((e) => e.publicId !== publicId),
            }));
            void get().refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete employee";
            set({ error: message });
            throw err;
        } finally {
            set((state) => {
                const nextPending = { ...state.pendingEmployeeIds };
                delete nextPending[publicId];
                return { pendingEmployeeIds: nextPending };
            });
        }
    },

    toggleEmployeeStatus: async (publicId) => {
        set((state) => ({
            pendingEmployeeIds: { ...state.pendingEmployeeIds, [publicId]: true },
            error: null,
        }));

        try {
            const updated = await employeeService.toggleEmployeeStatus(publicId);
            set((state) => ({
                employees: state.employees.map((e) => (e.publicId === publicId ? updated : e)),
            }));
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to toggle employee status";
            set({ error: message });
            throw err;
        } finally {
            set((state) => {
                const nextPending = { ...state.pendingEmployeeIds };
                delete nextPending[publicId];
                return { pendingEmployeeIds: nextPending };
            });
        }
    },

    updateEmployee: async (publicId, updates) => {
        set((state) => ({
            pendingEmployeeIds: { ...state.pendingEmployeeIds, [publicId]: true },
            error: null,
        }));

        try {
            const updated = await employeeService.updateEmployee(publicId, updates);
            set((state) => ({
                employees: state.employees.map((e) => (e.publicId === publicId ? updated : e)),
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update employee";
            set({ error: message });
            throw err;
        } finally {
            set((state) => {
                const nextPending = { ...state.pendingEmployeeIds };
                delete nextPending[publicId];
                return { pendingEmployeeIds: nextPending };
            });
        }
    },

    startPolling: () => {
        subscriberCount += 1;
        if (pollingTimer !== null) return;

        void get().refresh();
        pollingTimer = setInterval(() => {
            void get().refresh();
        }, POLL_INTERVAL_MS);
    },

    stopPolling: () => {
        subscriberCount = Math.max(0, subscriberCount - 1);
        if (subscriberCount === 0 && pollingTimer !== null) {
            clearInterval(pollingTimer);
            pollingTimer = null;
        }
    },

    reset: () => {
        subscriberCount = 0;
        if (pollingTimer !== null) {
            clearInterval(pollingTimer);
            pollingTimer = null;
        }
        set({
            employees: [],
            isLoading: true,
            error: null,
            pendingEmployeeIds: {},
        });
    },
}));
