import { useMemo, useState } from "react";
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { FilterButton, type FilterOption } from "ui-shared/components/FilterButton";
import { SearchBar } from "ui-shared/components/ui/SearchBar";
import { OverlayOrder } from "../../components/OverlayOrder/OverlayOrder";
import { CardOrder } from "../../components/cardOrder/CardOrder";
import { ErrorState } from "../../components/ui/ErrorState";
import { useOrders } from "../../hooks/useOrders";
import { useMenuItems } from "../../hooks/useMenuItems";
import type { OrderStatus } from "shared-utils/types/order";

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-(--Border)/60 ${className ?? ""}`} />;
}

type StatusTab = "ativos" | OrderStatus;

const STATUS_TABS: ReadonlyArray<{ key: StatusTab; label: string }> = [
    { key: "ativos", label: "Ativos" },
    { key: "criado", label: "Criados" },
    { key: "em_preparo", label: "Em Preparo" },
    { key: "pronto", label: "Prontos" },
    { key: "finalizado", label: "Finalizados" },
    { key: "cancelado", label: "Cancelados" },
];

export function LiveOrders() {
    const {
        orders,
        handleAction,
        addOrder,
        isLoading: ordersLoading,
        error: ordersError,
        refresh: refreshOrders,
    } = useOrders();
    const { items: products } = useMenuItems();

    const [activeTab, setActiveTab] = useState<StatusTab>("ativos");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortType, setSortType] = useState<"created" | "importance" | "value">("created");

    const counts = useMemo(() => {
        const map: Record<StatusTab, number> = {
            ativos: 0,
            criado: 0,
            em_preparo: 0,
            pronto: 0,
            finalizado: 0,
            cancelado: 0,
        };
        for (const order of orders) {
            map[order.status] += 1;
            if (order.status !== "finalizado" && order.status !== "cancelado") {
                map.ativos += 1;
            }
        }
        return map;
    }, [orders]);

    const sortedOrders = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        const filtered = orders.filter((order) => {
            const matchesTab =
                activeTab === "ativos"
                    ? order.status !== "finalizado" && order.status !== "cancelado"
                    : order.status === activeTab;
            if (!matchesTab) return false;

            if (!query) return true;
            return (
                (order.code ?? "").toLowerCase().includes(query) ||
                String(order.id).includes(query) ||
                (order.observation ?? "").toLowerCase().includes(query) ||
                order.itens.some((i) => i.name.toLowerCase().includes(query))
            );
        });

        const next = [...filtered];

        if (sortType === "created") {
            next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            return next;
        }

        if (sortType === "importance") {
            const priority: Record<string, number> = {
                em_preparo: 0,
                criado: 1,
                pronto: 2,
                finalizado: 3,
                cancelado: 4,
            };
            next.sort((a, b) => (priority[a.status] ?? 99) - (priority[b.status] ?? 99));
            return next;
        }

        if (sortType === "value") {
            next.sort((a, b) => b.totalPrice - a.totalPrice);
            return next;
        }

        return next;
    }, [orders, activeTab, searchTerm, sortType]);

    const filterOptions: FilterOption[] = [
        {
            label: "Ordem de chegada",
            action: () => setSortType("created"),
            active: sortType === "created",
        },
        {
            label: "Prioridade de preparo",
            action: () => setSortType("importance"),
            active: sortType === "importance",
        },
        {
            label: "Maior valor primeiro",
            action: () => setSortType("value"),
            active: sortType === "value",
        },
    ];

    return (
        <div className="w-full flex flex-col gap-5 pb-8">
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DestakTitle
                    title="Fila de Pedidos (KDS)"
                    subtitle="Acompanhe os tempos de espera e avance os pedidos da bancada"
                />
                <OverlayOrder onSave={addOrder} products={products} />
            </div>

            <div className="w-full flex items-center justify-between gap-3">
                <SearchBar
                    placeholder="Buscar código, item ou obs..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                    className="flex-1 sm:flex-initial sm:w-80 md:w-96"
                />
                <FilterButton
                    title="Ordenar pedidos"
                    buttonLabel="Ordenar"
                    options={filterOptions}
                    align="right"
                />
            </div>

            {/* Abas de Status */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
                {STATUS_TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`min-h-9 px-3.5 py-1.5 rounded-lg text-xs font-primary font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                                isActive
                                    ? "bg-(--Primary) text-(--Text-dark)"
                                    : "bg-(--Widget-background) border border-(--Border)/60 text-(--Text-primary-off) hover:text-(--Text-primary)"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[10px] tabular-nums ${
                                    isActive
                                        ? "bg-black/20 text-(--Text-dark)"
                                        : "bg-(--Button-background) text-(--Text-primary)"
                                }`}
                            >
                                {counts[tab.key]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Grade KDS de Pedidos */}
            {ordersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-48 bg-(--Widget-background) rounded-xl border border-(--Border) p-4 flex flex-col gap-3"
                        >
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-20" />
                            <div className="flex-1" />
                            <Skeleton className="h-9 w-full" />
                        </div>
                    ))}
                </div>
            ) : ordersError ? (
                <ErrorState message={ordersError} onRetry={refreshOrders} />
            ) : sortedOrders.length === 0 ? (
                <div className="rounded-xl border border-(--Border)/50 bg-(--Widget-background) py-14 px-6 text-center text-(--Text-primary-off) text-sm font-secondary">
                    Nenhum pedido nesta visualização no momento.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-stretch">
                    {sortedOrders.map((order) => (
                        <CardOrder key={order.id} order={order} onAction={handleAction} />
                    ))}
                </div>
            )}
        </div>
    );
}
