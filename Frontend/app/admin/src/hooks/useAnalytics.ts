/**
 * useAnalytics — Computes analytics cards and chart from live context data.
 *
 * Instead of fetching from a mock API, it receives orders, employees,
 * products, and inventory directly and computes the dashboard metrics.
 */

import { useMemo } from "react";
import type { Order } from "shared-utils/types/order";
import type { Worker } from "shared-utils/types/worker";
import type { Product } from "shared-utils/types/product";
import type { InventoryItem } from "shared-utils/types/inventory";
import { computeAnalytics, type AnalyticsData } from "../services/analyticsService";

interface UseAnalyticsInput {
    orders: Order[];
    employees: Worker[];
    products: Product[];
    inventory: InventoryItem[];
}

interface UseAnalyticsReturn {
    data: AnalyticsData | null;
    isLoading: boolean;
}

export function useAnalytics(input: UseAnalyticsInput): UseAnalyticsReturn {
    const data = useMemo<AnalyticsData>(() => {
        return computeAnalytics(
            input.orders,
            input.employees,
            input.products,
            input.inventory,
        );
    }, [input.orders, input.employees, input.products, input.inventory]);

    return {
        data,
        isLoading: false,
    };
}
