import { useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import { formatPrice } from "shared-utils/helpers/currency";
import type { Product } from "shared-utils/types/product";
import {
    PAYMENT_METHODS,
    PAYMENT_METHOD_LABELS,
    type PaymentMethod,
} from "shared-utils/types/order";
import { useCustomerStore } from "../../stores/useCustomerStore";

export interface FormOrderData {
    clientPublicId?: string;
    observation: string;
    totalPrice: number;
    paymentMethod: PaymentMethod;
    items: Array<{ productId: number; quantity: number; unitPrice: number; name?: string }>;
}

interface FormOrderProps {
    onClose: () => void;
    onSave: (data: FormOrderData) => Promise<void>;
    products: Product[];
}

interface FormOrderState {
    clientPublicId: string;
    isGuest: boolean;
    observation: string;
    paymentMethod: PaymentMethod;
}

interface OrderItemRow {
    id: string;
    productId: number | "";
    qty: number;
}

const EMPTY_FORM: FormOrderState = {
    clientPublicId: "",
    isGuest: true,
    observation: "",
    paymentMethod: "dinheiro",
};

function createItemRow(): OrderItemRow {
    return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        productId: "",
        qty: 1,
    };
}

export function FormOrder({ onClose, onSave, products }: FormOrderProps) {
    const customers = useCustomerStore((s) => s.customers);
    const menuById = useMemo(() => new Map(products.map((item) => [item.id, item])), [products]);
    const menuOptions = useMemo(
        () =>
            products
                .filter((item) => item.isActive)
                .map((item) => ({ id: item.id, name: item.name, price: item.price })),
        [products],
    );

    const [form, setForm] = useState<FormOrderState>(EMPTY_FORM);
    const [items, setItems] = useState<OrderItemRow[]>([createItemRow()]);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const total = useMemo(() => {
        return items.reduce((sum, item) => {
            const product = typeof item.productId === "number" ? menuById.get(item.productId) : undefined;
            const price = product?.price ?? 0;
            const qty = Number.isFinite(item.qty) ? item.qty : 0;
            return sum + price * qty;
        }, 0);
    }, [items, menuById]);

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
                itemIndex === index ? { ...item, [field]: value } : item,
            ),
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanedItems = items.filter((item) => typeof item.productId === "number" && item.qty > 0);
        if (cleanedItems.length === 0) {
            setError("Selecione ao menos um produto válido para o pedido.");
            return;
        }

        if (!form.isGuest && !form.clientPublicId) {
            setError("Selecione um cliente cadastrado ou marque Pedido no Balcão.");
            return;
        }

        setError("");
        setIsSaving(true);

        const orderItems = cleanedItems.map((row) => {
            const product = menuById.get(row.productId as number);
            return {
                productId: row.productId as number,
                quantity: row.qty,
                unitPrice: product?.price ?? 0,
                name: product?.name ?? `Produto #${row.productId}`,
            };
        });

        try {
            await onSave({
                clientPublicId: form.isGuest ? undefined : form.clientPublicId || undefined,
                observation: form.observation,
                totalPrice: total,
                paymentMethod: form.paymentMethod,
                items: orderItems,
            });

            setForm(EMPTY_FORM);
            setItems([createItemRow()]);
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Falha ao registrar pedido.";
            setError(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-order-title"
            className="w-full max-w-xl bg-(--Widget-background) border border-(--Border) rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
            <div className="flex items-center justify-between px-6 py-4 border-b border-(--Border)">
                <h3 id="form-order-title" className="text-(--Text-primary) text-lg font-primary font-extrabold">
                    Registrar Pedido no Balcão
                </h3>

                <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-md text-(--Text-primary-off) hover:text-(--Text-primary) hover:bg-(--Button-background) transition-colors cursor-pointer"
                    aria-label="Fechar janela"
                >
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
                <div>
                    <label
                        htmlFor="order-customer-select"
                        className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-2 block"
                    >
                        Cliente
                    </label>
                    <select
                        id="order-customer-select"
                        value={form.clientPublicId}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                clientPublicId: e.target.value,
                                isGuest: e.target.value === "",
                            }))
                        }
                        disabled={form.isGuest}
                        className="w-full min-h-10 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary focus:outline-none focus:border-(--Primary) disabled:opacity-50"
                    >
                        <option value="">Selecione um cliente cadastrado...</option>
                        {customers.map((c) => (
                            <option key={c.publicId} value={c.publicId}>
                                {c.fullName} ({c.email})
                            </option>
                        ))}
                    </select>

                    <div className="mt-2.5 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isGuest"
                            checked={form.isGuest}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    isGuest: e.target.checked,
                                    clientPublicId: e.target.checked ? "" : prev.clientPublicId,
                                }))
                            }
                            className="w-4 h-4 accent-(--Primary)"
                        />
                        <label htmlFor="isGuest" className="text-(--Text-gray) text-sm font-secondary cursor-pointer">
                            Pedido de balcão / visitante (sem vínculo de conta)
                        </label>
                    </div>
                </div>

                <div>
                    <span className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-2 block">
                        Itens do Pedido
                    </span>
                    <div className="flex flex-col gap-2.5">
                        {items.map((item, index) => (
                            <div key={item.id} className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="w-9 h-9 flex items-center justify-center rounded-md border border-(--Danger-border) bg-(--Danger-bg) text-(--Danger-text) hover:bg-(--Negacion) hover:text-white transition-colors shrink-0 cursor-pointer"
                                    aria-label="Remover item"
                                >
                                    <Trash2 size={15} />
                                </button>
                                <select
                                    value={item.productId === "" ? "" : String(item.productId)}
                                    onChange={(e) =>
                                        handleItemChange(
                                            index,
                                            "productId",
                                            e.target.value === "" ? "" : Number(e.target.value),
                                        )
                                    }
                                    className="flex-1 min-w-44 min-h-9 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary focus:outline-none focus:border-(--Primary)"
                                >
                                    <option value="">Selecione um produto...</option>
                                    {menuOptions.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.name} — {formatPrice(opt.price)}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min={1}
                                    value={item.qty}
                                    onChange={(e) => handleItemChange(index, "qty", Number(e.target.value))}
                                    aria-label="Quantidade"
                                    className="w-20 min-h-9 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary tabular-nums focus:outline-none focus:border-(--Primary)"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="mt-2.5 text-(--Primary) hover:text-(--Primary-selected) text-xs font-primary font-bold uppercase tracking-wider cursor-pointer"
                    >
                        + Adicionar outro item
                    </button>

                    {error && (
                        <p className="mt-2 text-xs text-(--Danger-text) font-secondary">{error}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                        <label
                            htmlFor="order-payment-select"
                            className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-2 block"
                        >
                            Forma de Pagamento
                        </label>
                        <select
                            id="order-payment-select"
                            value={form.paymentMethod}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    paymentMethod: e.target.value as PaymentMethod,
                                }))
                            }
                            className="w-full min-h-10 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary focus:outline-none focus:border-(--Primary)"
                        >
                            {PAYMENT_METHODS.map((method) => (
                                <option key={method} value={method}>
                                    {PAYMENT_METHOD_LABELS[method]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="rounded-lg bg-(--Page-background) border border-(--Border)/60 px-4 py-2.5 flex items-center justify-between">
                        <span className="text-xs font-secondary font-bold uppercase text-(--Text-primary-off)">
                            Total
                        </span>
                        <span className="text-lg font-primary font-extrabold text-(--Primary) tabular-nums">
                            {formatPrice(total)}
                        </span>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="order-obs"
                        className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-2 block"
                    >
                        Observações
                    </label>
                    <textarea
                        id="order-obs"
                        value={form.observation}
                        onChange={(e) => setForm((prev) => ({ ...prev, observation: e.target.value }))}
                        placeholder="Observações de preparo ou retirada"
                        rows={2}
                        className="w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary placeholder:text-(--Text-primary-off)/45 focus:outline-none focus:border-(--Primary) resize-none"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-(--Border)/50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="min-h-10 px-4 py-2 rounded-md border border-(--Border) text-(--Text-primary-off) hover:text-(--Text-primary) text-xs font-primary font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="min-h-10 px-5 py-2 rounded-md bg-(--Primary) text-(--Text-dark) text-xs font-primary font-extrabold uppercase tracking-wider hover:bg-(--Primary-selected) disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isSaving ? <LoadingSpinner size="xs" label="Salvando..." /> : "Criar Pedido"}
                    </button>
                </div>
            </form>
        </div>
    );
}
