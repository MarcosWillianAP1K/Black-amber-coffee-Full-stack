import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToastStore, type ToastVariant } from "shared-utils/stores/useToastStore";

const VARIANT_STYLES: Record<ToastVariant, { container: string; icon: typeof Info; iconColor: string }> = {
    success: {
        container: "border-(--Afirmation)/50 bg-[#18221b] text-(--Text-primary)",
        icon: CheckCircle2,
        iconColor: "text-(--Success-text)",
    },
    error: {
        container: "border-(--Danger-border) bg-[#241616] text-(--Text-primary)",
        icon: XCircle,
        iconColor: "text-(--Danger-text)",
    },
    warning: {
        container: "border-(--Warning)/50 bg-[#231d14] text-(--Text-primary)",
        icon: AlertTriangle,
        iconColor: "text-(--Warning-text)",
    },
    info: {
        container: "border-(--Border) bg-(--Widget-background) text-(--Text-primary)",
        icon: Info,
        iconColor: "text-(--Primary)",
    },
};

export function ToastViewport() {
    const toasts = useToastStore((state) => state.toasts);
    const dismissToast = useToastStore((state) => state.dismissToast);

    if (toasts.length === 0) return null;

    return (
        <div
            aria-live="polite"
            aria-label="Notificações"
            className="fixed top-4 right-4 left-4 sm:left-auto sm:top-auto sm:bottom-5 sm:right-5 z-[70] flex flex-col gap-2.5 sm:w-96 pointer-events-none"
        >
            {toasts.map((toast) => {
                const style = VARIANT_STYLES[toast.variant];
                const Icon = style.icon;
                return (
                    <div
                        key={toast.id}
                        role="status"
                        className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-xl flex items-start gap-3 animate-[fadeSlideUp_0.2s_ease-out] ${style.container}`}
                    >
                        <Icon size={18} className={`shrink-0 mt-0.5 ${style.iconColor}`} aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-primary font-bold leading-snug text-(--Text-primary)">
                                {toast.title}
                            </p>
                            {toast.description && (
                                <p className="mt-0.5 text-xs font-secondary text-(--Text-primary-off) leading-relaxed">
                                    {toast.description}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => dismissToast(toast.id)}
                            aria-label="Fechar notificação"
                            className="p-1 rounded-md text-(--Text-primary-off) hover:text-(--Text-primary) hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
