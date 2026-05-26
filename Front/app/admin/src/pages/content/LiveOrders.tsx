import { useMemo, useState } from "react";
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { FilterButton, type FilterOption } from "ui-shared/components/FilterButton";
import { OverlayOrder } from "../../components/OverlayOrder/OverlayOrder";
import { CardOrder } from "../../components/cardOrder/CardOrder";
import { useOrders } from "../../hooks/useOrders";



export function LiveOrders() {
    const { orders, handleAction, addOrder } = useOrders();
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
            next.sort((a, b) => b.totalAmount - a.totalAmount);
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
                <OverlayOrder onSave={addOrder} />
                <FilterButton
                    title="Filter orders"
                    buttonLabel="Filter orders"
                    options={filterOptions}
                />
            </div>

            {/* Cards */}
            <div className="w-fit h-fit px-12 flex gap-5 flex-wrap justify-start">
                {sortedOrders.map((order) => (
                    <CardOrder
                        key={order.id}
                        order={order}
                        onAction={handleAction}
                    />
                ))}
            </div>

           
        </div>
    );
}
