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
    return <div className={`animate-pulse rounded-md bg-(--Border)/60 ${className ?? ""}`} />;
}

export function Staff() {
    const navigate = useNavigate();
    const {
        customers,
        deleteCustomer,
        toggleCustomerStatus,
        pendingCustomerIds,
        isLoading: customersLoading,
        refresh: refreshCustomers,
    } = useCustomers();
    const {
        employees,
        deleteEmployee,
        toggleEmployeeStatus,
        pendingEmployeeIds,
        isLoading: employeesLoading,
        error: employeesError,
        refresh: refreshEmployees,
    } = useEmployee();

    const [showRegisterWorker, setShowRegisterWorker] = useState(false);
    const [showRegisterClient, setShowRegisterClient] = useState(false);
    const activeEmployees = employees.filter((employee) => employee.isActive);

    const buildProfilePath = (kind: "customer" | "employee", id: string) =>
        APP_ROUTES.PERFIL_DETAIL.replace(":kind", kind).replace(":id", id);

    const isLoading = employeesLoading || customersLoading;

    if (isLoading) {
        return (
            <div className="w-full flex flex-col gap-6 pb-8">
                <DestakTitle title="Equipe e Clientes" subtitle="Gerencie colaboradores e contas de clientes" />
                <div className="w-full bg-(--Widget-background) rounded-lg border border-(--Border) p-5 flex flex-col gap-4">
                    <Skeleton className="h-5 w-32" />
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-32 bg-(--Page-background) rounded-lg border border-(--Border)/60 p-4 flex flex-col gap-3"
                            >
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-12 h-12 rounded-lg" />
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <div className="flex-1" />
                                <Skeleton className="h-6 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (employeesError) {
        return (
            <div className="w-full flex flex-col gap-6 pb-8">
                <DestakTitle title="Equipe e Clientes" subtitle="Gerencie colaboradores e contas de clientes" />
                <div className="w-full bg-(--Widget-background) rounded-lg border border-(--Border) p-5">
                    <ErrorState message={employeesError} onRetry={refreshEmployees} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6 pb-8">
            <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <DestakTitle title="Equipe e Clientes" subtitle="Gerencie colaboradores e contas de clientes" />

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowRegisterWorker(true)}
                        className="min-h-10 flex items-center gap-2 px-4 py-2 bg-(--Primary) text-(--Text-dark) font-primary font-extrabold text-xs rounded-lg hover:bg-(--Primary-selected) transition-colors uppercase tracking-wider cursor-pointer"
                    >
                        <Plus size={15} />
                        Cadastrar Funcionário
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowRegisterClient(true)}
                        className="min-h-10 flex items-center gap-2 px-4 py-2 bg-(--Button-background) text-(--Text-primary) font-primary font-bold text-xs rounded-lg hover:border-(--Primary) hover:text-(--Primary) transition-colors border border-(--Border) uppercase tracking-wider cursor-pointer"
                    >
                        <Plus size={15} />
                        Cadastrar Cliente
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <SectionEmployee
                    employees={activeEmployees}
                    title="Trabalhando Agora"
                    onDeleteEmployee={deleteEmployee}
                    onBlockEmployee={toggleEmployeeStatus}
                    onViewEmployee={(publicId) =>
                        navigate(buildProfilePath("employee", publicId), { state: { from: "staff" } })
                    }
                    pendingEmployeeIds={pendingEmployeeIds}
                />

                <SectionEmployee
                    employees={employees}
                    title="Todos os Funcionários"
                    onDeleteEmployee={deleteEmployee}
                    onBlockEmployee={toggleEmployeeStatus}
                    onViewEmployee={(publicId) =>
                        navigate(buildProfilePath("employee", publicId), { state: { from: "staff" } })
                    }
                    pendingEmployeeIds={pendingEmployeeIds}
                />

                <SectionCustomers
                    customers={customers}
                    title="Clientes Cadastrados"
                    onDeleteCustomer={deleteCustomer}
                    onBlockCustomer={toggleCustomerStatus}
                    onViewCustomer={(publicId) =>
                        navigate(buildProfilePath("customer", publicId), { state: { from: "staff" } })
                    }
                    pendingCustomerIds={pendingCustomerIds}
                />
            </div>

            {showRegisterWorker && (
                <RegisterWorkerOverlay
                    onClose={() => setShowRegisterWorker(false)}
                    onSuccess={() => {
                        setShowRegisterWorker(false);
                        void refreshEmployees();
                    }}
                />
            )}

            {showRegisterClient && (
                <RegisterClientOverlay
                    onClose={() => setShowRegisterClient(false)}
                    onSuccess={() => {
                        setShowRegisterClient(false);
                        void refreshCustomers();
                    }}
                />
            )}
        </div>
    );
}
