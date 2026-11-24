import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps {
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
    label?: string;
}

const SIZE_CLASSES: Record<NonNullable<LoadingSpinnerProps["size"]>, string> = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
};

export function LoadingSpinner({
    size = "sm",
    className = "",
    label,
}: LoadingSpinnerProps) {
    return (
        <span
            className={`inline-flex items-center justify-center gap-2 ${className}`}
            role="status"
            aria-live="polite"
        >
            <Loader2
                className={`${SIZE_CLASSES[size]} animate-spin shrink-0`}
                aria-hidden="true"
            />
            {label ? <span>{label}</span> : null}
        </span>
    );
}
