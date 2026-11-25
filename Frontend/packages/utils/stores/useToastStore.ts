import { create } from "zustand";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
    id: string;
    title: string;
    description?: string;
    variant: ToastVariant;
}

interface ToastInput {
    title: string;
    description?: string;
    variant?: ToastVariant;
    durationMs?: number;
}

interface ToastStoreState {
    toasts: ToastItem[];
    showToast: (input: ToastInput) => string;
    dismissToast: (id: string) => void;
    clearToasts: () => void;
}

const DEFAULT_DURATION_MS = 4200;

export const useToastStore = create<ToastStoreState>((set) => ({
    toasts: [],

    showToast: ({ title, description, variant = "info", durationMs = DEFAULT_DURATION_MS }) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        set((state) => ({
            toasts: [...state.toasts.slice(-3), { id, title, description, variant }],
        }));

        if (typeof window !== "undefined" && durationMs > 0) {
            window.setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, durationMs);
        }

        return id;
    },

    dismissToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),

    clearToasts: () => set({ toasts: [] }),
}));
