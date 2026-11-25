import { useMemo, useState } from "react";
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { CardAnalytics } from "ui-shared/components/CardAnalytics";
import { ChartAnalytics } from "ui-shared/components/ChartAnalytics";
import { ErrorState } from "../../components/ui/ErrorState";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useOrders } from "../../hooks/useOrders";
import { useEmployee } from "../../hooks/useEmployee";
import { useMenuItems } from "../../hooks/useMenuItems";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import { formatPrice } from "shared-utils/helpers/currency";
import {
    ORDER_STATUSES,
    ORDER_STATUS_LABELS,
    formatPaymentMethod,
} from "shared-utils/types/order";
import { PRODUCT_CATEGORY_LABELS, type ProductCategory } from "shared-utils/types/product";
import { Award, CheckCircle2, CreditCard, TrendingUp, XCircle } from "lucide-react";

type PeriodFilter = "all" | "7d" | "30d" | "year";

const PERIOD_OPTIONS: ReadonlyArray<{ key: PeriodFilter; label: string }> = [
    { key: "all", label: "Todo o período" },
    { key: "7d", label: "Últimos 7 dias" },
    { key: "30d", label: "Últimos 30 dias" },
    { key: "year", label: "Este ano" },
];

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-(--Border)/60 ${className ?? ""}`} />;
}

export function Analytics() {
    const {
        orders,
        isLoading: ordersLoading,
        error: ordersError,
        refresh: refreshOrders,
    } = useOrders();
    const {
        employees,
        isLoading: employeesLoading,
        error: employeesError,
        refresh: refreshEmployees,
    } = useEmployee();
    const {
        items: products,
        isLoading: menuLoading,
        error: menuError,
        refresh: refreshMenu,
    } = useMenuItems();
    const { items: inventoryItems, isLoading: inventoryLoading } = useInventoryItems();

    const [period, setPeriod] = useState<PeriodFilter>("all");
    const [nowMs] = useState(() => Date.now());

    const filteredOrders = useMemo(() => {
        if (period === "all") return orders;
        const currentYear = new Date(nowMs).getFullYear();

        return orders.filter((order) => {
            const created = new Date(order.createdAt);
            if (period === "7d") {
                return nowMs - created.getTime() <= 7 * 24 * 60 * 60 * 1000;
            }
            if (period === "30d") {
                return nowMs - created.getTime() <= 30 * 24 * 60 * 60 * 1000;
            }
            return created.getFullYear() === currentYear;
        });
    }, [orders, period, nowMs]);

    const { data } = useAnalytics({
        orders: filteredOrders,
        employees,
        products,
        inventory: inventoryItems,
    });

    const insights = useMemo(() => {
        const completedOrders = filteredOrders.filter((o) => o.status === "finalizado");
        const cancelledOrders = filteredOrders.filter((o) => o.status === "cancelado");
        const completedRevenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
        const avgTicket = completedOrders.length > 0 ? completedRevenue / completedOrders.length : 0;
        const completionRate =
            filteredOrders.length > 0 ? (completedOrders.length / filteredOrders.length) * 100 : 0;

        // Mapa produto -> categoria
        const categoryByProduct = new Map<string, string>();
        for (const p of products) {
            categoryByProduct.set(p.name.toLowerCase(), p.category);
        }

        // Top Produtos & Receita por Categoria
        const productStats = new Map<string, { name: string; qty: number; revenue: number }>();
        const categoryStats = new Map<string, { category: string; revenue: number; qty: number }>();

        for (const order of filteredOrders) {
            if (order.status === "cancelado") continue;
            for (const item of order.itens) {
                const lineRevenue = item.price * item.quantity;
                const existingProd = productStats.get(item.name) ?? {
                    name: item.name,
                    qty: 0,
                    revenue: 0,
                };
                existingProd.qty += item.quantity;
                existingProd.revenue += lineRevenue;
                productStats.set(item.name, existingProd);

                const catKey = categoryByProduct.get(item.name.toLowerCase()) ?? "outro";
                const existingCat = categoryStats.get(catKey) ?? {
                    category: catKey,
                    revenue: 0,
                    qty: 0,
                };
                existingCat.revenue += lineRevenue;
                existingCat.qty += item.quantity;
                categoryStats.set(catKey, existingCat);
            }
        }

        const topProducts = Array.from(productStats.values())
            .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
            .slice(0, 5);
        const maxProductQty = Math.max(1, ...topProducts.map((p) => p.qty));

        const categoriesRevenue = Array.from(categoryStats.values()).sort(
            (a, b) => b.revenue - a.revenue,
        );
        const totalCatRevenue = Math.max(
            1,
            categoriesRevenue.reduce((sum, c) => sum + c.revenue, 0),
        );

        // Distribuição por Forma de Pagamento
        const paymentMap = new Map<string, { method: string; count: number; total: number }>();
        for (const order of filteredOrders) {
            if (order.status === "cancelado") continue;
            const key = order.paymentMethod ?? "nao_informado";
            const entry = paymentMap.get(key) ?? { method: key, count: 0, total: 0 };
            entry.count += 1;
            entry.total += order.totalPrice;
            paymentMap.set(key, entry);
        }
        const paymentBreakdown = Array.from(paymentMap.values()).sort((a, b) => b.count - a.count);

        // Funil de Status
        const statusCounts = ORDER_STATUSES.map((st) => ({
            status: st,
            label: ORDER_STATUS_LABELS[st],
            count: filteredOrders.filter((o) => o.status === st).length,
        }));

        return {
            completedRevenue,
            avgTicket,
            completionRate,
            cancelledCount: cancelledOrders.length,
            topProducts,
            maxProductQty,
            categoriesRevenue,
            totalCatRevenue,
            paymentBreakdown,
            statusCounts,
        };
    }, [filteredOrders, products]);

    const isLoading = ordersLoading || employeesLoading || menuLoading || inventoryLoading;
    const anyError = ordersError || employeesError || menuError;

    if (anyError && !isLoading) {
        return (
            <div className="w-full flex flex-col gap-6 pb-8">
                <DestakTitle
                    title="Análises"
                    subtitle="Indicadores financeiros, produtos líderes e desempenho operacional"
                />
                <div className="w-full bg-(--Widget-background) rounded-lg border border-(--Border) p-5">
                    <ErrorState
                        message={ordersError || employeesError || menuError || "Falha ao carregar análises"}
                        onRetry={() => {
                            if (ordersError) void refreshOrders();
                            if (employeesError) void refreshEmployees();
                            if (menuError) void refreshMenu();
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6 pb-8">
            <div className="w-full flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <DestakTitle
                    title="Análises"
                    subtitle="Indicadores financeiros, produtos líderes e desempenho operacional"
                />

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {PERIOD_OPTIONS.map((opt) => (
                        <button
                            key={opt.key}
                            type="button"
                            onClick={() => setPeriod(opt.key)}
                            className={`min-h-9 px-3.5 py-1.5 rounded-lg text-xs font-primary font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                period === opt.key
                                    ? "bg-(--Primary) text-(--Text-dark)"
                                    : "bg-(--Widget-background) border border-(--Border)/60 text-(--Text-primary-off) hover:text-(--Text-primary)"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPIs Financeiros Reais */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-29 px-5 py-4 bg-(--Widget-background) rounded-lg border border-(--Border)"
                        >
                            <Skeleton className="h-4 w-28 mb-3" />
                            <Skeleton className="h-7 w-24" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <CardAnalytics
                        title="Receita Finalizada"
                        value={formatPrice(insights.completedRevenue)}
                        deltaLabel={`${filteredOrders.length} pedidos no filtro`}
                        icon={<TrendingUp className="w-5 h-5" />}
                        iconBgClassName="bg-(--Afirmation) text-white"
                    />
                    <CardAnalytics
                        title="Ticket Médio"
                        value={formatPrice(insights.avgTicket)}
                        deltaLabel="Por pedido entregue"
                        icon={<CreditCard className="w-5 h-5" />}
                        iconBgClassName="bg-(--Primary) text-(--Text-dark)"
                    />
                    <CardAnalytics
                        title="Taxa de Conclusão"
                        value={`${insights.completionRate.toFixed(0)}%`}
                        deltaLabel="Pedidos finalizados"
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        iconBgClassName="bg-(--Info)/20 text-(--Info)"
                    />
                    <CardAnalytics
                        title="Pedidos Cancelados"
                        value={insights.cancelledCount}
                        deltaLabel="No período selecionado"
                        icon={<XCircle className="w-5 h-5" />}
                        iconBgClassName="bg-(--Danger-bg) text-(--Danger-text)"
                    />
                </div>
            )}

            {/* Gráfico de Tendência */}
            {!isLoading && data?.chart && (
                <ChartAnalytics
                    title={data.chart.title}
                    data={data.chart.data}
                    labels={data.chart.labels}
                    seriesLabel={data.chart.seriesLabel}
                />
            )}

            {/* Grid Analítico Inferior */}
            {!isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top 5 Produtos Mais Vendidos */}
                    <section className="rounded-lg border border-(--Border) bg-(--Widget-background) p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-(--Border)/60 pb-3">
                            <h2 className="text-base font-primary font-extrabold text-(--Primary-off)">
                                Produtos Mais Vendidos
                            </h2>
                            <Award size={18} className="text-(--Primary)" />
                        </div>

                        {insights.topProducts.length === 0 ? (
                            <p className="text-sm font-secondary text-(--Text-primary-off) py-4">
                                Sem itens vendidos no período selecionado.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {insights.topProducts.map((prod, idx) => (
                                    <div key={prod.name} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center text-sm font-secondary">
                                            <span className="text-(--Text-primary) font-semibold truncate">
                                                {idx + 1}. {prod.name}
                                            </span>
                                            <span className="text-(--Primary-off) tabular-nums shrink-0">
                                                {prod.qty} un. • {formatPrice(prod.revenue)}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-(--Page-background) overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-(--Primary)"
                                                style={{
                                                    width: `${Math.round((prod.qty / insights.maxProductQty) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Receita por Categoria */}
                    <section className="rounded-lg border border-(--Border) bg-(--Widget-background) p-5 flex flex-col gap-4">
                        <div className="border-b border-(--Border)/60 pb-3">
                            <h2 className="text-base font-primary font-extrabold text-(--Primary-off)">
                                Receita por Categoria
                            </h2>
                        </div>

                        {insights.categoriesRevenue.length === 0 ? (
                            <p className="text-sm font-secondary text-(--Text-primary-off) py-4">
                                Sem dados de categoria disponíveis.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {insights.categoriesRevenue.map((cat) => {
                                    const pct = Math.round((cat.revenue / insights.totalCatRevenue) * 100);
                                    const label =
                                        PRODUCT_CATEGORY_LABELS[cat.category as ProductCategory] ??
                                        cat.category;
                                    return (
                                        <div key={cat.category} className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center text-sm font-secondary">
                                                <span className="text-(--Text-primary) font-semibold">
                                                    {label}
                                                </span>
                                                <span className="text-(--Text-primary-off) tabular-nums">
                                                    {formatPrice(cat.revenue)} ({pct}%)
                                                </span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-(--Page-background) overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-(--Info)"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Distribuição por Forma de Pagamento */}
                    <section className="rounded-lg border border-(--Border) bg-(--Widget-background) p-5 flex flex-col gap-4">
                        <div className="border-b border-(--Border)/60 pb-3">
                            <h2 className="text-base font-primary font-extrabold text-(--Primary-off)">
                                Formas de Pagamento
                            </h2>
                        </div>

                        {insights.paymentBreakdown.length === 0 ? (
                            <p className="text-sm font-secondary text-(--Text-primary-off) py-4">
                                Sem pagamentos registrados no período.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {insights.paymentBreakdown.map((item) => (
                                    <div
                                        key={item.method}
                                        className="rounded-lg border border-(--Border)/50 bg-(--Page-background) p-3.5 flex flex-col gap-1"
                                    >
                                        <span className="text-xs font-secondary uppercase tracking-wider text-(--Text-primary-off)">
                                            {formatPaymentMethod(item.method)}
                                        </span>
                                        <span className="text-lg font-primary font-extrabold text-(--Primary) tabular-nums">
                                            {formatPrice(item.total)}
                                        </span>
                                        <span className="text-xs font-secondary text-(--Text-gray) tabular-nums">
                                            {item.count} {item.count === 1 ? "pedido" : "pedidos"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Funil de Status */}
                    <section className="rounded-lg border border-(--Border) bg-(--Widget-background) p-5 flex flex-col gap-4">
                        <div className="border-b border-(--Border)/60 pb-3">
                            <h2 className="text-base font-primary font-extrabold text-(--Primary-off)">
                                Distribuição por Status
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {insights.statusCounts.map((st) => (
                                <div
                                    key={st.status}
                                    className="rounded-lg border border-(--Border)/50 bg-(--Page-background) p-3.5 flex flex-col gap-1"
                                >
                                    <span className="text-[11px] font-secondary font-bold uppercase tracking-wider text-(--Text-primary-off)">
                                        {st.label}
                                    </span>
                                    <span className="text-2xl font-primary font-extrabold text-(--Text-primary) tabular-nums">
                                        {st.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
