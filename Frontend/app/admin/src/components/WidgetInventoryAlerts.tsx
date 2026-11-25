import { TableInventoryHeader } from "./tableInventory/TableInventoryHeader";
import { StatusBadge } from "ui-shared/components/ui/StatusBadge";
import {
    STOCK_STATUSES,
    STOCK_STATUS_LABELS,
    UNIT_LABELS,
} from "shared-utils/types/inventory";
import type { InventoryItem } from "shared-utils/types/inventory";

const INVENTORY_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    "Out of Stock": { bg: "bg-(--Danger-bg)", text: "text-(--Danger-text)" },
    "Low Stock": { bg: "bg-(--Warning)/20", text: "text-(--Warning-text)" },
    "In Stock": { bg: "bg-(--Afirmation)/20", text: "text-(--Success-text)" },
};

export interface WidgetInventoryAlertsProps {
    items: InventoryItem[];
}

export function WidgetInventoryAlerts({ items }: WidgetInventoryAlertsProps) {
    const inventoryAlerts = items
        .filter((item) => item.status !== "In Stock")
        .sort(
            (a, b) =>
                STOCK_STATUSES.indexOf(b.status) - STOCK_STATUSES.indexOf(a.status),
        );

    return (
        <div className="w-full max-h-96 bg-(--Widget-background) rounded-lg border border-(--Border) p-5 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--Border)/70 pb-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                    <TableInventoryHeader title="Alertas de Estoque" isLive={false} />
                    <p className="text-(--Text-primary-off) text-xs sm:text-sm">
                        Insumos com estoque baixo ou zerado
                    </p>
                </div>
                <span className="text-(--Primary) text-xs sm:text-sm font-primary font-bold tabular-nums shrink-0">
                    {inventoryAlerts.length}{" "}
                    {inventoryAlerts.length === 1 ? "item" : "itens"}
                </span>
            </div>

            <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
                {inventoryAlerts.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-(--Page-background) border border-(--Border)/60"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-(--Text-primary) text-sm font-primary font-semibold truncate">
                                {item.name}
                            </p>
                            <p className="text-(--Text-primary-off) text-xs font-secondary tabular-nums">
                                {item.code} • {item.amount} {UNIT_LABELS[item.unit]}
                            </p>
                        </div>
                        <StatusBadge status={item.status} colorMap={INVENTORY_STATUS_COLORS}>
                            {STOCK_STATUS_LABELS[item.status]}
                        </StatusBadge>
                    </div>
                ))}

                {inventoryAlerts.length === 0 && (
                    <div className="text-(--Text-primary-off) text-sm py-6 text-center">
                        Todos os insumos estão em níveis adequados
                    </div>
                )}
            </div>
        </div>
    );
}
