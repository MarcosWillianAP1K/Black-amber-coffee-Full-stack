import { Trash2 } from "lucide-react";
import { AddAndRemove } from "ui-shared/components/ui/AddAndRemove.js";
import { ProductThumb } from "ui-shared/components/ui/ProductThumb";
import { formatPrice } from "shared-utils/helpers/currency";

export interface ProductCartProps {
    name: string;
    price: number;
    promotionPrice?: number;
    imageUrl?: string;
    category?: string;
    observation?: string | null;
    quantity?: number;
    onAdd: () => void;
    onRemove: () => void;
    onDeleteItem?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export function ProductCart({
    name,
    price,
    promotionPrice,
    imageUrl,
    category = "cafe",
    observation,
    quantity = 1,
    onAdd,
    onRemove,
    onDeleteItem,
    isLoading = false,
    disabled = false,
}: ProductCartProps) {
    const unitPrice = promotionPrice ?? price;

    return (
        <div className="w-full p-3.5 bg-(--Widget-background) border border-(--Border)/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <ProductThumb
                    name={name}
                    category={category}
                    imageUrl={imageUrl}
                    iconSize={20}
                    className="w-14 h-14 rounded-lg shrink-0"
                />

                <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-base font-primary text-(--Text-primary) font-bold truncate">
                        {name}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-secondary text-(--Primary) font-semibold tabular-nums">
                            {formatPrice(unitPrice)} un.
                        </span>
                        <span className="text-xs font-secondary text-(--Text-primary-off) tabular-nums">
                            • Subtotal: {formatPrice(unitPrice * quantity)}
                        </span>
                    </div>
                    {observation && (
                        <p className="mt-1 text-xs font-secondary text-(--Primary-off)/80 line-clamp-2">
                            Obs.: {observation}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
                <AddAndRemove
                    onAdd={onAdd}
                    onRemove={onRemove}
                    quantity={quantity}
                    isLoading={isLoading}
                    disabled={disabled}
                />
                {onDeleteItem && (
                    <button
                        type="button"
                        onClick={onDeleteItem}
                        disabled={disabled || isLoading}
                        aria-label={`Remover ${name} do carrinho`}
                        className="p-2 rounded-md text-(--Text-primary-off) hover:text-(--Danger-text) hover:bg-(--Danger-bg) transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
