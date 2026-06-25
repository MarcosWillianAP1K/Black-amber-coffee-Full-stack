import { useState, useEffect, useCallback } from "react";
import { ButtonPrimary } from "ui-shared/components/ui/ButtonPrimary";
import { FormOrder } from "./FormOrder";
import type { FormOrderData } from "./FormOrder";
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


        <div className="w-full h-fit gap-6 flex flex-col">

            <ButtonPrimary onClick={() => setIsOrderOverlayOpen(true)}>
                <span>+</span>
                <p className="text-(--Text-dark) text-[14px] font-primary font-bold">Registrar Novo Pedido</p>
            </ButtonPrimary>


            {isOrderOverlayOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
                    <FormOrder
                        onClose={() => setIsOrderOverlayOpen(false)}
                        onSave={handleSave}
                        products={products}
                    />

                </div>
            )}

        </div>


    );

}


