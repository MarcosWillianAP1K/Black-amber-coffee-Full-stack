import { TableInventoryHeader } from "./tableInventory/TableInventoryHeader";
import { StatusBadge } from "ui-shared/components/ui/StatusBadge";
import { STOCK_STATUSES, UNIT_LABELS } from "shared-utils/types/inventory";
import type { InventoryItem } from "shared-utils/types/inventory";

const INVENTORY_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    "Out of Stock": { bg: "bg-(--Negacion)/15", text: "text-(--Negacion)" },
    "Low Stock":    { bg: "bg-(--Warning)/15",  text: "text-(--Warning)" },
    "In Stock":     { bg: "bg-(--Afirmation)/15", text: "text-(--Afirmation)" },
};

export interface WidgetInventoryAlertsProps {
    items: InventoryItem[];
}

export function WidgetInventoryAlerts({ items }: WidgetInventoryAlertsProps) {
    const inventoryAlerts = items
        .filter((item) => item.status !== "In Stock")
        .sort(
            (a, b) =>
                STOCK_STATUSES.indexOf(b.status) - STOCK_STATUSES.indexOf(a.status)
        );

    return (
        <div className="w-full h-95 bg-(--Widget-background) rounded-md border border-(--Border) p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-(--Border) pb-3">
                <div className="flex flex-col gap-1">
                    <TableInventoryHeader title="Alertas de Estoque" isLive={false} />
                    <p className="text-(--Text-gray) text-sm">
                        Itens com estoque baixo ou zerado
                    </p>
                </div>
                <span className="text-(--Primary) text-sm font-bold">
                    {inventoryAlerts.length} ite(ns)
                </span>
            </div>

            <div className="h-full flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                {inventoryAlerts.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-md bg-(--Page-background) border border-(--Border2)"
                    >
                        <div>
                            <p className="text-(--Primary-off) text-sm font-semibold">
                                {item.name}
                            </p>
                            <p className="text-(--Text-gray) text-xs">
                                {item.code} - {item.amount} {UNIT_LABELS[item.unit]}
                            </p>
                        </div>
                        <StatusBadge status={item.status} colorMap={INVENTORY_STATUS_COLORS} />
                    </div>
                ))}

                {inventoryAlerts.length === 0 && (
                    <div className="text-(--Text-gray) text-sm py-6 text-center">
                        Todos os itens estão bem abastecidos
                    </div>
                )}
            </div>
        </div>
    );
}
