import { ButtonAddProduct } from "ui-shared/components/ui/ButtonAddProduct";
import { ProductThumb } from "ui-shared/components/ui/ProductThumb";
import { formatPrice } from "shared-utils/helpers/currency";

export interface ProductCardProps {
    name: string;
    itens: string;
    price: number;
    promotionPrice?: number;
    imageUrl?: string;
    category?: string;
    onClick: () => void;
    onSelect?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export function ProductCard({
    name,
    itens,
    price,
    promotionPrice,
    imageUrl,
    category = "cafe",
    onClick,
    onSelect,
    isLoading = false,
    disabled = false,
}: ProductCardProps) {
    return (
        <div
            onClick={onSelect}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onKeyDown={
                onSelect
                    ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onSelect();
                          }
                      }
                    : undefined
            }
            className={`w-full h-full p-3.5 bg-(--Widget-background) border border-(--Border)/50 rounded-xl flex flex-col gap-3 shadow-md transition-all ${
                onSelect ? "cursor-pointer hover:border-(--Primary)/60" : ""
            }`}
        >
            <ProductThumb
                name={name}
                category={category}
                imageUrl={imageUrl}
                iconSize={30}
                className="w-full aspect-square rounded-lg"
            />

            <div className="w-full flex-1 flex flex-col justify-between gap-2.5">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm sm:text-base font-primary font-bold text-(--Text-primary) line-clamp-1">
                        {name}
                    </h3>
                    <p className="text-(--Text-primary-off) text-xs font-secondary line-clamp-2 leading-relaxed min-h-8">
                        {itens}
                    </p>
                </div>

                <div className="w-full flex items-center justify-between gap-2 pt-1">
                    <div className="flex flex-col whitespace-nowrap">
                        {promotionPrice !== undefined && (
                            <span className="text-xs font-secondary text-(--Text-primary-off) line-through tabular-nums">
                                {formatPrice(price)}
                            </span>
                        )}
                        <span className="text-sm sm:text-base font-primary font-extrabold text-(--Primary) tabular-nums">
                            {formatPrice(promotionPrice ?? price)}
                        </span>
                    </div>

                    <div
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                        <ButtonAddProduct
                            onClick={onClick}
                            isLoading={isLoading}
                            disabled={disabled}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
