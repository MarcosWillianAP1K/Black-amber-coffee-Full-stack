/**
 * TableInventoryRow — A single row in the inventory table.
 * Displays item name/code, amount with unit, stock status badge, and action buttons.
 */

import { Pencil, Trash2 } from "lucide-react";
import type { InventoryItem } from "shared-utils/types/inventory";
import { UNIT_LABELS } from "shared-utils/types/inventory";

/** Color map for stock status badges */
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    "In Stock": { bg: "bg-[#1a3a2a]", text: "text-[#4ade80]" },
    "Low Stock": { bg: "bg-[#3a3320]", text: "text-[#facc15]" },
    "Out of Stock": { bg: "bg-[#3a1a1a]", text: "text-[#f87171]" },
};

interface TableInventoryRowProps {
    item: InventoryItem;
    isSelected?: boolean;
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
}

export function TableInventoryRow({item, isSelected = false, onEdit, onDelete, }: TableInventoryRowProps) {
    const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES["Out of Stock"];

    return (
        <tr className= {`transition-colors duration-200 ${isSelected ? "bg-(--Select-background)" : "hover:bg-(--Select-background)"}`}>
            {/* Item: Name + Code */}
            <td className="py-3 pr-4">
                <div className="flex flex-col min-w-0">
                    <span className="text-(--Primary-off) text-sm font-primary font-bold truncate">
                        {item.name}
                    </span>
                    <span className="text-(--Text-primary-off) text-xs font-secondary truncate">
                        #{item.code}
                    </span>
                </div>
            </td>

            {/* Amount + Unit */}
            <td className="py-3 px-4">
                <span className="text-(--Text-gray) text-sm font-secondary">
                    {item.amount} <span className="text-(--Text-primary-off)">{UNIT_LABELS[item.unit]}</span>
                </span>
            </td>

            {/* Status Badge */}
            <td className="py-3 px-4">
                <div className={`w-fit h-6 px-3 rounded-full flex items-center justify-center ${statusStyle.bg}`}>
                    <span className={`text-[11px] font-secondary font-bold whitespace-nowrap ${statusStyle.text}`}>
                        {item.status}
                    </span>
                </div>
            </td>

            {/* Actions */}
            <td className="py-3 pl-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-md text-(--Text-primary-off) hover:text-(--Primary) hover:bg-(--Button-background) transition-all duration-200"
                        aria-label={`Edit ${item.name}`}
                        title="Edit item"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-md text-(--Text-primary-off) hover:text-(--Negacion) hover:bg-(--Button-background) transition-all duration-200"
                        aria-label={`Delete ${item.name}`}
                        title="Delete item"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
