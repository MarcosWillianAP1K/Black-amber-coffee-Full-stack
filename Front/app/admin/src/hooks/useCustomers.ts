/**
 * useCustomers — Custom hook encapsulating customer state and operations.
 *
 * Provides customers list and handlers ready to plug into SectionCustomers.
 * Uses customerService internally — when API is ready, only the service changes.
 */

import { useState, useCallback, useEffect } from "react";
import type { User as Customer } from "shared-utils/types/user";
import * as customerService from "../services/customerService";

interface UseCustomersReturn {
    customers: Customer[];
    isLoading: boolean;
    handleOptions: (publicId: string) => void;
    deleteCustomer: (publicId: string) => void;
}

export function useCustomers(): UseCustomersReturn {
    const [customers, setCustomers] = useState<Customer[]>(() => {
        const stored = localStorage.getItem("customers");
        return stored ? JSON.parse(stored) : [];
    });
    const [isLoading, setIsLoading] = useState(() => !localStorage.getItem("customers"));

    // Initial fetch
    useEffect(() => {
        let cancelled = false;

        if (!localStorage.getItem("customers")) {
            customerService.fetchCustomers().then((data) => {
                if (!cancelled) {
                    setCustomers(data);
                    localStorage.setItem("customers", JSON.stringify(data));
                    setIsLoading(false);
                }
            });
        }

        return () => { cancelled = true; };
    }, []);

    const handleOptions = useCallback((publicId: string) => {
        // TODO: Open a dropdown/modal with options (edit, ban, delete, etc.)
        console.log("Options for customer:", publicId);
    }, []);

    const deleteCustomer = useCallback(async (publicId: string) => {
        await customerService.deleteCustomer(publicId);
        setCustomers((prev) => {
            const next = prev.filter((customer) => customer.publicId !== publicId);
            localStorage.setItem("customers", JSON.stringify(next));
            return next;
        });
    }, []);

    return {
        customers,
        isLoading,
        handleOptions,
        deleteCustomer,
    };
}
