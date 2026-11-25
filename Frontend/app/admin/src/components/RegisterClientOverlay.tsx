import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import { API } from "shared-utils/core/APIroutes";
import { useToastStore } from "shared-utils/stores/useToastStore";

interface RegisterClientOverlayProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export function RegisterClientOverlay({ onClose, onSuccess }: RegisterClientOverlayProps) {
    const showToast = useToastStore((s) => s.showToast);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isSubmitting) onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isSubmitting, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(API.Auth.Register, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                const body = (await response.json().catch(() => null)) as {
                    message?: string;
                    error?: { message?: string };
                } | null;
                throw new Error(
                    body?.error?.message ?? body?.message ?? `Falha ao cadastrar (${response.status})`,
                );
            }

            await response.json();
            showToast({ variant: "success", title: `Cliente "${name}" cadastrado!` });
            if (onSuccess) onSuccess();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Falha ao cadastrar cliente";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        "w-full min-h-10 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary placeholder:text-(--Text-primary-off)/45 focus:outline-none focus:border-(--Primary)";
    const labelClass =
        "text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-1.5 block";

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button
                type="button"
                aria-label="Fechar painel"
                onClick={() => {
                    if (!isSubmitting) onClose();
                }}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="reg-client-title"
                className="relative z-10 w-full max-w-md bg-(--Widget-background) border-l border-(--Border) flex flex-col h-full shadow-2xl animate-[slideIn_0.2s_ease-out]"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-(--Border)/60">
                    <h3 id="reg-client-title" className="text-(--Text-primary) text-lg font-primary font-extrabold">
                        Cadastrar Cliente
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-1.5 rounded-md text-(--Text-primary-off) hover:text-(--Text-primary) hover:bg-(--Button-background) cursor-pointer"
                        aria-label="Fechar painel"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5 flex-1 overflow-y-auto">
                    <div>
                        <label htmlFor="cli-name" className={labelClass}>Nome Completo</label>
                        <input
                            id="cli-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Digite o nome completo"
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="cli-email" className={labelClass}>E-mail</label>
                        <input
                            id="cli-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="cliente@email.com"
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="cli-pass" className={labelClass}>Senha</label>
                        <input
                            id="cli-pass"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mín. 6 chars, 1 maiúscula e 1 número"
                            required
                            minLength={6}
                            className={inputClass}
                        />
                    </div>

                    {error && (
                        <div className="rounded-md border border-(--Danger-border) bg-(--Danger-bg) px-3 py-2 text-xs text-(--Danger-text)">
                            {error}
                        </div>
                    )}

                    <div className="flex-1" />

                    <div className="flex gap-3 pt-4 border-t border-(--Border)/50">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 min-h-11 px-4 py-2.5 bg-(--Button-background) text-(--Text-primary) font-primary font-bold text-xs rounded-md hover:bg-(--Select-background) disabled:opacity-50 uppercase tracking-wider cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 min-h-11 px-4 py-2.5 bg-(--Primary) text-(--Text-dark) font-primary font-extrabold text-xs rounded-md hover:bg-(--Primary-selected) disabled:opacity-60 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? <LoadingSpinner size="xs" label="Cadastrando..." /> : "Cadastrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
