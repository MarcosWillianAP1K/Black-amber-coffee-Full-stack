import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { TableInventory } from "../../components/tableInventory/TableInventory";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import { WidgetInventoryAlerts } from "../../components/WidgetInventoryAlerts";


export function Inventory() {
    const { items, handlers } = useInventoryItems();

    return (
        <div className="w-full h-full gap-6 flex flex-col">
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
