import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, CreditCard, QrCode, ShoppingBag, Wallet } from "lucide-react";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import { useToastStore } from "shared-utils/stores/useToastStore";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from "shared-utils/types/order";
import { ProductCart } from "../../components/ProductCart";
import { SummaryCart } from "../../components/SummaryCart";
import { CheckoutSuccessModal } from "../../components/CheckoutSuccessModal";
import { useCart } from "../../hooks/useCart";
import { useClientOrderStore } from "../../stores/useClientOrderStore";
import { simulatePayment } from "../../services/paymentService.ts";
import { APP_ROUTES } from "../../utils/Path";

const PAYMENT_ICONS: Record<PaymentMethod, typeof QrCode> = {
    pix: QrCode,
    cartao_credito: CreditCard,
    cartao_debito: Wallet,
    dinheiro: Banknote,
};

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
        removeItem,
        clear,
        isLoading,
        pendingProductIds,
        error: cartError,
    } = useCart();
    const showToast = useToastStore((s) => s.showToast);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [completedOrder, setCompletedOrder] = useState<{
        code: string;
        total: number;
        method: string;
    } | null>(null);

    const handleCompletePurchase = async () => {
        if (items.length === 0) return;

        setIsSubmitting(true);
        setCheckoutError(null);
        try {
            const response = await simulatePayment({
                paymentMethod,
                observation: observation.trim() || null,
            });
            const createdOrder = response.data.order;
            await clear();
            await useClientOrderStore.getState().refresh();
            setCompletedOrder({
                code: createdOrder.code || `#${createdOrder.id}`,
                total: createdOrder.totalPrice ?? subtotal - discount,
                method: paymentMethod,
            });
            showToast({
                variant: "success",
                title: "Pedido enviado!",
                description: `Código ${createdOrder.code}`,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Falha ao finalizar pedido.";
            setCheckoutError(message);
            showToast({
                variant: "error",
                title: "Erro ao concluir pagamento",
                description: message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto flex items-center gap-2 text-(--Text-primary-off) text-sm font-secondary py-8">
                <LoadingSpinner size="sm" className="text-(--Primary)" />
                <span>Carregando carrinho...</span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-primary font-extrabold text-(--Text-primary) uppercase">
                        Carrinho
                    </h1>
                    <p className="text-sm font-secondary text-(--Text-primary-off) mt-1">
                        Revise seus itens e escolha a forma de pagamento
                    </p>
                </div>

                {items.length > 0 && (
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => void clear()}
                        className="text-xs font-secondary font-semibold text-(--Danger-text) hover:underline cursor-pointer disabled:opacity-50"
                    >
                        Esvaziar carrinho
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="rounded-xl border border-(--Border)/60 bg-(--Widget-background) p-8 sm:p-12 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-(--Primary)/10 border border-(--Primary)/25 flex items-center justify-center text-(--Primary)">
                        <ShoppingBag size={26} />
                    </div>
                    <div>
                        <h2 className="text-lg font-primary font-bold text-(--Text-primary)">
                            Seu carrinho está vazio
                        </h2>
                        <p className="text-sm font-secondary text-(--Text-primary-off) mt-1">
                            Explore nossos cafés especiais, lanches e bebidas para montar seu pedido.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(APP_ROUTES.MENU)}
                        className="min-h-11 px-5 py-2.5 rounded-lg bg-(--Primary) hover:bg-(--Primary-selected) text-(--Text-dark) font-primary font-extrabold text-xs uppercase tracking-wider cursor-pointer transition-colors"
                    >
                        Explorar Cardápio
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
                    <div className="flex flex-col gap-6 min-w-0">
                        <div className="flex flex-col gap-3">
                            {items.map((item) => (
                                <ProductCart
                                    key={item.productId}
                                    name={item.name}
                                    category={item.category}
                                    price={item.price}
                                    imageUrl={item.imgUrl ?? undefined}
                                    observation={item.observation}
                                    quantity={item.quantity}
                                    onAdd={() => void increment(item.productId)}
                                    onRemove={() => void decrement(item.productId)}
                                    onDeleteItem={() => void removeItem(item.productId)}
                                    isLoading={Boolean(pendingProductIds[item.productId])}
                                    disabled={isSubmitting}
                                />
                            ))}
                        </div>

                        <div className="rounded-xl border border-(--Border)/60 bg-(--Widget-background) p-5 flex flex-col gap-3">
                            <span className="text-xs font-secondary font-bold uppercase tracking-wider text-(--Primary-off)">
                                Forma de Pagamento
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {PAYMENT_METHODS.map((method) => {
                                    const Icon = PAYMENT_ICONS[method];
                                    const isSelected = paymentMethod === method;
                                    return (
                                        <button
                                            key={method}
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`min-h-14 p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                                                isSelected
                                                    ? "border-(--Primary) bg-(--Primary)/15 text-(--Primary)"
                                                    : "border-(--Border)/50 bg-(--Page-background) text-(--Text-primary-off) hover:border-(--Primary)/40 hover:text-(--Text-primary)"
                                            }`}
                                        >
                                            <Icon size={18} aria-hidden="true" />
                                            <span className="text-xs font-secondary font-semibold leading-tight">
                                                {PAYMENT_METHOD_LABELS[method]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-xl border border-(--Border)/60 bg-(--Widget-background) p-5 flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label
                                    htmlFor="cart-observation"
                                    className="text-(--Primary-off) text-xs font-secondary font-bold uppercase tracking-wider"
                                >
                                    Observações Gerais do Pedido
                                </label>
                                <span className="text-(--Text-primary-off) text-xs font-secondary tabular-nums">
                                    {observation.length}/500
                                </span>
                            </div>
                            <textarea
                                id="cart-observation"
                                value={observation}
                                onChange={(e) => setObservation(e.target.value.slice(0, 500))}
                                placeholder="Ex.: retirar para viagem, guardanapos extras, troco..."
                                className="w-full min-h-24 p-3.5 bg-(--Page-background) border border-(--Border)/60 rounded-lg text-(--Text-primary) text-sm font-secondary resize-none focus:outline-none focus:border-(--Primary)"
                            />
                        </div>

                        {(cartError || checkoutError) && (
                            <div
                                role="alert"
                                className="rounded-md border border-(--Danger-border) bg-(--Danger-bg) px-4 py-3 text-sm font-secondary text-(--Danger-text)"
                            >
                                {checkoutError ?? cartError}
                            </div>
                        )}
                    </div>

                    <aside className="lg:sticky lg:top-4">
                        <SummaryCart
                            itemsCount={count}
                            subTotal={subtotal}
                            discount={discount}
                            ctaLabel="Confirmar e Pagar"
                            loadingLabel="Processando pagamento..."
                            onCompletePurchase={() => void handleCompletePurchase()}
                            isLoading={isSubmitting}
                            disabled={items.length === 0}
                        />
                    </aside>
                </div>
            )}

            <CheckoutSuccessModal
                isOpen={completedOrder !== null}
                orderCode={completedOrder?.code ?? ""}
                totalAmount={completedOrder?.total ?? 0}
                paymentMethod={completedOrder?.method ?? paymentMethod}
                onGoHome={() => {
                    setCompletedOrder(null);
                    navigate(APP_ROUTES.HOME);
                }}
                onGoAccount={() => {
                    setCompletedOrder(null);
                    navigate(APP_ROUTES.ACCOUNT);
                }}
            />
        </div>
    );
}
