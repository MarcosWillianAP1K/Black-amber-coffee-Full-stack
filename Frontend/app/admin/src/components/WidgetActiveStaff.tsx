import { useNavigate } from "react-router-dom";
import { CardEmployee } from "./ui/CardEmployee";
import type { Worker } from "shared-utils/types/worker";
import { APP_ROUTES } from "../utils/Path";

export interface WidgetActiveStaffProps {
    employees: Worker[];
    onDeleteEmployee: (publicId: string) => void;
    onBlockEmployee: (publicId: string) => void;
}

export function WidgetActiveStaff({
    employees,
    onDeleteEmployee,
    onBlockEmployee,
}: WidgetActiveStaffProps) {
    const navigate = useNavigate();
    const activeEmployees = employees.filter((employee) => employee.isActive);

    return (
        <div className="w-full max-h-96 bg-(--Widget-background) rounded-lg border border-(--Border) p-5 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--Border)/70 pb-3">
                <div className="min-w-0">
                    <h2 className="text-(--Primary-off) text-lg font-primary font-bold">
                        Equipe Ativa
                    </h2>
                    <p className="text-(--Text-primary-off) text-xs sm:text-sm">
                        Colaboradores ativos no turno
                    </p>
                </div>
                <span className="text-(--Primary) text-xs sm:text-sm font-primary font-bold tabular-nums shrink-0">
                    {activeEmployees.length}{" "}
                    {activeEmployees.length === 1 ? "ativo" : "ativos"}
                </span>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                {activeEmployees.map((employee) => (
                    <CardEmployee
                        key={employee.publicId}
                        {...employee}
                        onDeleteEmployee={onDeleteEmployee}
                        onBlockEmployee={onBlockEmployee}
                        onViewEmployee={(publicId) =>
                            navigate(
                                APP_ROUTES.PERFIL_DETAIL.replace(":kind", "employee").replace(
                                    ":id",
                                    publicId,
                                ),
                                { state: { from: "dashboard" } },
                            )
                        }
                    />
                ))}

                {activeEmployees.length === 0 && (
                    <div className="text-(--Text-primary-off) text-sm py-6 text-center">
                        Nenhum colaborador ativo no momento
                    </div>
                )}
            </div>
        </div>
    );
}
