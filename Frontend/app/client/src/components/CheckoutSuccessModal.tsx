import { CheckCircle2 } from "lucide-react";
import { formatPrice } from "shared-utils/helpers/currency";
import { formatPaymentMethod } from "shared-utils/types/order";

interface CheckoutSuccessModalProps {
    isOpen: boolean;
    orderCode: string;
    totalAmount: number;
    paymentMethod: string;
    onGoHome: () => void;
    onGoAccount: () => void;
}

export function CheckoutSuccessModal({
    isOpen,
    orderCode,
    totalAmount,
    paymentMethod,
    onGoHome,
    onGoAccount,
}: CheckoutSuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="checkout-success-title"
                className="relative w-full max-w-md rounded-xl border border-(--Border) bg-(--Widget-background) p-6 shadow-2xl flex flex-col items-center text-center gap-5 animate-[fadeSlideUp_0.2s_ease-out]"
            >
                <div className="w-14 h-14 rounded-full bg-(--Afirmation)/15 border border-(--Afirmation)/40 flex items-center justify-center text-(--Success-text)">
                    <CheckCircle2 size={30} />
                </div>

                <div>
                    <h2
                        id="checkout-success-title"
                        className="text-xl font-primary font-extrabold text-(--Text-primary)"
                    >
                        Pedido Confirmado!
                    </h2>
                    <p className="mt-1.5 text-sm font-secondary text-(--Text-primary-off)">
                        Sua solicitação foi enviada para nossa equipe iniciar o preparo.
                    </p>
                </div>

                <div className="w-full rounded-lg border border-(--Border)/60 bg-(--Page-background) p-4 flex flex-col gap-2 text-sm font-secondary">
                    <div className="flex justify-between">
                        <span className="text-(--Text-primary-off)">Código do pedido</span>
                        <span className="text-(--Primary) font-primary font-bold">{orderCode}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-(--Text-primary-off)">Forma de pagamento</span>
                        <span className="text-(--Text-primary) font-medium">
                            {formatPaymentMethod(paymentMethod)}
                        </span>
                    </div>
                    <div className="flex justify-between border-t border-(--Border)/40 pt-2">
                        <span className="text-(--Text-primary-off)">Valor pago</span>
                        <span className="text-(--Text-primary) font-primary font-bold tabular-nums">
                            {formatPrice(totalAmount)}
                        </span>
                    </div>
                </div>

                <div className="w-full flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onGoAccount}
                        className="flex-1 min-h-11 px-4 py-2.5 rounded-md border border-(--Border) text-(--Text-primary) hover:border-(--Primary) text-xs font-primary font-bold uppercase tracking-wider cursor-pointer transition-colors"
                    >
                        Meus Pedidos
                    </button>
                    <button
                        type="button"
                        onClick={onGoHome}
                        className="flex-1 min-h-11 px-4 py-2.5 rounded-md bg-(--Primary) hover:bg-(--Primary-selected) text-(--Text-dark) text-xs font-primary font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
                    >
                        Acompanhar na Home
                    </button>
                </div>
            </div>
        </div>
    );
}
