/**
 * useCustomers — Custom hook encapsulating customer state and operations.
 *
 * Provides customers list and handlers ready to plug into SectionCustomers.
 * Now delegates completely to CustomerContext instead of localStorage.
 */

import { useCallback } from "react";
import { useCustomerContext } from "../context/CustomerContext";

interface UseCustomersReturn {
    customers: ReturnType<typeof useCustomerContext>["customers"];
    isLoading: ReturnType<typeof useCustomerContext>["isLoading"];
    error: ReturnType<typeof useCustomerContext>["error"];
    refresh: ReturnType<typeof useCustomerContext>["refresh"];
    handleOptions: (publicId: string) => void;
    deleteCustomer: ReturnType<typeof useCustomerContext>["deleteCustomer"];
}

export function useCustomers(): UseCustomersReturn {
    const { customers, isLoading, error, refresh, deleteCustomer } = useCustomerContext();

    const handleOptions = useCallback((publicId: string) => {
        // TODO: Open a dropdown/modal with options (edit, ban, delete, etc.)
        console.log("Options for customer:", publicId);
    }, []);

    return {
        customers,
        isLoading,
        error,
        refresh,
        handleOptions,
        deleteCustomer,
    };
}
