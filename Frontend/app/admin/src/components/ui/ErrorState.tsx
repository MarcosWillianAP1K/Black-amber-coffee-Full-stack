/**
 * ErrorState — Shared component for displaying API errors with a retry button.
 *
 * Use in any page where data fetching may fail.
 * Shows an error icon, the error message, and a Retry button
 * that triggers the provided onRetry callback (typically refresh from context).
 */

interface ErrorStateProps {
    message: string;
    onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="w-full flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-(--Negacion)/10 flex items-center justify-center">
                <span className="text-(--Negacion) text-2xl font-bold">!</span>
            </div>
            <p className="text-(--Text-gray) text-sm font-secondary text-center max-w-md">
                {message}
            </p>
            <p className="text-(--Text-primary-off) text-xs font-secondary">
                Verifique sua conexão e tente novamente
            </p>
            <button
                onClick={onRetry}
                className="px-5 py-2 bg-(--Primary) text-(--Text-dark) font-bold text-sm rounded-md hover:bg-(--Primary-selected) transition-colors uppercase tracking-wide"
            >
                Tentar novamente
            </button>
        </div>
    );
}
