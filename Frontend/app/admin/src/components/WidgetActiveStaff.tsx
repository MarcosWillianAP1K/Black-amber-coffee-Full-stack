import { CardEmployee } from "./ui/CardEmployee";
import type { Worker } from "shared-utils/types/worker";

export interface WidgetActiveStaffProps {
    employees: Worker[];
    onDeleteEmployee: (publicId: string) => void;
    onBlockEmployee: (publicId: string) => void;
}

export function WidgetActiveStaff({ employees, onDeleteEmployee, onBlockEmployee }: WidgetActiveStaffProps) {
    const activeEmployees = employees.filter((employee) => employee.isActive);

    return (
        <div className="w-full h-95 bg-(--Widget-background) rounded-md border border-(--Border) p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-(--Border) pb-3">
                <div>
                    <h2 className="text-(--Primary-off) text-[20px] font-primary font-bold">
                        Equipe Ativa
                    </h2>
                    <p className="text-(--Text-gray) text-sm">
                        Membros da equipe atualmente ativos
                    </p>
                </div>
                <span className="text-(--Primary) text-sm font-bold">
                    {activeEmployees.length} ativo(s)
                </span>
            </div>

            <div className="flex flex-wrap gap-4 items-center flex-1 overflow-y-auto pr-1">
                {activeEmployees.map((employee) => (
                    <div key={employee.publicId} className="w-full sm:w-auto">
                        <CardEmployee
                            {...employee}
                            onDeleteEmployee={onDeleteEmployee}
                            onBlockEmployee={onBlockEmployee}
                            onViewEmployee={(publicId) => console.log("View employee:", publicId)}
                        />
                    </div>
                ))}

                {activeEmployees.length === 0 && (
                    <div className="text-(--Text-gray) text-sm py-6 text-center">
                        Nenhum membro da equipe ativo
                    </div>
                )}
            </div>
        </div>
    );
}
