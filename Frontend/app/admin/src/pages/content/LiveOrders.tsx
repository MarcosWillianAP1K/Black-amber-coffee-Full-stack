import { useMemo, useState } from "react";
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { FilterButton, type FilterOption } from "ui-shared/components/FilterButton";import { OverlayOrder } from "../../components/OverlayOrder/OverlayOrder";
import { CardOrder } from "../../components/cardOrder/CardOrder";
import { ErrorState } from "../../components/ui/ErrorState";
import { useOrders } from "../../hooks/useOrders";
import { useMenuItems } from "../../hooks/useMenuItems";




function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-(--Border) ${className ?? ""}`} />;
}

export function LiveOrders() {
    const { orders, handleAction, addOrder, isLoading: ordersLoading, error: ordersError, refresh: refreshOrders } = useOrders();
    const { items: products } = useMenuItems();
    const [sortType, setSortType] = useState<"created" | "importance" | "value">("created");

    const sortedOrders = useMemo(() => {
        if (sortType === "created") {
            return orders;
        }

        const next = [...orders];

        if (sortType === "importance") {
            const priority: Record<string, number> = {
                "LATE": 0,
                "IN PROGRESS": 1,
                "PENDING": 2,
                "COMPLETED": 3,
                "CANCELLED": 4,
            };

            next.sort((a, b) => {
                const rankA = priority[a.status] ?? 99;
                const rankB = priority[b.status] ?? 99;
                return rankA - rankB;
            });
            return next;
        }

        if (sortType === "value") {
            next.sort((a, b) => b.totalPrice - a.totalPrice);
            return next;
        }

        return next;
    }, [orders, sortType]);

    const filterOptions: FilterOption[] = [
        {
            label: "Ordem criados",
            action: () => setSortType("created"),
            active: sortType === "created",
        },
        {
            label: "Ordem de importancia",
            action: () => setSortType("importance"),
            active: sortType === "importance",
        },
        {
            label: "Ordem de valor do pedido",
            action: () => setSortType("value"),
            active: sortType === "value",
        },
    ];

    return (
        <div className="w-full h-fit gap-6 flex flex-col">

            <DestakTitle title="Orders Queue" subtitle="Manage your live orders" />

        
            <div className="w-full flex flex-wrap items-center justify-end gap-4">
                <OverlayOrder onSave={addOrder} products={products} />
                <FilterButton
                    title="Filter orders"
                    buttonLabel="Filter orders"
                    options={filterOptions}
                />
            </div>

            {/* Cards */}
            <div className="w-fit h-fit px-12 flex gap-5 flex-wrap justify-start">
                {ordersLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="w-72 h-44 bg-(--Widget-background) rounded-md border border-(--Border) p-4 flex flex-col gap-3">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-20" />
                            <div className="flex-1" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ))
                ) : ordersError ? (
                    <div className="w-full">
                        <ErrorState message={ordersError} onRetry={refreshOrders} />
                    </div>
                ) : sortedOrders.length === 0 ? (
                    <div className="w-full flex items-center justify-center py-16 text-(--Text-gray)">
                        No orders yet
                    </div>
                ) : (
                    sortedOrders.map((order) => (
                        <CardOrder
                            key={order.id}
                            order={order}
                            onAction={handleAction}
                        />
                    ))
                )}
            </div>

           
        </div>
    );
}
