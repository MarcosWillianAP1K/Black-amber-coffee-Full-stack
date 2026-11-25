import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    danger = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        confirmButtonRef.current?.focus();

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onCancel();
            }

            if (event.key === "Enter") {
                const target = event.target as HTMLElement | null;
                const tagName = target?.tagName;
                const isTypingTarget =
                    tagName === "INPUT" ||
                    tagName === "TEXTAREA" ||
                    tagName === "SELECT" ||
                    target?.isContentEditable;

                if (!isTypingTarget) {
                    onConfirm();
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onCancel, onConfirm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <button
                type="button"
                aria-label="Close dialog"
                className="absolute inset-0 bg-black/60"
                onClick={onCancel}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                className="relative w-full max-w-sm mx-4 rounded-xl border border-(--Border) bg-(--Widget-background) p-6 shadow-2xl"
            >
                <h3 id="confirm-dialog-title" className="text-(--Text-primary) text-base font-primary font-extrabold">
                    {title}
                </h3>
                {description ? (
                    <p className="mt-2 text-(--Text-primary-off) text-sm font-secondary leading-relaxed">
                        {description}
                    </p>
                ) : null}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="min-h-10 px-4 py-2 rounded-md border border-(--Border) text-(--Text-primary-off) text-xs font-secondary font-semibold uppercase tracking-wider hover:border-(--Primary) hover:text-(--Primary) transition-all duration-200 cursor-pointer"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        ref={confirmButtonRef}
                        className={`min-h-10 px-4 py-2 rounded-md text-xs font-secondary font-semibold uppercase tracking-wider border transition-all duration-200 cursor-pointer
                            ${danger
                                ? "border-(--Danger-border) bg-(--Danger-bg) text-(--Danger-text) hover:bg-(--Negacion) hover:text-white"
                                : "border-(--Border2) text-(--Text-dark) bg-(--Primary) hover:bg-(--Primary-selected)"
                            }
                        `}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
