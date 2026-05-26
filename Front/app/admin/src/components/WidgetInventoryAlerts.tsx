import { TableInventoryHeader } from "./tableInventory/TableInventoryHeader";
import { StatusBadge } from "ui-shared/components/ui/StatusBadge";
import type { StatusColorMap } from "ui-shared/components/ui/StatusBadge";
import { STOCK_STATUSES, UNIT_LABELS } from "shared-utils/types/inventory";
import type { InventoryItem } from "shared-utils/types/inventory";

const INVENTORY_STATUS_COLORS: StatusColorMap = {
    "Low Stock": { bg: "bg-[#FDE68A]", text: "text-[#7C2D12]" },
    "Out of Stock": { bg: "bg-(--Negacion)", text: "text-(--Text-gray)" },
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
                    <TableInventoryHeader title="Inventory Alerts" isLive={false} />
                    <p className="text-(--Text-gray) text-sm">
                        Low and out of stock items
                    </p>
                </div>
                <span className="text-(--Primary) text-sm font-bold">
                    {inventoryAlerts.length} items
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
                        All items are well stocked
                    </div>
                )}
            </div>
        </div>
    );
}
