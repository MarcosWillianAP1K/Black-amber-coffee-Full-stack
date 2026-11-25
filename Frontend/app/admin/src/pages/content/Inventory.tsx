import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { TableInventory } from "../../components/tableInventory/TableInventory";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import { WidgetInventoryAlerts } from "../../components/WidgetInventoryAlerts";
import { ErrorState } from "../../components/ui/ErrorState";

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-(--Border)/60 ${className ?? ""}`} />;
}

export function Inventory() {
    const {
        items,
        handlers,
        isLoading,
        error: inventoryError,
        refresh: refreshInventory,
    } = useInventoryItems();

    if (isLoading) {
        return (
            <div className="w-full flex flex-col gap-6 pb-8">
                <DestakTitle title="Estoque" subtitle="Gerencie insumos, saldos e alertas de reposição" />

                <div className="w-full p-5 rounded-lg bg-(--Widget-background) border border-(--Border) flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-9 w-48" />
                    </div>
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b border-(--Border)/50">
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
            <div className="w-full flex flex-col gap-6 pb-8">
                <DestakTitle title="Estoque" subtitle="Gerencie insumos, saldos e alertas de reposição" />
                <div className="w-full p-5 rounded-lg bg-(--Widget-background) border border-(--Border)">
                    <ErrorState message={inventoryError} onRetry={refreshInventory} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6 pb-8">
            <DestakTitle title="Estoque" subtitle="Gerencie insumos, saldos e alertas de reposição" />

            <div className="w-full max-w-2xl">
                <WidgetInventoryAlerts items={items} />
            </div>

            <TableInventory items={items} handlers={handlers} />
        </div>
    );
}
