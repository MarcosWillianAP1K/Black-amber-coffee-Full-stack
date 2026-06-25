/**
 * RegisterClientOverlay — Slide-in panel to register a new client/user.
 *
 * Posts to POST /api/auth/register (public endpoint).
 * Just for testing — creates a regular user account.
 */

import { useState } from "react";
import { X } from "lucide-react";
import { API } from "shared-utils/core/APIroutes";

interface RegisterClientOverlayProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export function RegisterClientOverlay({ onClose, onSuccess }: RegisterClientOverlayProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(API.Auth.Register, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.message || `Registration failed: ${response.status}`);
            }

            await response.json();
            setSuccessMessage(`Cliente "${name}" cadastrado com sucesso!`);
            if (onSuccess) onSuccess();
            // Reset form
            setName("");
            setEmail("");
            setPassword("");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Falha ao cadastrar cliente";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-gray) text-sm font-secondary placeholder:text-(--Text-primary-off)/40 focus:outline-none focus:border-(--Primary) transition-colors";
    const labelClass = "text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-1.5 block";
    const btnDisabled = "opacity-50 cursor-not-allowed";

    return (
        <div className="w-90 min-w-90 bg-(--Widget-background) border-l border-(--Border) flex flex-col h-full animate-[slideIn_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--Border)">
                <h3 className="text-(--Text-gray) text-lg font-primary font-bold">
                    Cadastrar Cliente
                </h3>
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className={`p-1 rounded-md text-(--Text-primary-off) transition-colors ${isSubmitting ? "opacity-30 cursor-not-allowed" : "hover:text-(--Text-gray) hover:bg-(--Button-background)"}`}
                    aria-label="Close panel"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 pb-6 flex-1 overflow-y-auto pt-5">
                {/* Full Name */}
                <div>
                    <label className={labelClass}>Nome Completo</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Digite o nome completo"
                        required
                        className={inputClass}
                    />
                </div>

                {/* Email */}
                <div>
                    <label className={labelClass}>E-mail</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Digite o endereço de e-mail"
                        required
                        className={inputClass}
                    />
                </div>

                {/* Password */}
                <div>
                    <label className={labelClass}>Senha</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite a senha"
                        required
                        minLength={6}
                        className={inputClass}
                    />
                </div>

                {/* Success / Error */}
                {successMessage && (
                    <div className="p-3 rounded-md bg-(--Primary-20)/10 border border-(--Primary-20)/30">
                        <p className="text-(--Primary) text-xs font-secondary">{successMessage}</p>
                    </div>
                )}
                {error && (
                    <p className="text-(--Negacion) text-xs font-secondary">{error}</p>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-(--Border)">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className={`flex-1 px-4 py-2.5 bg-(--Button-background) text-(--Text-gray) font-primary font-bold text-sm rounded-md transition-colors uppercase tracking-wide ${isSubmitting ? btnDisabled : "hover:bg-(--Select-background) cursor-pointer"}`}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 px-4 py-2.5 bg-(--Primary) text-(--Text-dark) font-primary font-bold text-sm rounded-md transition-colors uppercase tracking-wide ${isSubmitting ? `${btnDisabled} animate-pulse` : "hover:bg-(--Primary-selected) cursor-pointer"}`}
                    >
                        {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </div>
            </form>
        </div>
    );
}
