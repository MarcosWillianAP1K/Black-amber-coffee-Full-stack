import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { TableMenu } from "../../components/tableMenu/TableMenu";
import { useMenuItems } from "../../hooks/useMenuItems";


export function Menu() {
    const { items, handlers } = useMenuItems();

    return (
        <div className="w-full h-full gap-6 flex flex-col">
            <DestakTitle title="Menu" subtitle="Manage your coffee menu" />

            <TableMenu
                items={items}
                handlers={handlers}
            />
        </div>
    );
}
