


import { LoadingSpinner } from "./LoadingSpinner";

export interface ButtonAddProductProps {
    onClick: () => void;
    disabled?: boolean;
    isLoading?: boolean;
}

export const ButtonAddProduct = ({
    onClick,
    disabled = false,
    isLoading = false,
}: ButtonAddProductProps) => {
    return (
        <button
            type="button"
            disabled={disabled || isLoading}
            className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-fit h-fit inline-flex items-center justify-center px-3 py-2 rounded-sm bg-(--Button-background) text-(--Text-gray) font-primary font-[12px] focus:outline-none ring-0 leading-none"
            onClick={onClick}
            aria-label="Adicionar ao carrinho"
        >
            {isLoading ? <LoadingSpinner size="xs" /> : "+"}
        </button>
    );
};
