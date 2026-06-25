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
}

export function SectionEmployee({ employees, title, onDeleteEmployee, onBlockEmployee, onViewEmployee }: SectionEmployeeProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortType, setSortType] = useState<"default" | "name-asc" | "name-desc" | "role-asc">("default");
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

        const nameCompare = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });

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
        <div className="w-full h-140 flex flex-col px-4 py-2 gap-4 bg-(--Widget-background) rounded-md">

            {/* header */}
            <div className="w-full flex flex-wrap justify-between items-center gap-3 pb-2 border-b border-(--Border)">

                {/* Title */}
                <h1 className="flex-1 min-w-0 h-fit text-(--Primary-off) text-[24px] font-primary font-bold">
                    {title}
                </h1>

                <div className="flex items-center gap-3">
                    <SearchBar placeholder="Buscar" onChange={setSearchTerm} />
                    <FilterButton
                        title="Filtros de funcionários"
                        buttonLabel="Filtrar"
                        options={filterOptions}
                        align="right"
                    />
                </div>

            </div>

            {/* content */}
            <div className="w-full h-full flex flex-wrap justify-center gap-6 overflow-y-auto">
                {filteredEmployees.map((employee) => (
                    <CardEmployee
                        key={employee.publicId}
                        {...employee}
                        onDeleteEmployee={onDeleteEmployee}
                        onBlockEmployee={onBlockEmployee}
                        onViewEmployee={onViewEmployee}
                    />
                ))}
            </div>

        </div>
    );
}