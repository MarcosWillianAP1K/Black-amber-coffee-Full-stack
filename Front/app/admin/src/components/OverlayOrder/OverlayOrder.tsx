
import { useState, useEffect } from "react";
import { ButtonPrimary } from "ui-shared/components/ui/ButtonPrimary";
import { FormOrder } from "./FormOrder";
import type { FormOrderData } from "./FormOrder";
import type { NewOrderData } from "../../hooks/useOrders";




interface OverlayOrderProps {
    onSave: (data: NewOrderData) => void;
}

export function OverlayOrder({ onSave }: OverlayOrderProps) {
    const [isOrderOverlayOpen, setIsOrderOverlayOpen] = useState(false);


    const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsOrderOverlayOpen(false);
        }
    };

    useEffect(() => {
        if (isOrderOverlayOpen) {
            window.addEventListener("keydown", handleEscKey);
        } else {
            window.removeEventListener("keydown", handleEscKey);
        }
    }, [isOrderOverlayOpen]);

    const handleSave = (data: FormOrderData) => {
        onSave({
            observation: data.observation,
            totalAmount: data.totalAmount,
            items: data.items,
        });
    };

    return (


        <div className="w-full h-fit gap-6 flex flex-col">

            <ButtonPrimary onClick={() => setIsOrderOverlayOpen(true)}>
                <span>+</span>
                <p className="text-(--Text-dark) text-[14px] font-primary font-bold">Register New Order</p>
            </ButtonPrimary>


            {isOrderOverlayOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
                    <FormOrder
                        onClose={() => setIsOrderOverlayOpen(false)}
                        onSave={handleSave}
                    />

                </div>
            )}

        </div>


    );

}


