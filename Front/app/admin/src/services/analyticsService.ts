/**
 * Analytics Service — data layer for analytics widgets.
 *
 * Mock data for now. Replace with API calls when backend is ready.
 */

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

export async function fetchAnalytics(): Promise<AnalyticsData> {
    return {
        cards: [
            {
                id: "orders",
                title: "Total Order",
                value: 10293,
                delta: "+1.3%",
                deltaLabel: "Up from past week",
                trend: "up",
                iconKey: "orders",
                iconBgClassName: "bg-(--Primary)",
            },
            {
                id: "sales",
                title: "Total Sales",
                value: "$89,000",
                delta: "-4.3%",
                deltaLabel: "Down from yesterday",
                trend: "down",
                iconKey: "sales",
                iconBgClassName: "bg-(--Afirmation)",
            },
            {
                id: "deliveries",
                title: "Pending Deliveries",
                value: 24,
                iconKey: "deliveries",
                iconBgClassName: "bg-(--Button-background)",
            },
            {
                id: "users",
                title: "Total Customers",
                value: "40,689",
                delta: "+8.5%",
                deltaLabel: "Up from yesterday",
                trend: "up",
                iconKey: "users",
                iconBgClassName: "bg-[#8280FF]",
            },
            {
                id: "hours",
                title: "Total bank of hours",
                value: "10h 30min",
                iconKey: "hours",
                iconBgClassName: "bg-(--Negacion)",
            },
            {
                id: "stock",
                title: "Total Low/Out Stock",
                value: 2,
                iconKey: "stock",
                iconBgClassName: "bg-(--Button-background)",
            },
        ],
        chart: {
            title: "Tema do grafico",
            data: [68, 18, 34, 22, 40, 15, 58, 20, 55, 52, 92, 45],
            labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ],
            seriesLabel: "Text",
        },
    };
}
