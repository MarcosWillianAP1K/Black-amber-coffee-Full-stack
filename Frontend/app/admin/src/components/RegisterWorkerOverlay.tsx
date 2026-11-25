import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import { WORKER_ROLES, type WorkerRole } from "shared-utils/types/worker";
import { useToastStore } from "shared-utils/stores/useToastStore";
import * as employeeService from "../services/employeeService";

interface RegisterWorkerOverlayProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function RegisterWorkerOverlay({ onClose, onSuccess }: RegisterWorkerOverlayProps) {
    const showToast = useToastStore((s) => s.showToast);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState<WorkerRole>("barista");
    const [salary, setSalary] = useState(0);
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
            await employeeService.createEmployee({
                fullName,
                email,
                password,
                phone: phone || undefined,
                role,
                salary,
            });
            showToast({ variant: "success", title: `Funcionário ${fullName} cadastrado!` });
            onSuccess();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Falha ao cadastrar funcionário";
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
                aria-labelledby="reg-worker-title"
                className="relative z-10 w-full max-w-md bg-(--Widget-background) border-l border-(--Border) flex flex-col h-full shadow-2xl animate-[slideIn_0.2s_ease-out]"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-(--Border)/60">
                    <h3 id="reg-worker-title" className="text-(--Text-primary) text-lg font-primary font-extrabold">
                        Cadastrar Funcionário
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
                        <label htmlFor="wk-name" className={labelClass}>Nome Completo</label>
                        <input
                            id="wk-name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Digite o nome completo"
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="wk-email" className={labelClass}>E-mail</label>
                        <input
                            id="wk-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nome@blackamber.com"
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="wk-pass" className={labelClass}>Senha</label>
                        <input
                            id="wk-pass"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            required
                            minLength={6}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="wk-phone" className={labelClass}>Telefone (opcional)</label>
                        <input
                            id="wk-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(11) 99999-9999"
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="wk-role" className={labelClass}>Cargo</label>
                            <select
                                id="wk-role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as WorkerRole)}
                                className={`${inputClass} cursor-pointer`}
                            >
                                {WORKER_ROLES.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="wk-salary" className={labelClass}>Salário (R$)</label>
                            <input
                                id="wk-salary"
                                type="number"
                                step="0.01"
                                min="0"
                                value={salary || ""}
                                onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                required
                                className={`${inputClass} tabular-nums`}
                            />
                        </div>
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
