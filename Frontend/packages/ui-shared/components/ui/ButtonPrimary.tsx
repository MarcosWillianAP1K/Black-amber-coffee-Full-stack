


import { LoadingSpinner } from "./LoadingSpinner";

interface ButtonPrimaryProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    isLoading?: boolean;
    loadingText?: string;
}

export function ButtonPrimary({
    children,
    onClick,
    type = "button",
    disabled = false,
    isLoading = false,
    loadingText,
}: ButtonPrimaryProps) {
    const isBlocked = disabled || isLoading;

    return (
        <button
            className="w-full h-fit px-4 py-2 bg-(--Primary) cursor-pointer hover:bg-(--Primary-selected) disabled:opacity-60 disabled:cursor-not-allowed text-(--Text-dark) font-primary font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors"
            onClick={onClick}
            type={type}
            disabled={isBlocked}
        >
            {isLoading ? (
                <>
                    <LoadingSpinner size="sm" />
                    <span>{loadingText ?? children}</span>
                </>
            ) : (
                children
            )}
        </button>
    );
}