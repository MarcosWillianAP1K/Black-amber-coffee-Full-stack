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
    up: { text: "text-(--Success-text)", accent: "text-(--Success-text)" },
    down: { text: "text-(--Danger-text)", accent: "text-(--Danger-text)" },
    neutral: { text: "text-(--Text-primary-off)", accent: "text-(--Text-primary-off)" },
};

function TrendIcon({ direction }: { direction: TrendDirection }) {
    if (direction === "neutral") {
        return null;
    }

    const rotation = direction === "down" ? "rotate-180" : "";

    return (
        <svg
            className={`w-3 h-3 shrink-0 ${rotation}`}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path d="M6 2L10 8H2L6 2Z" fill="currentColor" />
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
    iconBgClassName = "bg-(--Primary) text-(--Text-dark)",
    className = "",
}: CardAnalyticsProps) {
    const trendStyles = TREND_STYLES[trend];

    return (
        <div
            className={`w-full h-full min-h-29 px-5 py-4 bg-(--Widget-background) rounded-lg border border-(--Border) flex flex-col justify-between gap-3 ${className}`}
        >
            <div className="w-full flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <p className="text-(--Text-primary-off) text-xs font-secondary font-medium truncate">
                        {title}
                    </p>
                    <h2 className="text-(--Text-primary) text-xl sm:text-2xl font-primary font-extrabold tabular-nums truncate">
                        {value}
                    </h2>
                </div>

                {icon && (
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBgClassName}`}
                    >
                        {icon}
                    </div>
                )}
            </div>

            {(delta || deltaLabel) && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {delta && (
                        <div className={`flex items-center gap-1 ${trendStyles.accent}`}>
                            <TrendIcon direction={trend} />
                            <span className="text-xs font-secondary font-semibold tabular-nums">
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
