/**
 * ButtonOrder — Action buttons for order cards, varying by order status.
 */

import type { OrderStatus } from "shared-utils/types/order";

interface ButtonOrderProps {
    status: OrderStatus;
    onAction?: (action: string) => void;
    disabled?: boolean;
}

const BUTTON_BASE = "w-fit h-6 px-4 py-2 whitespace-nowrap rounded-xs flex items-center justify-center";
const BUTTON_DISABLED = "opacity-50 cursor-not-allowed animate-pulse";

export function ButtonOrder({ status, onAction, disabled }: ButtonOrderProps) {
    const handleClick = (action: string) => () => {
        if (!disabled) onAction?.(action);
    };

    const btnClass = (custom: string) =>
        `${BUTTON_BASE} ${custom} ${disabled ? BUTTON_DISABLED : ""}`;

    switch (status) {
        case "PENDING":
            return (
                <button className={btnClass("bg-(--Button-background)")} onClick={handleClick("start")} disabled={disabled}>
                    <p className="text-(--Text-gray) text-[12px] font-secondary font-bold">START</p>
                </button>
            );

        case "IN PROGRESS":
            return (
                <div className="w-fit h-fit flex gap-2">
                    <button className={btnClass("bg-(--Button-background)")} onClick={handleClick("hold")} disabled={disabled}>
                        <p className="text-(--Text-gray) text-[12px] font-secondary font-bold">HOLD</p>
                    </button>
                    <button className={btnClass("bg-(--Primary)")} onClick={handleClick("ready")} disabled={disabled}>
                        <p className="text-(--Text-dark) text-[12px] font-secondary font-bold">READY</p>
                    </button>
                </div>
            );

        case "COMPLETED":
            return (
                <button className={btnClass("bg-[#04DCFF]")} onClick={handleClick("complete")} disabled={disabled}>
                    <p className="text-[#003640] text-[12px] font-secondary font-bold">COMPLETE</p>
                </button>
            );

        case "LATE":
            return (
                <button className={btnClass("bg-(--Negacion-off)")} onClick={handleClick("complete")} disabled={disabled}>
                    <p className="text-(--Text-gray) text-[12px] font-secondary font-bold">COMPLETE</p>
                </button>
            );

        case "CANCELLED":
            return (
                <button className={btnClass("bg-(--Negacion-off)")} onClick={handleClick("delete")} disabled={disabled}>
                    <p className="text-(--Text-gray) text-[12px] font-secondary font-bold">DELETE</p>
                </button>
            );

        default:
            return (
                <button className={btnClass("bg-(--Negacion-off)")} onClick={handleClick("delete")} disabled={disabled}>
                    <p className="text-(--Text-gray) text-[12px] font-secondary font-bold">DELETE</p>
                </button>
            );
    }
}
