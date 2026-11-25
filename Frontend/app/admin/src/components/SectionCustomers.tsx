import { useMemo, useState } from "react";
import { CardCustomer } from "./ui/CardCustomer";
import { SearchBar } from "ui-shared/components/ui/SearchBar";
import { FilterButton, type FilterOption } from "ui-shared/components/FilterButton";
import type { User as Customer } from "shared-utils/types/user";

export interface SectionCustomersProps {
    customers: Customer[];
    title: string;
    onDeleteCustomer: (publicId: string) => Promise<void> | void;
    onBlockCustomer: (publicId: string) => Promise<void> | void;
    onViewCustomer: (publicId: string) => void;
    pendingCustomerIds?: Record<string, boolean>;
}

export function SectionCustomers({
    customers,
    title,
    onDeleteCustomer,
    onBlockCustomer,
    onViewCustomer,
    pendingCustomerIds,
}: SectionCustomersProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortType, setSortType] = useState<
        "default" | "name-asc" | "name-desc" | "newest" | "oldest"
    >("default");

    const filteredCustomers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        let next = [...customers];

        if (query) {
            next = next.filter((customer) => {
                const values = [customer.fullName ?? "", customer.email ?? ""];
                return values.some((value) => value.toLowerCase().includes(query));
            });
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
            case "newest":
                next.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                );
                break;
            case "oldest":
                next.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                );
                break;
            default:
                break;
        }

        return next;
    }, [customers, searchTerm, sortType]);

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
            label: "Mais recentes",
            action: () => setSortType("newest"),
            active: sortType === "newest",
        },
        {
            label: "Mais antigos",
            action: () => setSortType("oldest"),
            active: sortType === "oldest",
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
                        {filteredCustomers.length}
                    </span>
                </div>

                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3">
                    <SearchBar
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="flex-1 md:flex-initial md:w-72 lg:w-80"
                    />
                    <FilterButton
                        title="Filtros de clientes"
                        buttonLabel="Filtrar"
                        options={filterOptions}
                        align="right"
                    />
                </div>
            </div>

            {filteredCustomers.length === 0 ? (
                <p className="text-sm font-secondary text-(--Text-primary-off) py-6 text-center">
                    Nenhum cliente encontrado.
                </p>
            ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 max-h-[520px] overflow-y-auto pr-1">
                    {filteredCustomers.map((customer) => (
                        <CardCustomer
                            key={customer.publicId}
                            {...customer}
                            onDeleteCustomer={onDeleteCustomer}
                            onBlockCustomer={onBlockCustomer}
                            onViewCustomer={onViewCustomer}
                            isPending={Boolean(pendingCustomerIds?.[customer.publicId])}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
