/**
 * useEmployee — Consumes the shared EmployeeContext.
 */

import { useEmployeeContext } from "../context/EmployeeContext";

interface UseEmployeeReturn {
    employees: ReturnType<typeof useEmployeeContext>["employees"];
    isLoading: ReturnType<typeof useEmployeeContext>["isLoading"];
    error: ReturnType<typeof useEmployeeContext>["error"];
    refresh: ReturnType<typeof useEmployeeContext>["refresh"];
    deleteEmployee: (publicId: string) => Promise<void>;
    toggleEmployeeStatus: (publicId: string) => Promise<void>;
}

export function useEmployee(): UseEmployeeReturn {
    const { employees, isLoading, error, refresh, deleteEmployee, toggleEmployeeStatus } = useEmployeeContext();

    return {
        employees,
        isLoading,
        error,
        refresh,
        deleteEmployee,
        toggleEmployeeStatus,
    };
}
