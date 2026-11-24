import { useEmployeeStore } from "../stores/useEmployeeStore";
import type { Worker, WorkerUpdateInput } from "shared-utils/types/worker";

interface UseEmployeeReturn {
    employees: Worker[];
    isLoading: boolean;
    error: string | null;
    canBlockEmployees: boolean;
    pendingEmployeeIds: Record<string, boolean>;
    refresh: () => Promise<void>;
    deleteEmployee: (publicId: string) => Promise<void>;
    toggleEmployeeStatus: (publicId: string) => Promise<void>;
    updateEmployee: (publicId: string, updates: Partial<WorkerUpdateInput>) => Promise<void>;
}

export function useEmployee(): UseEmployeeReturn {
    const employees = useEmployeeStore((s) => s.employees);
    const isLoading = useEmployeeStore((s) => s.isLoading);
    const error = useEmployeeStore((s) => s.error);
    const canBlockEmployees = useEmployeeStore((s) => s.canBlockEmployees);
    const pendingEmployeeIds = useEmployeeStore((s) => s.pendingEmployeeIds);
    const refresh = useEmployeeStore((s) => s.refresh);
    const deleteEmployee = useEmployeeStore((s) => s.deleteEmployee);
    const toggleEmployeeStatus = useEmployeeStore((s) => s.toggleEmployeeStatus);
    const updateEmployee = useEmployeeStore((s) => s.updateEmployee);

    return {
        employees,
        isLoading,
        error,
        canBlockEmployees,
        pendingEmployeeIds,
        refresh,
        deleteEmployee,
        toggleEmployeeStatus,
        updateEmployee,
    };
}
