import { useCallback } from "react";
import { useCustomerStore } from "../stores/useCustomerStore";
import type {
    User as Customer,
    UserUpdateInput as CustomerUpdateInput,
} from "shared-utils/types/user";

interface UseCustomersReturn {
    customers: Customer[];
    isLoading: boolean;
    error: string | null;
    pendingCustomerIds: Record<string, boolean>;
    refresh: () => Promise<void>;
    deleteCustomer: (publicId: string) => Promise<void>;
    toggleCustomerStatus: (publicId: string) => Promise<void>;
    updateCustomer: (publicId: string, updates: Partial<CustomerUpdateInput>) => Promise<void>;
    handleOptions: (publicId: string) => void;
}

export function useCustomers(): UseCustomersReturn {
    const customers = useCustomerStore((s) => s.customers);
    const isLoading = useCustomerStore((s) => s.isLoading);
    const error = useCustomerStore((s) => s.error);
    const pendingCustomerIds = useCustomerStore((s) => s.pendingCustomerIds);
    const refresh = useCustomerStore((s) => s.refresh);
    const deleteCustomer = useCustomerStore((s) => s.deleteCustomer);
    const toggleCustomerStatus = useCustomerStore((s) => s.toggleCustomerStatus);
    const updateCustomer = useCustomerStore((s) => s.updateCustomer);

    const handleOptions = useCallback(
        (publicId: string) => {
            void toggleCustomerStatus(publicId);
        },
        [toggleCustomerStatus],
    );

    return {
        customers,
        isLoading,
        error,
        pendingCustomerIds,
        refresh,
        deleteCustomer,
        toggleCustomerStatus,
        updateCustomer,
        handleOptions,
    };
}
