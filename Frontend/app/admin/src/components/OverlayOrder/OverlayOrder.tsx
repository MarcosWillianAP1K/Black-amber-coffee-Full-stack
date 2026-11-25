import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { FormOrder, type FormOrderData } from "./FormOrder";
import type { NewOrderData } from "../../hooks/useOrders";
import type { Product } from "shared-utils/types/product";

interface OverlayOrderProps {
    onSave: (data: NewOrderData) => Promise<void>;
    products: Product[];
}

export function OverlayOrder({ onSave, products }: OverlayOrderProps) {
    const [isOrderOverlayOpen, setIsOrderOverlayOpen] = useState(false);

    const handleEscKey = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsOrderOverlayOpen(false);
        }
    }, []);

    useEffect(() => {
        if (!isOrderOverlayOpen) return;
        window.addEventListener("keydown", handleEscKey);
        return () => {
            window.removeEventListener("keydown", handleEscKey);
        };
    }, [isOrderOverlayOpen, handleEscKey]);

    const handleSave = async (data: FormOrderData) => {
        await onSave({
            clientPublicId: data.clientPublicId,
            observation: data.observation,
            totalPrice: data.totalPrice,
            paymentMethod: data.paymentMethod,
            itens: data.items,
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOrderOverlayOpen(true)}
                className="min-h-10 px-4 py-2 rounded-lg bg-(--Primary) hover:bg-(--Primary-selected) text-(--Text-dark) text-xs sm:text-sm font-primary font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
                <Plus size={16} />
                Registrar Novo Pedido
            </button>

            {isOrderOverlayOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="Fechar janela de pedido"
                        onClick={() => setIsOrderOverlayOpen(false)}
                        className="absolute inset-0 bg-black/70 backdrop-blur-xs"
                    />
                    <div className="relative z-10 w-full max-w-xl">
                        <FormOrder
                            onClose={() => setIsOrderOverlayOpen(false)}
                            onSave={handleSave}
                            products={products}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
