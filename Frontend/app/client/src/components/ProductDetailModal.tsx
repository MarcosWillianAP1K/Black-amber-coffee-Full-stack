import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { ProductThumb } from "ui-shared/components/ui/ProductThumb";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import { formatPrice } from "shared-utils/helpers/currency";
import { PRODUCT_CATEGORY_LABELS, type Product, type ProductCategory } from "shared-utils/types/product";

interface ProductDetailModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAdd: (product: Product, quantity: number, observation: string) => Promise<void>;
    isLoading?: boolean;
}

export function ProductDetailModal({
    product,
    isOpen,
    onClose,
    onAdd,
    isLoading = false,
}: ProductDetailModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [observation, setObservation] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !product) return null;

    const categoryLabel =
        PRODUCT_CATEGORY_LABELS[product.category as ProductCategory] ?? product.category;

    const handleConfirm = async () => {
        await onAdd(product, quantity, observation);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <button
                type="button"
                aria-label="Fechar detalhes"
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-modal-title"
                className="relative w-full sm:max-w-lg bg-(--Widget-background) border border-(--Border) rounded-t-2xl sm:rounded-xl overflow-hidden shadow-2xl animate-[fadeSlideUp_0.2s_ease-out]"
            >
                <div className="relative h-52 w-full">
                    <ProductThumb
                        name={product.name}
                        category={product.category}
                        imageUrl={product.imgUrl}
                        iconSize={48}
                        showBadgeLabel
                        className="w-full h-full"
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 sm:p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <span className="text-xs font-secondary font-semibold uppercase tracking-wider text-(--Primary)">
                                {categoryLabel}
                            </span>
                            <h2
                                id="product-modal-title"
                                className="text-xl font-primary font-extrabold text-(--Text-primary) mt-0.5"
                            >
                                {product.name}
                            </h2>
                        </div>
                        <span className="text-xl font-primary font-extrabold text-(--Primary) tabular-nums shrink-0">
                            {formatPrice(product.price)}
                        </span>
                    </div>

                    <p className="text-sm font-secondary text-(--Text-primary-off) leading-relaxed">
                        {product.description || "Preparado na hora com seleção especial da casa."}
                    </p>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="item-observation"
                            className="text-xs font-secondary font-semibold text-(--Primary-off)"
                        >
                            Observação deste item (opcional)
                        </label>
                        <textarea
                            id="item-observation"
                            rows={2}
                            maxLength={180}
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            placeholder="Ex.: sem açúcar, leite extra, temperatura morna..."
                            className="w-full rounded-md border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-primary) placeholder:text-(--Text-primary-off)/45 focus:outline-none focus:border-(--Primary) resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-(--Border)/50">
                        <div className="flex items-center gap-2 bg-(--Page-background) border border-(--Border)/60 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                aria-label="Diminuir quantidade"
                                className="w-9 h-9 rounded-md flex items-center justify-center text-(--Text-primary) hover:bg-(--Button-background) cursor-pointer"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-8 text-center text-sm font-primary font-bold text-(--Text-primary) tabular-nums">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => q + 1)}
                                aria-label="Aumentar quantidade"
                                className="w-9 h-9 rounded-md flex items-center justify-center text-(--Text-primary) hover:bg-(--Button-background) cursor-pointer"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => void handleConfirm()}
                            className="flex-1 min-h-11 px-4 py-2.5 rounded-lg bg-(--Primary) hover:bg-(--Primary-selected) text-(--Text-dark) font-primary font-extrabold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer tabular-nums"
                        >
                            {isLoading ? (
                                <LoadingSpinner size="sm" label="Adicionando..." />
                            ) : (
                                `Adicionar • ${formatPrice(product.price * quantity)}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
