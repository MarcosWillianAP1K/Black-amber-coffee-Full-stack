/**
 * RegisterWorkerOverlay — Slide-in panel for admin to register a new worker.
 *
 * Posts to POST /api/admin/workers (requires admin auth).
 * After successful registration, refreshes the employee list.
 */

import { useState } from "react";
import { X } from "lucide-react";
import { WORKER_ROLES } from "shared-utils/types/worker";
import type { WorkerRole } from "shared-utils/types/worker";
import * as employeeService from "../services/employeeService";

interface RegisterWorkerOverlayProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function RegisterWorkerOverlay({ onClose, onSuccess }: RegisterWorkerOverlayProps) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState<WorkerRole>("barista");
    const [salary, setSalary] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            onSuccess();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to register worker";
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
                    Register Worker
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
                    <label className={labelClass}>Full Name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter full name"
                        required
                        className={inputClass}
                    />
                </div>

                {/* Email */}
                <div>
                    <label className={labelClass}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        required
                        className={inputClass}
                    />
                </div>

                {/* Password */}
                <div>
                    <label className={labelClass}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        minLength={6}
                        className={inputClass}
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className={labelClass}>Phone (optional)</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className={inputClass}
                    />
                </div>

                {/* Role + Salary (side by side) */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className={labelClass}>Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as WorkerRole)}
                            className={`${inputClass} cursor-pointer appearance-none`}
                        >
                            {WORKER_ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-28">
                        <label className={labelClass}>Salary ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={salary || ""}
                            onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            required
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Error */}
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
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 px-4 py-2.5 bg-(--Primary) text-(--Text-dark) font-primary font-bold text-sm rounded-md transition-colors uppercase tracking-wide ${isSubmitting ? `${btnDisabled} animate-pulse` : "hover:bg-(--Primary-selected) cursor-pointer"}`}
                    >
                        {isSubmitting ? "Registering..." : "Register"}
                    </button>
                </div>
            </form>
        </div>
    );
}
