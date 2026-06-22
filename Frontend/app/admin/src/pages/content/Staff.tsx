import { useState } from "react";
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionCustomers } from "../../components/SectionCustomers";
import { SectionEmployee } from "../../components/SectionEmployee";
import { ErrorState } from "../../components/ui/ErrorState";
import { RegisterWorkerOverlay } from "../../components/RegisterWorkerOverlay";
import { RegisterClientOverlay } from "../../components/RegisterClientOverlay";
import { useCustomers } from "../../hooks/useCustomers";
import { useEmployee } from "../../hooks/useEmployee";
import { APP_ROUTES } from "../../utils/Path";

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-(--Border) ${className ?? ""}`} />;
}

export function Staff() {
    const navigate = useNavigate();
    const { customers, deleteCustomer, isLoading: customersLoading, refresh: refresh} = useCustomers();
    const { employees, deleteEmployee, toggleEmployeeStatus, isLoading: employeesLoading, error: employeesError, refresh: refreshEmployees } = useEmployee();
    const [showRegisterWorker, setShowRegisterWorker] = useState(false);
    const [showRegisterClient, setShowRegisterClient] = useState(false);
    const activeEmployees = employees.filter((employee) => employee.isActive);

    const buildProfilePath = (kind: "customer" | "employee", id: string) =>
        APP_ROUTES.PERFIL_DETAIL.replace(":kind", kind).replace(":id", id);

    const isLoading = employeesLoading || customersLoading;

    if (isLoading) {
        return (
            <div className="w-full h-fit gap-6 flex flex-col">
                <DestakTitle title="Staff" subtitle="Manage your team and staff members" />

                <div className="w-full bg-(--Widget-background) rounded-md border border-(--Border) p-5 flex flex-col gap-4">
                    <Skeleton className="h-5 w-28" />
                    <div className="flex flex-wrap gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="w-56 h-32 bg-(--Page-background) rounded-md border border-(--Border2) p-4 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <div className="flex-1" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (employeesError) {
        return (
            <div className="w-full h-fit gap-6 flex flex-col">
                <DestakTitle title="Staff" subtitle="Manage your team and staff members" />
                <div className="w-full bg-(--Widget-background) rounded-md border border-(--Border) p-5">
                    <ErrorState message={employeesError} onRetry={refreshEmployees} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-fit gap-6 flex flex-col">
            <DestakTitle title="Staff" subtitle="Manage your team and staff members" />

            {/* Registration buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                    onClick={() => setShowRegisterWorker(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-(--Primary) text-(--Text-dark) font-bold text-sm rounded-md hover:bg-(--Primary-selected) transition-all uppercase tracking-wide"
                >
                    <Plus size={16} />
                    Register Worker
                </button>
                <button
                    onClick={() => setShowRegisterClient(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-(--Button-background) text-(--Text-gray) font-secondary font-semibold text-sm rounded-md hover:border-(--Primary) hover:text-(--Primary) transition-all border border-(--Border)"
                >
                    <Plus size={16} />
                    Register Client
                </button>
            </div>

            {/* Main content + Overlay panels */}
            <div className="flex gap-6">
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    <SectionEmployee
                        employees={activeEmployees}
                        title="Working Now"
                        onDeleteEmployee={deleteEmployee}
                        onBlockEmployee={toggleEmployeeStatus}
                        onViewEmployee={(publicId) => navigate(buildProfilePath("employee", publicId), { state: { from: "staff" } })}
                    />

                    <SectionEmployee
                        employees={employees}
                        title="Staff"
                        onDeleteEmployee={deleteEmployee}
                        onBlockEmployee={toggleEmployeeStatus}
                        onViewEmployee={(publicId) => navigate(buildProfilePath("employee", publicId), { state: { from: "staff" } })}
                    />

                    <SectionCustomers
                        customers={customers}
                        title="Customers"
                        onDeleteCustomer={deleteCustomer}
                        onBlockCustomer={(publicId) => console.log("Block customer:", publicId)}
                        onViewCustomer={(publicId) => navigate(buildProfilePath("customer", publicId), { state: { from: "staff" } })}
                    />
                </div>

                {/* Worker registration overlay */}
                {showRegisterWorker && (
                    <RegisterWorkerOverlay
                        onClose={() => setShowRegisterWorker(false)}
                        onSuccess={() => {
                            setShowRegisterWorker(false);
                            refreshEmployees();
                        }}
                    />
                )}

                {/* Client registration overlay */}
                {showRegisterClient && (
                    <RegisterClientOverlay
                        onClose={() => setShowRegisterClient(false)}
                        onSuccess={() => {
                            setShowRegisterClient(false);
                            refresh();
                        }}
                    />
                )}
            </div>
        </div>
    );
}