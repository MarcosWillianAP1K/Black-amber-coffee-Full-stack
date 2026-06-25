import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { CardAnalytics } from "ui-shared/components/CardAnalytics";
import { ChartAnalytics } from "ui-shared/components/ChartAnalytics";
import { ErrorState } from "../../components/ui/ErrorState";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useOrders } from "../../hooks/useOrders";
import { useEmployee } from "../../hooks/useEmployee";
import { useMenuItems } from "../../hooks/useMenuItems";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import {
    Coffee,
    TrendingUp,
    Truck,
    Users,
    Clock,
    Box,
} from "lucide-react";

const ICON_MAP = {
    orders: Coffee,
    sales: TrendingUp,
    deliveries: Truck,
    users: Users,
    hours: Clock,
    stock: Box,
} as const;

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-(--Border) ${className ?? ""}`} />;
}

export function Analytics() {
    const { orders, isLoading: ordersLoading, error: ordersError, refresh: refreshOrders } = useOrders();
    const { employees, isLoading: employeesLoading, error: employeesError, refresh: refreshEmployees } = useEmployee();
    const { items: products, isLoading: menuLoading, error: menuError, refresh: refreshMenu } = useMenuItems();
    const { items: inventoryItems, isLoading: inventoryLoading } = useInventoryItems();

    const { data } = useAnalytics({
        orders,
        employees,
        products,
        inventory: inventoryItems,
    });

    const isLoading = ordersLoading || employeesLoading || menuLoading || inventoryLoading;
    const anyError = ordersError || employeesError || menuError;

    if (anyError && !isLoading) {
        return (
            <div className="w-full h-fit gap-6 flex flex-col">
                <DestakTitle title="Analytics" subtitle="Desempenho do seu negócio em um relance" />
                <div className="w-full bg-(--Widget-background) rounded-md border border-(--Border) p-5">
                    <ErrorState
                        message={ordersError || employeesError || menuError || "Falha ao carregar os análises"}
                        onRetry={() => {
                            if (ordersError) refreshOrders();
                            if (employeesError) refreshEmployees();
                            if (menuError) refreshMenu();
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-fit gap-6 flex flex-col">
            <DestakTitle title="Analytics" subtitle="Desempenho do seu negócio em um relance" />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-full h-29 px-4 py-4 bg-(--Widget-background) rounded-md border border-(--Border) flex flex-col justify-between gap-3">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-2 flex-1">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-7 w-28" />
                                </div>
                                <Skeleton className="w-10 h-10 rounded-md" />
                            </div>
                            <Skeleton className="h-3 w-32" />
                        </div>
                    ))
                ) : (
                    data?.cards.map((card) => {
                        const Icon = card.iconKey ? ICON_MAP[card.iconKey] : null;
                        return (
                            <CardAnalytics
                                key={card.id}
                                title={card.title}
                                value={card.value}
                                delta={card.delta}
                                deltaLabel={card.deltaLabel}
                                trend={card.trend}
                                icon={
                                    Icon ? <Icon className="w-5 h-5 text-(--White)" /> : undefined
                                }
                                iconBgClassName={card.iconBgClassName}
                            />
                        );
                    })
                )}
            </div>

            {isLoading ? (
                <div className="w-full h-48 p-4 bg-(--Widget-background) rounded-md border border-(--Border) flex flex-col gap-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="flex-1 w-full" />
                </div>
            ) : data?.chart ? (
                <ChartAnalytics
                    title={data.chart.title}
                    data={data.chart.data}
                    labels={data.chart.labels}
                    seriesLabel={data.chart.seriesLabel}
                />
            ) : null}
        </div>
    );
}

