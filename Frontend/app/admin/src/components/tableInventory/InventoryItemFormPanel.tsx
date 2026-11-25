import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import {
    INVENTORY_UNITS,
    UNIT_FULL_LABELS,
    type InventoryAddStockData,
    type InventoryEditData,
    type InventoryItem,
    type InventoryUnit,
} from "shared-utils/types/inventory";

type FormMode = "edit" | "add";

interface InventoryItemFormPanelProps {
    editingItem: InventoryItem | null;
    onSaveEdit: (data: InventoryEditData) => Promise<void> | void;
    onSaveAdd: (data: InventoryAddStockData) => Promise<void> | void;
    onCancel: () => void;
}

interface FormState {
    name: string;
    code: string;
    description: string;
    amount: number;
    unit: InventoryUnit;
}

const EMPTY_FORM: FormState = {
    name: "",
    code: "",
    description: "",
    amount: 0,
    unit: "un",
};

export function InventoryItemFormPanel({
    editingItem,
    onSaveEdit,
    onSaveAdd,
    onCancel,
}: InventoryItemFormPanelProps) {
    const mode: FormMode = editingItem !== null ? "edit" : "add";

    const initialFormData = useMemo<FormState>(() => {
        if (!editingItem) return EMPTY_FORM;
        return {
            name: editingItem.name,
            code: editingItem.code,
            description: editingItem.description ?? "",
            amount: editingItem.amount,
            unit: editingItem.unit,
        };
    }, [editingItem]);

    const [formData, setFormData] = useState<FormState>(initialFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isSaving) onCancel();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isSaving, onCancel]);

    const handleChange = (field: keyof FormState, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveError(null);

        try {
            if (mode === "edit") {
                await onSaveEdit({
                    name: formData.name,
                    code: formData.code,
                    description: formData.description,
                    amount: formData.amount,
                    unit: formData.unit,
                });
            } else {
                await onSaveAdd({
                    name: formData.name,
                    code: formData.code,
                    description: formData.description,
                    amount: formData.amount,
                    unit: formData.unit,
                });
            }
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Erro ao salvar insumo");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button
                type="button"
                aria-label="Fechar painel"
                onClick={() => {
                    if (!isSaving) onCancel();
                }}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="inventory-panel-title"
                className="relative z-10 w-full max-w-md bg-(--Widget-background) border-l border-(--Border) flex flex-col h-full shadow-2xl animate-[slideIn_0.2s_ease-out]"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-(--Border)/60">
                    <h3 id="inventory-panel-title" className="text-(--Text-primary) text-lg font-primary font-extrabold">
                        {mode === "edit" ? "Editar Insumo" : "Adicionar ou Repor Estoque"}
                    </h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="p-1.5 rounded-md text-(--Text-primary-off) hover:text-(--Text-primary) hover:bg-(--Button-background) transition-colors cursor-pointer"
                        aria-label="Fechar painel"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 px-6 py-5 flex-1 overflow-y-auto"
                >
                    <div>
                        <label
                            htmlFor="inv-name"
                            className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-1.5 block"
                        >
                            Nome do Insumo
                        </label>
                        <input
                            id="inv-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="Ex.: Leite Integral"
                            required
                            className="w-full min-h-10 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary placeholder:text-(--Text-primary-off)/45 focus:outline-none focus:border-(--Primary)"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="inv-code"
                            className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-1.5 block"
                        >
                            Código (SKU)
                        </label>
                        <input
                            id="inv-code"
                            type="text"
                            value={formData.code}
                            onChange={(e) => handleChange("code", e.target.value)}
                            placeholder="Ex.: INV-006"
                            required
                            className="w-full min-h-10 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary placeholder:text-(--Text-primary-off)/45 focus:outline-none focus:border-(--Primary)"
                        />
                        {mode === "add" && (
                            <p className="text-(--Text-primary-off)/75 text-xs font-secondary mt-1.5">
                                Se o código já existir, a quantidade informada será somada ao saldo atual.
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="inv-desc"
                            className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-1.5 block"
                        >
                            Descrição (opcional)
                        </label>
                        <textarea
                            id="inv-desc"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Observações sobre armazenamento ou fornecedor"
                            rows={3}
                            className="w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary placeholder:text-(--Text-primary-off)/45 focus:outline-none focus:border-(--Primary) resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label
                                htmlFor="inv-amount"
                                className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-1.5 block"
                            >
                                Quantidade
                            </label>
                            <input
                                id="inv-amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={(e) =>
                                    handleChange("amount", parseFloat(e.target.value) || 0)
                                }
                                placeholder="0"
                                required
                                className="w-full min-h-10 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary tabular-nums focus:outline-none focus:border-(--Primary)"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="inv-unit"
                                className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-1.5 block"
                            >
                                Unidade
                            </label>
                            <select
                                id="inv-unit"
                                value={formData.unit}
                                onChange={(e) => handleChange("unit", e.target.value)}
                                className="w-full min-h-10 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary focus:outline-none focus:border-(--Primary) cursor-pointer"
                            >
                                {INVENTORY_UNITS.map((u) => (
                                    <option key={u} value={u}>
                                        {UNIT_FULL_LABELS[u]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {saveError && (
                        <div className="rounded-md border border-(--Danger-border) bg-(--Danger-bg) px-3 py-2 text-xs text-(--Danger-text)">
                            {saveError}
                        </div>
                    )}

                    <div className="flex-1" />

                    <div className="flex gap-3 pt-4 border-t border-(--Border)/50">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="flex-1 min-h-11 px-4 py-2.5 bg-(--Button-background) text-(--Text-primary) font-primary font-bold text-xs rounded-md hover:bg-(--Select-background) disabled:opacity-50 uppercase tracking-wider cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 min-h-11 px-4 py-2.5 bg-(--Primary) text-(--Text-dark) font-primary font-extrabold text-xs rounded-md hover:bg-(--Primary-selected) disabled:opacity-60 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSaving ? (
                                <LoadingSpinner
                                    size="xs"
                                    label={mode === "edit" ? "Salvando..." : "Adicionando..."}
                                />
                            ) : mode === "edit" ? (
                                "Salvar Alterações"
                            ) : (
                                "Adicionar Estoque"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
