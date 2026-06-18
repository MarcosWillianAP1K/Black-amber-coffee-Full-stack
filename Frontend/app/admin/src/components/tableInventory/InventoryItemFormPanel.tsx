/**
 * InventoryItemFormPanel — Side panel for editing or adding stock.
 *
 * - "edit" mode: pre-filled with existing item data (Name, Code, Amount, Unit).
 * - "add" mode: empty fields to add stock. If the code matches an existing product,
 *   the service will increment its stock; otherwise it creates a new inventory entry.
 */

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import type { InventoryItem, InventoryAddStockData, InventoryEditData, InventoryUnit } from "shared-utils/types/inventory";
import { INVENTORY_UNITS, UNIT_LABELS } from "shared-utils/types/inventory";

type FormMode = "edit" | "add";

interface InventoryItemFormPanelProps {
    /** The item to edit. If null, the panel is in "add stock" mode. */
    editingItem: InventoryItem | null;
    /** Called in "edit" mode. */
    onSaveEdit: (data: InventoryEditData) => void;
    /** Called in "add stock" mode. */
    onSaveAdd: (data: InventoryAddStockData) => void;
    /** Called when the user cancels / closes the panel. */
    onCancel: () => void;
}

interface FormState {
    name: string;
    code: string;
    amount: number;
    unit: InventoryUnit;
}

const EMPTY_FORM: FormState = {
    name: "",
    code: "",
    amount: 0,
    unit: "un",
};

export function InventoryItemFormPanel({editingItem,onSaveEdit,onSaveAdd,onCancel,}: InventoryItemFormPanelProps) {
    
    const mode: FormMode = editingItem !== null ? "edit" : "add";

    const initialFormData = useMemo<FormState>(() => {
        if (!editingItem) return EMPTY_FORM;
        return {
            name: editingItem.name,
            code: editingItem.code,
            amount: editingItem.amount,
            unit: editingItem.unit,
        };
    }, [editingItem]);

    const [formData, setFormData] = useState<FormState>(initialFormData);

    const handleChange = (field: keyof FormState, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "edit") {
            onSaveEdit({
                name: formData.name,
                code: formData.code,
                amount: formData.amount,
                unit: formData.unit,
            });
        } else {
            onSaveAdd({
                name: formData.name,
                code: formData.code,
                amount: formData.amount,
                unit: formData.unit,
            });
        }
    };

    return (
        <div className="w-[320px] min-w-[320px] h-fit bg-(--Widget-background) rounded-md flex flex-col animate-[slideIn_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h3 className="text-(--Text-gray) text-lg font-primary font-bold">
                    {mode === "edit" ? "Edit Item" : "Add Stock"}
                </h3>
                <button
                    onClick={onCancel}
                    className="p-1 rounded-md text-(--Text-primary-off) hover:text-(--Text-gray) hover:bg-(--Button-background) transition-colors"
                    aria-label="Close panel"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 px-6 pb-6 flex-1"
            >
                {/* Item Name */}
                <div>
                    <label className="text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-2 block">
                        Product Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter product name"
                        required
                        className="w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-gray) text-sm font-secondary placeholder:text-(--Text-primary-off)/40 focus:outline-none focus:border-(--Primary) transition-colors"
                    />
                </div>

                {/* Code */}
                <div>
                    <label className="text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-2 block">
                        Product Code
                    </label>
                    <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => handleChange("code", e.target.value)}
                        placeholder="e.g. COF-001"
                        required
                        className="w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-gray) text-sm font-secondary placeholder:text-(--Text-primary-off)/40 focus:outline-none focus:border-(--Primary) transition-colors"
                    />
                    {mode === "add" && (
                        <p className="text-(--Text-primary-off)/50 text-[10px] font-secondary mt-1">
                            If code matches an existing product, stock will be added to it.
                        </p>
                    )}
                </div>

                {/* Amount + Unit (side by side) */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-2 block">
                            Amount
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.amount || ""}
                            onChange={(e) =>
                                handleChange("amount", parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            required
                            className="w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-gray) text-sm font-secondary placeholder:text-(--Text-primary-off)/40 focus:outline-none focus:border-(--Primary) transition-colors"
                        />
                    </div>

                    <div className="w-28">
                        <label className="text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-2 block">
                            Unit
                        </label>
                        <select
                            value={formData.unit}
                            onChange={(e) => handleChange("unit", e.target.value)}
                            className="w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-gray) text-sm font-secondary focus:outline-none focus:border-(--Primary) transition-colors cursor-pointer appearance-none"
                        >
                            {INVENTORY_UNITS.map((u) => (
                                <option key={u} value={u}>
                                    {UNIT_LABELS[u]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-(--Button-background) text-(--Text-gray) font-primary font-bold text-sm rounded-md hover:bg-(--Select-background) transition-colors uppercase tracking-wide"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 bg-(--Primary) text-(--Text-dark) font-primary font-bold text-sm rounded-md hover:bg-(--Primary-selected) transition-colors uppercase tracking-wide"
                    >
                        {mode === "edit" ? "Save Changes" : "Add Stock"}
                    </button>
                </div>
            </form>
        </div>
    );
}
