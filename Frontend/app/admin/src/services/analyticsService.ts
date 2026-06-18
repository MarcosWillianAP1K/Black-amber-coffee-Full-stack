/**
 * Analytics Service — data layer for analytics widgets.
 *
 * Computes analytics from live data (orders, employees, products, inventory).
 * No API calls needed — all data comes from existing contexts.
 */

import type { Order } from "shared-utils/types/order";
import type { Worker } from "shared-utils/types/worker";
import type { Product } from "shared-utils/types/product";
import type { InventoryItem } from "shared-utils/types/inventory";

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

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatCurrency(value: number): string {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCompact(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return String(value);
}

/** Compare two summary snapshots to compute deltas */
function computeDelta(current: number, previous: number): { delta: string; trend: TrendDirection } | null {
    if (previous === 0) return null;
    const pct = ((current - previous) / previous) * 100;
    const sign = pct >= 0 ? "+" : "";
    return {
        delta: `${sign}${pct.toFixed(1)}%`,
        trend: pct > 0 ? "up" : pct < 0 ? "down" : "neutral",
    };
}

// ──────────────────────────────────────────────
// Computation functions
// ──────────────────────────────────────────────

/**
 * Compute analytics cards and chart from live context data.
 * Replaces the old mock-only fetchAnalytics.
 */
export function computeAnalytics(
    orders: Order[],
    employees: Worker[],
    products: Product[],
    inventoryItems: InventoryItem[],
): AnalyticsData {
    // ── Current values ────────────────────────

    const totalOrders = orders.length;
    const totalSales = orders
        .filter((o) => o.status === "COMPLETED")
        .reduce((sum, o) => sum + o.totalPrice, 0);
    const pendingDeliveries = orders.filter(
        (o) => o.status === "PENDING" || o.status === "IN PROGRESS",
    ).length;
    const activeStaff = employees.filter((e) => e.isActive).length;
    const menuItems = products.length;
    const lowStock = inventoryItems.filter((i) => i.status !== "In Stock").length;

    // ── Previous period (cached in localStorage) ──

    const prev = getPreviousSnapshot();

    const ordersDelta = prev ? computeDelta(totalOrders, prev.totalOrders) : null;
    const salesDelta = prev ? computeDelta(totalSales, prev.totalSales) : null;
    const pendingDelta = prev ? computeDelta(pendingDeliveries, prev.pendingDeliveries) : null;
    const staffDelta = prev ? computeDelta(activeStaff, prev.activeStaff) : null;

    // Save current snapshot for next comparison
    saveSnapshot({
        totalOrders,
        totalSales,
        pendingDeliveries,
        activeStaff,
    });

    // ── Cards ─────────────────────────────────

    const cards: AnalyticsCardData[] = [
        {
            id: "orders",
            title: "Total Orders",
            value: formatCompact(totalOrders),
            delta: ordersDelta?.delta,
            deltaLabel: ordersDelta ? "Vs. previous period" : undefined,
            trend: ordersDelta?.trend,
            iconKey: "orders",
            iconBgClassName: "bg-(--Primary)",
        },
        {
            id: "sales",
            title: "Total Sales",
            value: formatCurrency(totalSales),
            delta: salesDelta?.delta,
            deltaLabel: salesDelta ? "Vs. previous period" : undefined,
            trend: salesDelta?.trend,
            iconKey: "sales",
            iconBgClassName: "bg-(--Afirmation)",
        },
        {
            id: "deliveries",
            title: "Pending Deliveries",
            value: pendingDeliveries,
            delta: pendingDelta?.delta,
            deltaLabel: pendingDelta ? "Vs. previous period" : undefined,
            trend: pendingDelta?.trend,
            iconKey: "deliveries",
            iconBgClassName: "bg-(--Button-background)",
        },
        {
            id: "users",
            title: "Active Staff",
            value: activeStaff,
            delta: staffDelta?.delta,
            deltaLabel: staffDelta ? "Vs. previous period" : undefined,
            trend: staffDelta?.trend,
            iconKey: "users",
            iconBgClassName: "bg-[#8280FF]",
        },
        {
            id: "hours",
            title: "Menu Items",
            value: menuItems,
            iconKey: "hours",
            iconBgClassName: "bg-(--Negacion)",
        },
        {
            id: "stock",
            title: "Low / Out of Stock",
            value: lowStock,
            iconKey: "stock",
            iconBgClassName: "bg-(--Button-background)",
        },
    ];

    // ── Chart (orders per month) ──────────────

    const monthLabels = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const perMonth = new Array(12).fill(0);
    orders.forEach((order) => {
        const month = new Date(order.createdAt).getMonth();
        perMonth[month]++;
    });

    const chart: AnalyticsChartData = {
        title: "Orders per Month",
        data: perMonth,
        labels: monthLabels,
        seriesLabel: "Orders",
    };

    return { cards, chart };
}

// ──────────────────────────────────────────────
// LocalStorage snapshot (for delta comparison)
// ──────────────────────────────────────────────

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
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(data));
}


