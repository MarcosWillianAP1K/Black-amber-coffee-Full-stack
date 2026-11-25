/**
 * Analytics Service — data layer for analytics widgets.
 */

import type { Order } from "shared-utils/types/order";
import type { Worker } from "shared-utils/types/worker";
import type { Product } from "shared-utils/types/product";
import type { InventoryItem } from "shared-utils/types/inventory";
import { formatPrice } from "shared-utils/helpers/currency";

export type TrendDirection = "up" | "down" | "neutral";

export type AnalyticsIconKey =
    | "orders"
    | "sales"
    | "deliveries"
    | "users"
    | "hours"
    | "stock";

export interface AnalyticsCardData {
    id: string;
    title: string;
    value: string | number;
    delta?: string;
    deltaLabel?: string;
    trend?: TrendDirection;
    iconKey?: AnalyticsIconKey;
    iconBgClassName?: string;
}

export interface AnalyticsChartData {
    title: string;
    data: number[];
    labels: string[];
    seriesLabel: string;
}

export interface AnalyticsData {
    cards: AnalyticsCardData[];
    chart: AnalyticsChartData;
}

function formatCompact(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return String(value);
}

function computeDelta(current: number, previous: number): { delta: string; trend: TrendDirection } | null {
    if (previous === 0) return null;
    const pct = ((current - previous) / previous) * 100;
    const sign = pct >= 0 ? "+" : "";
    return {
        delta: `${sign}${pct.toFixed(1)}%`,
        trend: pct > 0 ? "up" : pct < 0 ? "down" : "neutral",
    };
}

export function computeAnalytics(
    orders: Order[],
    employees: Worker[],
    products: Product[],
    inventoryItems: InventoryItem[],
): AnalyticsData {
    const totalOrders = orders.length;
    const totalSales = orders
        .filter((o) => o.status === "finalizado")
        .reduce((sum, o) => sum + o.totalPrice, 0);
    const pendingDeliveries = orders.filter(
        (o) => o.status === "criado" || o.status === "em_preparo" || o.status === "pronto",
    ).length;
    const activeStaff = employees.filter((e) => e.isActive).length;
    const menuItems = products.length;
    const lowStock = inventoryItems.filter((i) => i.status !== "In Stock").length;

    const prev = getPreviousSnapshot();

    const ordersDelta = prev ? computeDelta(totalOrders, prev.totalOrders) : null;
    const salesDelta = prev ? computeDelta(totalSales, prev.totalSales) : null;
    const pendingDelta = prev ? computeDelta(pendingDeliveries, prev.pendingDeliveries) : null;
    const staffDelta = prev ? computeDelta(activeStaff, prev.activeStaff) : null;

    saveSnapshot({
        totalOrders,
        totalSales,
        pendingDeliveries,
        activeStaff,
    });

    const cards: AnalyticsCardData[] = [
        {
            id: "orders",
            title: "Pedidos Totais",
            value: formatCompact(totalOrders),
            delta: ordersDelta?.delta,
            deltaLabel: ordersDelta ? "vs. período anterior" : undefined,
            trend: ordersDelta?.trend,
            iconKey: "orders",
            iconBgClassName: "bg-(--Primary) text-(--Text-dark)",
        },
        {
            id: "sales",
            title: "Faturamento Concluído",
            value: formatPrice(totalSales),
            delta: salesDelta?.delta,
            deltaLabel: salesDelta ? "vs. período anterior" : undefined,
            trend: salesDelta?.trend,
            iconKey: "sales",
            iconBgClassName: "bg-(--Afirmation) text-white",
        },
        {
            id: "deliveries",
            title: "Fila em Aberto",
            value: pendingDeliveries,
            delta: pendingDelta?.delta,
            deltaLabel: pendingDelta ? "vs. período anterior" : undefined,
            trend: pendingDelta?.trend,
            iconKey: "deliveries",
            iconBgClassName: "bg-(--Button-background) text-(--Primary)",
        },
        {
            id: "users",
            title: "Equipe Ativa",
            value: activeStaff,
            delta: staffDelta?.delta,
            deltaLabel: staffDelta ? "vs. período anterior" : undefined,
            trend: staffDelta?.trend,
            iconKey: "users",
            iconBgClassName: "bg-[#6366F1] text-white",
        },
        {
            id: "hours",
            title: "Itens no Cardápio",
            value: menuItems,
            iconKey: "hours",
            iconBgClassName: "bg-(--Primary-20)/25 text-(--Primary)",
        },
        {
            id: "stock",
            title: "Alertas de Estoque",
            value: lowStock,
            iconKey: "stock",
            iconBgClassName: lowStock > 0 ? "bg-(--Danger-bg) text-(--Danger-text)" : "bg-(--Button-background) text-(--Text-gray)",
        },
    ];

    const monthLabels = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez",
    ];
    const perMonth = new Array(12).fill(0);
    orders.forEach((order) => {
        const month = new Date(order.createdAt).getMonth();
        if (month >= 0 && month < 12) {
            perMonth[month]++;
        }
    });

    const chart: AnalyticsChartData = {
        title: "Pedidos por Mês",
        data: perMonth,
        labels: monthLabels,
        seriesLabel: "Pedidos",
    };

    return { cards, chart };
}

interface Snapshot {
    totalOrders: number;
    totalSales: number;
    pendingDeliveries: number;
    activeStaff: number;
}

const SNAPSHOT_KEY = "analyticsSnapshot";

function getPreviousSnapshot(): Snapshot | null {
    try {
        const raw = localStorage.getItem(SNAPSHOT_KEY);
        return raw ? (JSON.parse(raw) as Snapshot) : null;
    } catch {
        return null;
    }
}

function saveSnapshot(data: Snapshot): void {
    try {
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(data));
    } catch {
        // ignore storage restrictions
    }
}
