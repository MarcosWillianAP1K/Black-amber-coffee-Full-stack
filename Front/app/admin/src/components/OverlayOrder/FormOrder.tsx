
import { useMemo, useState } from "react";
import { MOCK_PRODUCTS } from "shared-utils/MockBD.js";

/** Simplified form data for creating a new order via the overlay form */
export interface FormOrderData {
    observation: string;
    totalAmount: number;
    items: Array<{ productId: number; quantity: number; unitPrice: number }>;
}

interface FormOrderProps {
    onClose: () => void;
    onSave: (data: FormOrderData) => void;
}

interface FormOrderState {
    observation: string;
}

interface OrderItemRow {
    id: string;
    productId: number | "";
    qty: number;
}

const EMPTY_FORM: FormOrderState = {
    observation: "",
};

const MENU_BY_ID = new Map(
    MOCK_PRODUCTS.map((item) => [item.id, item])
);

const MENU_OPTIONS = MOCK_PRODUCTS.map((item) => ({ id: item.id, name: item.name, price: item.price }));

function createItemRow(): OrderItemRow {
    return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        productId: "",
        qty: 1,
    };
}

export function FormOrder({ onClose, onSave }: FormOrderProps) {
    const [form, setForm] = useState<FormOrderState>(EMPTY_FORM);
    const [items, setItems] = useState<OrderItemRow[]>([createItemRow()]);
    const [error, setError] = useState("");

    const total = useMemo(() => {
        return items.reduce((sum, item) => {
            const product = typeof item.productId === "number" ? MENU_BY_ID.get(item.productId) : undefined;
            const price = product?.price ?? 0;
            const qty = Number.isFinite(item.qty) ? item.qty : 0;
            return sum + price * qty;
        }, 0);
    }, [items]);

    const handleAddItem = () => {
        setItems((prev) => [...prev, createItemRow()]);
    };

    const handleRemoveItem = (index: number) => {
        setItems((prev) => {
            if (prev.length <= 1) {
                return [createItemRow()];
            }
            return prev.filter((_, itemIndex) => itemIndex !== index);
        });
    };

    const handleItemChange = (index: number, field: keyof OrderItemRow, value: string | number) => {
        setItems((prev) =>
            prev.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item
            )
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanedItems = items.filter((item) => typeof item.productId === "number" && item.qty > 0);
        if (cleanedItems.length === 0) {
            setError("Add at least one valid item.");
            return;
        }

        setError("");

        const orderItems = cleanedItems.map((row) => {
            const product = MENU_BY_ID.get(row.productId as number);
            return {
                productId: row.productId as number,
                quantity: row.qty,
                unitPrice: product?.price ?? 0,
            };
        });

        onSave({
            observation: form.observation,
            totalAmount: total,
            items: orderItems,
        });

        setForm(EMPTY_FORM);
        setItems([createItemRow()]);
        onClose();
    };

    return (

        <div className="w-full max-w-130 bg-(--Widget-background) border border-(--Border) rounded-lg shadow-lg">

            <div className="flex items-center justify-between px-6 py-4 border-b border-(--Border)">
                <h3 className="text-(--Text-gray) text-lg font-primary font-bold">
                    Register New Order
                </h3>

                <button
                    onClick={onClose}
                    className="text-(--Text-primary-off) hover:text-(--Text-gray) transition-colors"
                    aria-label="Close overlay"
                >
                    Close
                </button>

            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

                <div>
                    <label className="text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-2 block">
                        Items
                    </label>
                    <div className="flex flex-col gap-3">

                        {items.map((item, index) => (
                            <div key={item.id} className="flex gap-3 items-center">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="w-8 h-8 flex items-center justify-center rounded-md border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors"
                                    aria-label="Remove item"
                                    title="Remove item"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4h8v2" />
                                        <path d="M6 6l1 14h10l1-14" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                    </svg>
                                </button>
                                <select
                                    value={item.productId === "" ? "" : String(item.productId)}
                                    onChange={(e) => handleItemChange(index, "productId", e.target.value === "" ? "" : Number(e.target.value))}
                                    className="flex-1 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-gray) text-sm font-secondary focus:outline-none focus:border-(--Primary) transition-colors"
                                >
                                    <option value="">Select an item</option>
                                    {MENU_OPTIONS.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.name} — ${opt.price.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min={1}
                                    value={item.qty}
                                    onChange={(e) => handleItemChange(index, "qty", Number(e.target.value))}
                                    className="w-24 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-gray) text-sm font-secondary focus:outline-none focus:border-(--Primary) transition-colors"
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="mt-2 text-(--Text-primary-off) hover:text-(--Primary) text-sm font-secondary"
                    >
                        Add Item
                    </button>
                    {error && (
                        <p className="mt-2 text-[12px] text-red-500 font-secondary">
                            {error}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-2 block">
                        Total
                    </label>
                    <h1 className="text-(--Primary-off) text-[16px] font-secondary font-bold tracking-wider uppercase ">${total.toFixed(2)}</h1>
                </div>

                <div>
                    <label className="text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-2 block">
                        Observations
                    </label>
                    <textarea
                        value={form.observation}
                        onChange={(e) => setForm((prev) => ({ ...prev, observation: e.target.value }))}
                        placeholder="Notes for the order"
                        rows={3}
                        className="w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-gray) text-sm font-secondary placeholder:text-(--Text-primary-off)/40 focus:outline-none focus:border-(--Primary) transition-colors resize-none"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-(--Border) text-(--Text-primary-off) hover:text-(--Text-gray) transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-md bg-(--Primary) text-(--Text-dark) font-primary font-semibold hover:bg-(--Primary-selected) transition-colors"
                    >
                        Save Order
                    </button>
                </div>
            </form>
        </div>



    );

}