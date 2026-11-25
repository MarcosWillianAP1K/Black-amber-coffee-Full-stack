import { useMemo, useState } from "react";
import { CardEmployee } from "./ui/CardEmployee";
import { SearchBar } from "ui-shared/components/ui/SearchBar";
import { FilterButton, type FilterOption } from "ui-shared/components/FilterButton";
import type { Worker } from "shared-utils/types/worker";

export interface SectionEmployeeProps {
    employees: Worker[];
    title: string;
    onDeleteEmployee: (publicId: string) => void;
    onBlockEmployee: (publicId: string) => void;
    onViewEmployee: (publicId: string) => void;
    pendingEmployeeIds?: Record<string, boolean>;
}

export function SectionEmployee({
    employees,
    title,
    onDeleteEmployee,
    onBlockEmployee,
    onViewEmployee,
    pendingEmployeeIds,
}: SectionEmployeeProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortType, setSortType] = useState<"default" | "name-asc" | "name-desc" | "role-asc">(
        "default",
    );
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    const filteredEmployees = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        let next = [...employees];

        if (query) {
            next = next.filter((employee) => {
                const values = [employee.fullName, employee.email, employee.role];
                return values.some((value) => value.toLowerCase().includes(query));
            });
        }

        if (statusFilter === "active") {
            next = next.filter((employee) => employee.isActive);
        }

        if (statusFilter === "inactive") {
            next = next.filter((employee) => !employee.isActive);
        }

        const nameCompare = (a: string, b: string) =>
            a.localeCompare(b, undefined, { sensitivity: "base" });

        switch (sortType) {
            case "name-asc":
                next.sort((a, b) => nameCompare(a.fullName, b.fullName));
                break;
            case "name-desc":
                next.sort((a, b) => nameCompare(b.fullName, a.fullName));
                break;
            case "role-asc":
                next.sort((a, b) => nameCompare(a.role, b.role));
                break;
            default:
                break;
        }

        return next;
    }, [employees, searchTerm, sortType, statusFilter]);

    const filterOptions: FilterOption[] = [
        {
            label: "Ordem padrão",
            action: () => setSortType("default"),
            active: sortType === "default",
        },
        {
            label: "Nome (A-Z)",
            action: () => setSortType("name-asc"),
            active: sortType === "name-asc",
        },
        {
            label: "Nome (Z-A)",
            action: () => setSortType("name-desc"),
            active: sortType === "name-desc",
        },
        {
            label: "Cargo (A-Z)",
            action: () => setSortType("role-asc"),
            active: sortType === "role-asc",
        },
        {
            label: "Todos os status",
            action: () => setStatusFilter("all"),
            active: statusFilter === "all",
        },
        {
            label: "Somente ativos",
            action: () => setStatusFilter("active"),
            active: statusFilter === "active",
        },
        {
            label: "Somente inativos",
            action: () => setStatusFilter("inactive"),
            active: statusFilter === "inactive",
        },
    ];

    return (
        <section className="w-full flex flex-col p-5 gap-5 bg-(--Widget-background) rounded-lg border border-(--Border)">
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-(--Border)/70">
                <div className="flex items-center gap-2.5 min-w-0">
                    <h2 className="text-(--Primary-off) text-lg sm:text-xl font-primary font-bold truncate">
                        {title}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-(--Button-background) text-xs font-secondary text-(--Text-primary) tabular-nums">
                        {filteredEmployees.length}
                    </span>
                </div>

                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3">
                    <SearchBar
                        placeholder="Buscar colaborador..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="flex-1 md:flex-initial md:w-72 lg:w-80"
                    />
                    <FilterButton
                        title="Filtros de funcionários"
                        buttonLabel="Filtrar"
                        options={filterOptions}
                        align="right"
                    />
                </div>
            </div>

            {filteredEmployees.length === 0 ? (
                <p className="text-sm font-secondary text-(--Text-primary-off) py-6 text-center">
                    Nenhum colaborador encontrado para o filtro aplicado.
                </p>
            ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 max-h-[520px] overflow-y-auto pr-1">
                    {filteredEmployees.map((employee) => (
                        <CardEmployee
                            key={employee.publicId}
                            {...employee}
                            onDeleteEmployee={onDeleteEmployee}
                            onBlockEmployee={onBlockEmployee}
                            onViewEmployee={onViewEmployee}
                            isPending={Boolean(pendingEmployeeIds?.[employee.publicId])}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
