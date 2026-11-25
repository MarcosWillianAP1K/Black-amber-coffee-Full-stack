import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { StatusBadge } from "ui-shared/components/ui/StatusBadge";
import { formatPrice } from "shared-utils/helpers/currency";
import {
    ORDER_STATUS_LABELS,
    formatPaymentMethod,
    type Order,
} from "shared-utils/types/order";
import { ButtonOrder } from "./ButtonOrder";

const ORDER_STATUS_COLORS = {
    criado: { bg: "bg-(--Select-background)", text: "text-(--Text-primary-off)" },
    em_preparo: { bg: "bg-(--Primary)/15", text: "text-(--Primary)" },
    pronto: { bg: "bg-(--Info)/20", text: "text-(--Info)" },
    finalizado: { bg: "bg-(--Afirmation)/20", text: "text-(--Success-text)" },
    cancelado: { bg: "bg-(--Danger-bg)", text: "text-(--Danger-text)" },
};

interface CardOrderProps {
    order: Order;
    customerName?: string;
    onAction?: (orderId: number, action: string) => Promise<void>;
    isPending?: boolean;
}

function getElapsedMinutes(isoDate: string, nowMs: number): number {
    const diff = nowMs - new Date(isoDate).getTime();
    return Math.max(0, Math.floor(diff / 60_000));
}

function formatElapsed(minutes: number): string {
    if (minutes < 1) return "agora";
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return `há ${hours}h${rem > 0 ? ` ${rem}m` : ""}`;
}

export function CardOrder({ order, customerName, onAction, isPending = false }: CardOrderProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const busy = isPending || isProcessing;

    const isActive =
        order.status === "criado" || order.status === "em_preparo" || order.status === "pronto";

    useEffect(() => {
        if (!isActive) return;
        const timer = window.setInterval(() => setNowMs(Date.now()), 30_000);
        return () => window.clearInterval(timer);
    }, [isActive]);

    const elapsedMin = getElapsedMinutes(order.createdAt, nowMs);
    const urgencyBorder = !isActive
        ? "border-(--Border)/60"
        : elapsedMin >= 20
          ? "border-(--Danger-border)"
          : elapsedMin >= 10
            ? "border-(--Warning)/70"
            : "border-(--Border2)";

    const handleAction = async (action: string) => {
        setIsProcessing(true);
        try {
            await onAction?.(order.id, action);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <article
            className={`w-full h-full px-4 py-4 bg-(--Widget-background) rounded-xl border ${urgencyBorder} flex flex-col justify-between gap-4 shadow-md`}
        >
            <div className="w-full flex flex-col gap-3">
                {/* Cabeçalho: Código curto + Status + Cronômetro */}
                <div className="flex items-start justify-between gap-2 border-b border-(--Border)/40 pb-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-(--Primary-off) text-base font-primary font-extrabold tabular-nums">
                                {order.code || `Pedido #${order.id}`}
                            </h3>
                            {isActive && (
                                <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-secondary font-semibold tabular-nums ${
                                        elapsedMin >= 20
                                            ? "text-(--Danger-text)"
                                            : elapsedMin >= 10
                                              ? "text-(--Warning-text)"
                                              : "text-(--Text-primary-off)"
                                    }`}
                                >
                                    <Clock size={12} aria-hidden="true" />
                                    {formatElapsed(elapsedMin)}
                                </span>
                            )}
                        </div>
                        <p className="text-(--Text-primary-off) text-xs font-secondary mt-0.5 truncate">
                            {customerName || (order.clientId ? `Cliente #${order.clientId}` : "Balcão (Avulso)")} •{" "}
                            {formatPaymentMethod(order.paymentMethod)}
                        </p>
                    </div>

                    <StatusBadge status={order.status} colorMap={ORDER_STATUS_COLORS}>
                        {ORDER_STATUS_LABELS[order.status]}
                    </StatusBadge>
                </div>

                {/* Lista de itens */}
                {order.itens && order.itens.length > 0 && (
                    <div className="w-full flex flex-col gap-1.5">
                        {order.itens.map((item, idx) => (
                            <div
                                key={`${order.id}-${item.id}-${idx}`}
                                className="flex flex-col gap-0.5 text-sm font-secondary"
                            >
                                <div className="flex justify-between gap-2 text-(--Text-primary)">
                                    <span className="truncate">{item.name}</span>
                                    <span className="font-bold tabular-nums shrink-0 text-(--Primary-off)">
                                        x{item.quantity}
                                    </span>
                                </div>
                                {item.observation && (
                                    <span className="text-xs text-(--Warning-text) pl-2 border-l border-(--Warning)/50">
                                        {item.observation}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Observações gerais */}
                {order.observation && (
                    <div className="w-full bg-(--Page-background) border border-(--Border)/40 rounded-lg px-3 py-2">
                        <p className="text-(--Primary-off) text-[11px] font-secondary font-semibold uppercase tracking-wider">
                            Observações
                        </p>
                        <p className="text-(--Text-primary) text-xs font-secondary mt-0.5 wrap-break-word">
                            {order.observation}
                        </p>
                    </div>
                )}
            </div>

            {/* Rodapé: Total + Ação */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-(--Border)/40">
                <span className="text-(--Primary) text-base font-primary font-extrabold tabular-nums">
                    {formatPrice(order.totalPrice)}
                </span>
                <ButtonOrder
                    status={order.status}
                    onAction={handleAction}
                    disabled={busy}
                    isLoading={busy}
                />
            </div>
        </article>
    );
}
