/**
 * useAnalytics — Custom hook for analytics cards and chart.
 */

import { useEffect, useState } from "react";
import type { AnalyticsData } from "../services/analyticsService";
import * as analyticsService from "../services/analyticsService";

interface UseAnalyticsReturn {
    data: AnalyticsData | null;
    isLoading: boolean;
}

export function useAnalytics(): UseAnalyticsReturn {
    const [data, setData] = useState<AnalyticsData | null>(() => {
        const storedData = localStorage.getItem("analyticsData");
        return storedData ? JSON.parse(storedData) : null;
    });
    const [isLoading, setIsLoading] = useState(() => !localStorage.getItem("analyticsData"));

    useEffect(() => {
        let cancelled = false;

        if (!data) {
            analyticsService.fetchAnalytics().then((response) => {
                if (!cancelled) {
                    setData(response);
                    localStorage.setItem("analyticsData", JSON.stringify(response));
                    setIsLoading(false);
                }
            });
        }

        return () => {
            cancelled = true;
        };
    }, [data]);

    return { data, isLoading };
}
