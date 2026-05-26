/**
 * useEmployee — Custom hook encapsulating employee/staff state and operations.
 *
 * Provides employees list and handlers ready to plug into SectionEmployee.
 * Uses employeeService internally — when API is ready, only the service changes.
 */

import { useState, useCallback, useEffect } from "react";
import type { Worker } from "shared-utils/types/worker";
import * as employeeService from "../services/employeeService";

interface UseEmployeeReturn {
    employees: Worker[];
    isLoading: boolean;
    deleteEmployee: (publicId: string) => void;
    toggleEmployeeStatus: (publicId: string) => void;
}

export function useEmployee(): UseEmployeeReturn {
    const [employees, setEmployees] = useState<Worker[]>(() => {
        const stored = localStorage.getItem("employees");
        return stored ? JSON.parse(stored) : [];
    });
    const [isLoading, setIsLoading] = useState(() => !localStorage.getItem("employees"));

    // Initial fetch
    useEffect(() => {
        let cancelled = false;

        if (!localStorage.getItem("employees")) {
            employeeService.fetchEmployees().then((data) => {
                if (!cancelled) {
                    setEmployees(data);
                    localStorage.setItem("employees", JSON.stringify(data));
                    setIsLoading(false);
                }
            });
        }

        return () => { cancelled = true; };
    }, []);

    const deleteEmployee = useCallback(async (publicId: string) => {
        await employeeService.deleteEmployee(publicId);
        setEmployees((prev) => {
            const next = prev.filter((e) => e.publicId !== publicId);
            localStorage.setItem("employees", JSON.stringify(next));
            return next;
        });
    }, []);

    const toggleEmployeeStatus = useCallback(async (publicId: string) => {
        const updated = await employeeService.toggleEmployeeStatus(publicId);
        setEmployees((prev) => {
            const next = prev.map((e) => (e.publicId === publicId ? updated : e));
            localStorage.setItem("employees", JSON.stringify(next));
            return next;
        });
    }, []);

    return {
        employees,
        isLoading,
        deleteEmployee,
        toggleEmployeeStatus,
    };
}
