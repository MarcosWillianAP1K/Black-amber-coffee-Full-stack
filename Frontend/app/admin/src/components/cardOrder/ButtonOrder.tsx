/**
 * ButtonOrder — Action buttons for order cards, varying by order status.
 */

import type { OrderStatus } from "shared-utils/types/order";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";

interface ButtonOrderProps {
    status: OrderStatus;
    onAction?: (action: string) => void;
    disabled?: boolean;
    isLoading?: boolean;
}

const BUTTON_BASE = "w-fit h-6 px-4 py-2 whitespace-nowrap rounded-xs flex items-center justify-center gap-1.5 cursor-pointer";
const BUTTON_DISABLED = "opacity-60 cursor-not-allowed";

export function ButtonOrder({ status, onAction, disabled, isLoading = false }: ButtonOrderProps) {
    const isBlocked = Boolean(disabled || isLoading);

    const handleClick = (action: string) => () => {
        if (!isBlocked) onAction?.(action);
    };

    const btnClass = (custom: string) =>
        `${BUTTON_BASE} ${custom} ${isBlocked ? BUTTON_DISABLED : ""}`;

    const spinner = isLoading ? <LoadingSpinner size="xs" /> : null;

    switch (status) {
        case "criado":
            return (
                <button className={btnClass("bg-(--Button-background)")} onClick={handleClick("start")} disabled={isBlocked}>
                    {spinner}
                    <p className="text-(--Text-gray) text-[12px] font-secondary font-bold">START</p>
                </button>
            );

        case "em_preparo":
            return (
                <div className="w-fit h-fit flex gap-2">
                    <button className={btnClass("bg-(--Button-background)")} onClick={handleClick("hold")} disabled={isBlocked}>
                        {spinner}
                        <p className="text-(--Text-gray) text-[12px] font-secondary font-bold">HOLD</p>
                    </button>
                    <button className={btnClass("bg-(--Primary)")} onClick={handleClick("ready")} disabled={isBlocked}>
                        {spinner}
                        <p className="text-(--Text-dark) text-[12px] font-secondary font-bold">READY</p>
                    </button>
                </div>
            );

        case "pronto":
            return (
                <button className={btnClass("bg-[#04DCFF]")} onClick={handleClick("complete")} disabled={isBlocked}>
                    {spinner}
                    <p className="text-[#003640] text-[12px] font-secondary font-bold">COMPLETE</p>
                </button>
            );

        case "finalizado":
            return (
                <button className={btnClass("bg-[#04DCFF]")} onClick={handleClick("complete")} disabled={isBlocked}>
                    {spinner}
                    <p className="text-[#003640] text-[12px] font-secondary font-bold">COMPLETE</p>
                </button>
            );

        case "cancelado":
            return (
                <button className={btnClass("bg-(--Negacion-off)")} onClick={handleClick("delete")} disabled={isBlocked}>
                    {spinner}
                    <p className="text-(--Text-gray) text-[12px] font-secondary font-bold">DELETE</p>
                </button>
            );

        default:
            return (
                <button className={btnClass("bg-(--Negacion-off)")} onClick={handleClick("delete")} disabled={isBlocked}>
                    {spinner}
                    <p className="text-(--Text-gray) text-[12px] font-secondary font-bold">DELETE</p>
                </button>
            );
    }
}
