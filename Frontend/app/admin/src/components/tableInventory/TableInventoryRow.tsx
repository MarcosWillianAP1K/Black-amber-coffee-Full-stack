import { Pencil, Trash2 } from "lucide-react";
import {
    STOCK_STATUS_LABELS,
    UNIT_LABELS,
    type InventoryItem,
} from "shared-utils/types/inventory";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    "In Stock": { bg: "bg-(--Afirmation)/20", text: "text-(--Success-text)" },
    "Low Stock": { bg: "bg-(--Warning)/20", text: "text-(--Warning-text)" },
    "Out of Stock": { bg: "bg-(--Danger-bg)", text: "text-(--Danger-text)" },
};

interface TableInventoryRowProps {
    item: InventoryItem;
    isSelected?: boolean;
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
}

export function TableInventoryRow({
    item,
    isSelected = false,
    onEdit,
    onDelete,
}: TableInventoryRowProps) {
    const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES["Out of Stock"];

    return (
        <tr
            className={`border-b border-(--Border)/30 transition-colors duration-200 ${
                isSelected ? "bg-(--Select-background)" : "hover:bg-(--Select-background)/70"
            }`}
        >
            <td className="py-3 pr-4">
                <div className="flex flex-col min-w-0">
                    <span className="text-(--Text-primary) text-sm font-primary font-bold truncate">
                        {item.name}
                    </span>
                    <span className="text-(--Text-primary-off) text-xs font-secondary truncate">
                        #{item.code}
                    </span>
                </div>
            </td>

            <td className="py-3 px-4">
                <span className="text-(--Text-primary) text-sm font-secondary tabular-nums">
                    {item.amount}{" "}
                    <span className="text-(--Text-primary-off)">{UNIT_LABELS[item.unit]}</span>
                </span>
            </td>

            <td className="py-3 px-4">
                <span
                    className={`inline-flex h-6 px-3 rounded-full items-center justify-center text-[11px] font-secondary font-bold whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}
                >
                    {STOCK_STATUS_LABELS[item.status]}
                </span>
            </td>

            <td className="py-3 pl-4">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-md text-(--Text-primary-off) hover:text-(--Primary) hover:bg-(--Button-background) transition-all duration-200 cursor-pointer"
                        aria-label={`Editar ${item.name}`}
                        title="Editar insumo"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="p-2 rounded-md text-(--Text-primary-off) hover:text-(--Danger-text) hover:bg-(--Danger-bg) transition-all duration-200 cursor-pointer"
                        aria-label={`Excluir ${item.name}`}
                        title="Excluir insumo"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
