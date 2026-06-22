import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { TableInventory } from "../../components/tableInventory/TableInventory";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import { WidgetInventoryAlerts } from "../../components/WidgetInventoryAlerts";
import { ErrorState } from "../../components/ui/ErrorState";

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-(--Border) ${className ?? ""}`} />;
}

export function Inventory() {
    const { items, handlers, isLoading, error: inventoryError, refresh: refreshInventory } = useInventoryItems();

    if (isLoading) {
        return (
            <div className="w-full h-full gap-6 flex flex-col">
                <DestakTitle title="Inventory" subtitle="Manage your stock and supplies" />

                <div className="w-full h-170 p-4 rounded-md bg-(--Widget-background) border border-(--Border) flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-9 w-48" />
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b border-(--Border)">
                                <Skeleton className="h-10 w-10 rounded-md" />
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (inventoryError) {
        return (
            <div className="w-full h-full gap-6 flex flex-col">
                <DestakTitle title="Inventory" subtitle="Manage your stock and supplies" />
                <div className="w-full h-80 p-4 rounded-md bg-(--Widget-background) border border-(--Border)">
                    <ErrorState message={inventoryError} onRetry={refreshInventory} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-fit gap-6 flex flex-col">
            <DestakTitle title="Inventory" subtitle="Manage your stock and supplies" />

            <div className="w-100 h-fit">
                <WidgetInventoryAlerts items={items} />
            </div>

            <TableInventory
                items={items}
                handlers={handlers}
            />
        </div>
    );
}
