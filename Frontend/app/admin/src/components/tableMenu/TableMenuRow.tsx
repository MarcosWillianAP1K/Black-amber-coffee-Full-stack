/**
 * TableMenuRow — A single row in the menu table.
 * Displays item image, name, description, category, price, and action buttons (edit / delete).
 */

import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "shared-utils/types/product";
import { formatPrice } from "shared-utils/helpers/currency";

interface TableMenuRowProps {
    item: Product;
    isSelected?: boolean;
    onEdit: (item: Product) => void;
    onDelete: (id: number) => void;
}

export function TableMenuRow({ item, isSelected = false, onEdit, onDelete, }: TableMenuRowProps) {
    return (
        <tr className= {`transition-colors duration-200 ${isSelected ? "bg-(--Select-background)" : "hover:bg-(--Select-background)"}`}>
            {/* Item: Image + Name + Description */}
            <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-(--Button-background) shrink-0">
                        {item.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-(--Text-primary-off) text-xs">
                                IMG
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col min-w-0">
                        <span className="text-(--Primary-off) text-sm font-primary font-bold truncate">
                            {item.name}
                        </span>
                        <span className="text-(--Text-primary-off) text-xs font-secondary truncate max-w-[200px]">
                            {item.description}
                        </span>
                    </div>
                </div>
            </td>

            {/* Category */}
            <td className="py-4 px-4">
                <span className="text-(--Text-gray) text-sm font-secondary">
                    {item.category}
                </span>
            </td>

            {/* Price */}
            <td className="py-4 px-4">
                <span className="text-(--Primary) text-sm font-secondary font-bold">
                    {formatPrice(item.price)}
                </span>
            </td>

            {/* Actions */}
            <td className="py-4 pl-4">
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
