import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import { formatPrice } from "shared-utils/helpers/currency";

interface SummaryCartProps {
    itemsCount: number;
    subTotal: number;
    discount: number;
    onCompletePurchase: () => void;
    ctaLabel?: string;
    loadingLabel?: string;
    isLoading?: boolean;
    disabled?: boolean;
}

export function SummaryCart({
    itemsCount,
    subTotal,
    discount,
    onCompletePurchase,
    ctaLabel = "Finalizar Pedido",
    loadingLabel = "Processando...",
    isLoading = false,
    disabled = false,
}: SummaryCartProps) {
    const total = Math.max(0, subTotal - discount);
    const isBlocked = isLoading || disabled;

    return (
        <div className="w-full bg-(--Widget-background) rounded-xl p-5 sm:p-6 flex flex-col gap-5 border border-(--Border)/60 shadow-xl">
            <div className="flex justify-between items-center border-b border-(--Border)/50 pb-3">
                <span className="text-(--Text-primary-off) text-xs font-secondary font-bold uppercase tracking-widest">
                    Resumo do Pedido
                </span>
                <span className="text-(--Primary-off) text-xs font-secondary font-semibold tabular-nums">
                    {itemsCount} {itemsCount === 1 ? "item" : "itens"}
                </span>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-secondary">
                    <span className="text-(--Text-gray)">Subtotal</span>
                    <span className="text-(--Text-primary) font-semibold tabular-nums">
                        {formatPrice(subTotal)}
                    </span>
                </div>

                {discount > 0 && (
                    <div className="flex justify-between items-center text-sm font-secondary">
                        <span className="text-(--Text-gray)">Desconto</span>
                        <span className="text-(--Success-text) font-semibold tabular-nums">
                            - {formatPrice(discount)}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-baseline border-t border-(--Border)/50 pt-4">
                <span className="text-(--Text-primary) font-primary text-base font-bold">Total</span>
                <span className="text-(--Primary) text-2xl font-primary font-extrabold tabular-nums">
                    {formatPrice(total)}
                </span>
            </div>

            <button
                type="button"
                disabled={isBlocked}
                onClick={onCompletePurchase}
                className="w-full min-h-12 py-3 px-4 bg-[linear-gradient(180deg,var(--Primary-off)_0%,var(--Primary)_100%)] text-(--Text-dark) rounded-md font-primary font-extrabold text-sm tracking-wider uppercase cursor-pointer hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md text-center flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <LoadingSpinner size="sm" label={loadingLabel} />
                ) : (
                    ctaLabel
                )}
            </button>
        </div>
    );
}
