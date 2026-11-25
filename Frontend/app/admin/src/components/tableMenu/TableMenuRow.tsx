import { Pencil, Power, Trash2 } from "lucide-react";
import { ProductThumb } from "ui-shared/components/ui/ProductThumb";
import { PRODUCT_CATEGORY_LABELS, type Product, type ProductCategory } from "shared-utils/types/product";
import { formatPrice } from "shared-utils/helpers/currency";

interface TableMenuRowProps {
    item: Product;
    isSelected?: boolean;
    onEdit: (item: Product) => void;
    onDelete: (id: number) => void;
    onToggleActive?: (id: number) => void;
}

export function TableMenuRow({
    item,
    isSelected = false,
    onEdit,
    onDelete,
    onToggleActive,
}: TableMenuRowProps) {
    const categoryLabel =
        PRODUCT_CATEGORY_LABELS[item.category as ProductCategory] ?? item.category;

    return (
        <tr
            className={`border-b border-(--Border)/30 transition-colors duration-200 ${
                isSelected ? "bg-(--Select-background)" : "hover:bg-(--Select-background)/70"
            }`}
        >
            <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                    <ProductThumb
                        name={item.name}
                        category={item.category}
                        imageUrl={item.imgUrl}
                        iconSize={18}
                        className="w-12 h-12 rounded-lg shrink-0"
                    />

                    <div className="flex flex-col min-w-0">
                        <span className="text-(--Text-primary) text-sm font-primary font-bold truncate">
                            {item.name}
                        </span>
                        <span className="text-(--Text-primary-off) text-xs font-secondary truncate max-w-xs">
                            {item.description || "Sem descrição"}
                        </span>
                    </div>
                </div>
            </td>

            <td className="py-3 px-4">
                <span className="text-(--Text-gray) text-sm font-secondary">
                    {categoryLabel}
                </span>
            </td>

            <td className="py-3 px-4">
                <span className="text-(--Primary) text-sm font-primary font-bold tabular-nums">
                    {formatPrice(item.price)}
                </span>
            </td>

            <td className="py-3 px-4">
                <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-secondary font-bold ${
                        item.isActive
                            ? "bg-(--Afirmation)/20 text-(--Success-text)"
                            : "bg-(--Danger-bg) text-(--Danger-text)"
                    }`}
                >
                    {item.isActive ? "Ativo" : "Inativo"}
                </span>
            </td>

            <td className="py-3 pl-4">
                <div className="flex items-center gap-2">
                    {onToggleActive && (
                        <button
                            type="button"
                            onClick={() => onToggleActive(item.id)}
                            className={`p-2 rounded-md transition-colors cursor-pointer ${
                                item.isActive
                                    ? "text-(--Success-text) hover:bg-(--Button-background)"
                                    : "text-(--Text-primary-off) hover:text-(--Primary) hover:bg-(--Button-background)"
                            }`}
                            aria-label={item.isActive ? `Desativar ${item.name}` : `Ativar ${item.name}`}
                            title={item.isActive ? "Desativar item" : "Ativar item"}
                        >
                            <Power size={16} />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-md text-(--Text-primary-off) hover:text-(--Primary) hover:bg-(--Button-background) transition-all duration-200 cursor-pointer"
                        aria-label={`Editar ${item.name}`}
                        title="Editar item"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="p-2 rounded-md text-(--Text-primary-off) hover:text-(--Danger-text) hover:bg-(--Danger-bg) transition-all duration-200 cursor-pointer"
                        aria-label={`Excluir ${item.name}`}
                        title="Excluir item"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
