import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TicketPlus } from "lucide-react";
import { ProductCart } from "../../components/ProductCart";
import { SummaryCart } from "../../components/SummaryCart";
import { useCart } from "../../hooks/useCart";
import { simulatePayment } from "../../services/paymentService.ts";
import { APP_ROUTES } from "../../utils/Path";

export function Cart() {
    const navigate = useNavigate();
    const {
        items,
        count,
        subtotal,
        discount,
        observation,
        setObservation,
        increment,
        decrement,
        clear,
        isLoading,
        error: cartError,
    } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const handleCompletePurchase = async () => {
        if (items.length === 0) return;

        setIsSubmitting(true);
        setCheckoutError(null);
        try {
            await simulatePayment({
                paymentMethod: "pix",
                observation: observation.trim() || null,
            });
            await clear();
            navigate(APP_ROUTES.HOME);
        } catch (err) {
            setCheckoutError(err instanceof Error ? err.message : "Falha ao finalizar pedido");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <p className="text-(--Text-primary-off) text-sm font-secondary">Carregando carrinho...</p>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto gap-6 flex flex-col pb-8">
            <h1 className="text-(--Text-gray) text-2xl font-primary font-bold uppercase">Carrinho</h1>

            {items.length === 0 ? (
                <p className="text-(--Text-primary-off) text-sm font-secondary">Seu carrinho está vazio.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {items.map((item) => (
                        <ProductCart
                            key={item.productId}
                            name={item.name}
                            price={item.price}
                            imageUrl={item.imgUrl ?? undefined}
                            quantity={item.quantity}
                            onAdd={() => increment(item.productId)}
                            onRemove={() => decrement(item.productId)}
                        />
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <span className="text-(--Text-primary-off) text-xs font-secondary">Observações</span>
                    <span className="text-(--Text-primary-off) text-[10px] font-secondary">
                        {observation.length}/500 Caracteres
                    </span>
                </div>
                <textarea
                    value={observation}
                    onChange={(e) => setObservation(e.target.value.slice(0, 500))}
                    placeholder="Escreva algo importante para nós..."
                    className="w-full min-h-28 p-4 bg-(--Widget-background) border border-(--Border)/30 rounded-md text-(--Text-gray) text-sm font-secondary resize-none focus:outline-none focus:border-(--Primary)"
                />
            </div>

            <div className="flex items-center justify-between p-4 bg-(--Widget-background) rounded-md border border-(--Border)/30">
                <div className="flex items-center gap-2 text-(--Primary)">
                    <TicketPlus size={18} />
                    <span className="text-sm font-secondary">Adicionar cupom de desconto</span>
                </div>
                <button
                    type="button"
                    className="w-8 h-8 bg-(--Button-background) rounded-sm flex items-center justify-center text-(--Text-gray) text-lg"
                    aria-label="Add coupon"
                >
                    +
                </button>
            </div>

            {(cartError || checkoutError) && (
                <p className="text-(--Negacion) text-sm font-secondary">{checkoutError ?? cartError}</p>
            )}

            <SummaryCart
                itemsCount={count}
                subTotal={subtotal}
                discount={discount}
                onCompletePurchase={handleCompletePurchase}
            />

            {isSubmitting && (
                <p className="text-(--Text-primary-off) text-xs text-center font-secondary">
                    Processando pagamento...
                </p>
            )}
        </div>
    );
}
