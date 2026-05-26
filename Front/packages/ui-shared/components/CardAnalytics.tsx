import type { ReactNode } from "react";

type TrendDirection = "up" | "down" | "neutral";

interface CardAnalyticsProps {
    title: string;
    value: string | number;
    delta?: string;
    deltaLabel?: string;
    trend?: TrendDirection;
    icon?: ReactNode;
    iconBgClassName?: string;
    className?: string;
}

const TREND_STYLES: Record<TrendDirection, { text: string; accent: string }> = {
    up: { text: "text-(--Afirmation)", accent: "text-(--Afirmation)" },
    down: { text: "text-(--Negacion)", accent: "text-(--Negacion)" },
    neutral: { text: "text-(--Text-primary-off)", accent: "text-(--Text-primary-off)" },
};

function TrendIcon({ direction }: { direction: TrendDirection }) {
    if (direction === "neutral") {
        return null;
    }

    const rotation = direction === "down" ? "rotate-180" : "";

    return (
        <svg
            className={`w-3 h-3 ${rotation}`}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M6 2L10 8H2L6 2Z"
                fill="currentColor"
            />
        </svg>
    );
}

export function CardAnalytics({
    title,
    value,
    delta,
    deltaLabel,
    trend = "neutral",
    icon,
    iconBgClassName = "bg-(--Primary)",
    className = "",
}: CardAnalyticsProps) {
    const trendStyles = TREND_STYLES[trend];

    return (
        <div
            className={`w-full h-full min-h-29 px-4 py-4 bg-(--Widget-background) rounded-md border border-(--Border) flex flex-col justify-between ${className}`}
        >
            <div className="w-full flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <p className="text-(--Text-primary-off) text-xs font-secondary">
                        {title}
                    </p>
                    <h2 className="text-(--Text-gray) text-2xl font-primary font-extrabold">
                        {value}
                    </h2>
                </div>

                {icon && (
                    <div
                        className={`w-10 h-10 rounded-md flex items-center justify-center ${iconBgClassName}`}
                    >
                        {icon}
                    </div>
                )}
            </div>

            {(delta || deltaLabel) && (
                <div className="flex items-center gap-2">
                    {delta && (
                        <div className={`flex items-center gap-1 ${trendStyles.accent}`}>
                            <TrendIcon direction={trend} />
                            <span className="text-xs font-secondary font-semibold">
                                {delta}
                            </span>
                        </div>
                    )}
                    {deltaLabel && (
                        <span className="text-xs text-(--Text-primary-off) font-secondary">
                            {deltaLabel}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
