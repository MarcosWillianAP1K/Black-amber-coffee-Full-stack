import { create } from "zustand";
import type {
    User as Customer,
    UserUpdateInput as CustomerUpdateInput,
} from "shared-utils/types/user";
import * as customerService from "../services/customerService";

const POLL_INTERVAL_MS = 45_000;

export interface CustomerStoreState {
    customers: Customer[];
    isLoading: boolean;
    error: string | null;
    pendingCustomerIds: Record<string, boolean>;
    refresh: () => Promise<void>;
    deleteCustomer: (publicId: string) => Promise<void>;
    toggleCustomerStatus: (publicId: string) => Promise<void>;
    updateCustomer: (publicId: string, updates: Partial<CustomerUpdateInput>) => Promise<void>;
    startPolling: () => void;
    stopPolling: () => void;
    reset: () => void;
}

let pollingTimer: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

export const useCustomerStore = create<CustomerStoreState>((set, get) => ({
    customers: [],
    isLoading: true,
    error: null,
    pendingCustomerIds: {},

    refresh: async () => {
        set({ error: null });
        try {
            const data = await customerService.fetchCustomers();
            set({ customers: data, isLoading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load customers";
            set({ error: message, isLoading: false });
        }
    },

    deleteCustomer: async (publicId) => {
        set((state) => ({
            pendingCustomerIds: { ...state.pendingCustomerIds, [publicId]: true },
            error: null,
        }));

        try {
            await customerService.deleteCustomer(publicId);
            set((state) => ({
                customers: state.customers.filter((c) => c.publicId !== publicId),
            }));
            void get().refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete customer";
            set({ error: message });
            throw err;
        } finally {
            set((state) => {
                const nextPending = { ...state.pendingCustomerIds };
                delete nextPending[publicId];
                return { pendingCustomerIds: nextPending };
            });
        }
    },

    toggleCustomerStatus: async (publicId) => {
        set((state) => ({
            pendingCustomerIds: { ...state.pendingCustomerIds, [publicId]: true },
            error: null,
        }));

        try {
            const updated = await customerService.toggleCustomerStatus(publicId);
            set((state) => ({
                customers: state.customers.map((c) => (c.publicId === publicId ? updated : c)),
            }));
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to toggle customer status";
            set({ error: message });
            throw err;
        } finally {
            set((state) => {
                const nextPending = { ...state.pendingCustomerIds };
                delete nextPending[publicId];
                return { pendingCustomerIds: nextPending };
            });
        }
    },

    updateCustomer: async (publicId, updates) => {
        set((state) => ({
            pendingCustomerIds: { ...state.pendingCustomerIds, [publicId]: true },
            error: null,
        }));

        try {
            const updated = await customerService.updateCustomer(publicId, updates);
            set((state) => ({
                customers: state.customers.map((c) => (c.publicId === publicId ? updated : c)),
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update customer";
            set({ error: message });
            throw err;
        } finally {
            set((state) => {
                const nextPending = { ...state.pendingCustomerIds };
                delete nextPending[publicId];
                return { pendingCustomerIds: nextPending };
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
            customers: [],
            isLoading: true,
            error: null,
            pendingCustomerIds: {},
        });
    },
}));
