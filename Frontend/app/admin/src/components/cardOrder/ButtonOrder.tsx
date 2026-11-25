/**
 * ButtonOrder — Action buttons for KDS order cards.
 */

import type { OrderStatus } from "shared-utils/types/order";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";

interface ButtonOrderProps {
    status: OrderStatus;
    onAction?: (action: string) => void;
    disabled?: boolean;
    isLoading?: boolean;
}

const BUTTON_BASE =
    "min-h-10 px-3.5 py-2 whitespace-nowrap rounded-md flex items-center justify-center gap-1.5 text-xs font-primary font-bold uppercase tracking-wider transition-colors cursor-pointer";
const BUTTON_DISABLED = "opacity-60 cursor-not-allowed";

export function ButtonOrder({
    status,
    onAction,
    disabled,
    isLoading = false,
}: ButtonOrderProps) {
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
                <button
                    type="button"
                    className={btnClass("bg-(--Primary) text-(--Text-dark) hover:bg-(--Primary-selected)")}
                    onClick={handleClick("start")}
                    disabled={isBlocked}
                >
                    {spinner}
                    <span>Iniciar Preparo</span>
                </button>
            );

        case "em_preparo":
            return (
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        className={btnClass("bg-(--Button-background) text-(--Text-primary) hover:bg-(--Select-background)")}
                        onClick={handleClick("hold")}
                        disabled={isBlocked}
                    >
                        {spinner}
                        <span>Pausar</span>
                    </button>
                    <button
                        type="button"
                        className={btnClass("bg-(--Primary) text-(--Text-dark) hover:bg-(--Primary-selected)")}
                        onClick={handleClick("ready")}
                        disabled={isBlocked}
                    >
                        {spinner}
                        <span>Pronto</span>
                    </button>
                </div>
            );

        case "pronto":
            return (
                <button
                    type="button"
                    className={btnClass("bg-(--Info) text-(--Info-text) hover:brightness-110")}
                    onClick={handleClick("complete")}
                    disabled={isBlocked}
                >
                    {spinner}
                    <span>Finalizar</span>
                </button>
            );

        case "finalizado":
            return (
                <span className="text-xs font-secondary font-semibold text-(--Success-text) px-2">
                    Entregue
                </span>
            );

        case "cancelado":
        default:
            return (
                <button
                    type="button"
                    className={btnClass("border border-(--Danger-border) bg-(--Danger-bg) text-(--Danger-text) hover:bg-(--Negacion) hover:text-white")}
                    onClick={handleClick("delete")}
                    disabled={isBlocked}
                >
                    {spinner}
                    <span>Excluir</span>
                </button>
            );
    }
}
