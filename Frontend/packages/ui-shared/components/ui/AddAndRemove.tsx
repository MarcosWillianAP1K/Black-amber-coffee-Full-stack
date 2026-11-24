


import { LoadingSpinner } from "./LoadingSpinner";

export interface AddAndRemoveProps {
    onAdd: () => void;
    quantity?: number;
    onRemove: () => void;
    disabled?: boolean;
    isLoading?: boolean;
}

export function AddAndRemove({
    onAdd,
    quantity,
    onRemove,
    disabled = false,
    isLoading = false,
}: AddAndRemoveProps) {
    const isBlocked = disabled || isLoading;

    return (
        <div className="w-fit h-fit flex flex-row items-center gap-2">
            <button
                type="button"
                disabled={isBlocked}
                className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-fit h-fit px-2 py-1 inline-flex items-center justify-center rounded-sm bg-(--Negacion) text-(--Text-gray) font-primary font-[12px] focus:outline-none ring-0 leading-none"
                onClick={onRemove}
                aria-label="Diminuir quantidade"
            >
                {isLoading ? <LoadingSpinner size="xs" /> : "-"}
            </button>

            {quantity !== undefined && (
                <span className="text-[12px] font-primary text-(--Text-gray) text-center min-w-4">
                    {quantity}
                </span>
            )}

            <button
                type="button"
                disabled={isBlocked}
                className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-fit h-fit px-2 py-1 inline-flex items-center justify-center rounded-sm bg-(--Button-background) text-(--Text-gray) font-primary font-[12px] focus:outline-none ring-0 leading-none"
                onClick={onAdd}
                aria-label="Aumentar quantidade"
            >
                {isLoading ? <LoadingSpinner size="xs" /> : "+"}
            </button>
        </div>
    );
}