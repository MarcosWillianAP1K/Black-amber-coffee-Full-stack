import { useState } from "react";

interface ChartAnalyticsProps {
    title?: string;
    data: number[];
    labels?: string[];
    seriesLabel?: string;
    height?: number;
    accentColor?: string;
    formatValue?: (value: number) => string;
}

const DEFAULT_HEIGHT = 210;
const DEFAULT_COLOR = "var(--Primary)";

export function ChartAnalytics({
    title = "Gráfico",
    data,
    labels,
    seriesLabel = "Série",
    height = DEFAULT_HEIGHT,
    accentColor = DEFAULT_COLOR,
    formatValue = (v) => String(v),
}: ChartAnalyticsProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const safeData = data.length > 0 ? data : [0];
    const min = Math.min(0, ...safeData);
    const max = Math.max(...safeData, 1);
    const range = max - min || 1;

    const width = 720;
    const chartHeight = 180;
    const paddingX = 24;
    const paddingTop = 20;
    const paddingBottom = 18;
    const usableWidth = width - paddingX * 2;
    const usableHeight = chartHeight - paddingTop - paddingBottom;

    const coords = safeData.map((value, index) => {
        const x =
            safeData.length === 1
                ? width / 2
                : paddingX + (index / (safeData.length - 1)) * usableWidth;
        const y =
            paddingTop + (1 - (value - min) / range) * usableHeight;
        return { x, y, value, label: labels?.[index] ?? `#${index + 1}` };
    });

    const linePoints = coords.map((p) => `${p.x},${p.y}`).join(" ");
    const baseLineY = paddingTop + usableHeight;
    const areaPoints =
        coords.length > 0
            ? `${coords[0].x},${baseLineY} ${linePoints} ${coords[coords.length - 1].x},${baseLineY}`
            : "";

    const activeCoord = hoveredIndex !== null ? coords[hoveredIndex] : null;

    return (
        <div className="w-full p-5 bg-(--Widget-background) rounded-lg border border-(--Border) flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-(--Primary-off) text-sm sm:text-base font-primary font-bold">
                    {title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-(--Text-primary-off) font-secondary">
                    {activeCoord ? (
                        <span className="text-(--Primary) font-semibold tabular-nums">
                            {activeCoord.label}: {formatValue(activeCoord.value)}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-full"
                                style={{ background: accentColor }}
                            />
                            {seriesLabel}
                        </span>
                    )}
                </div>
            </div>

            <div className="w-full" style={{ minHeight: height }}>
                <svg
                    viewBox={`0 0 ${width} ${chartHeight}`}
                    className="w-full h-auto overflow-visible"
                    role="img"
                    aria-label={title}
                >
                    <defs>
                        <linearGradient id="chartAreaAmber" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--Primary)" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="var(--Primary)" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {[0, 0.33, 0.66, 1].map((ratio) => {
                        const y = paddingTop + ratio * usableHeight;
                        return (
                            <line
                                key={ratio}
                                x1={paddingX}
                                y1={y}
                                x2={width - paddingX}
                                y2={y}
                                stroke="var(--Border)"
                                strokeOpacity="0.55"
                                strokeDasharray={ratio === 1 ? undefined : "4 4"}
                            />
                        );
                    })}

                    {areaPoints && (
                        <polygon points={areaPoints} fill="url(#chartAreaAmber)" />
                    )}

                    <polyline
                        points={linePoints}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {coords.map((coord, index) => {
                        const isHovered = hoveredIndex === index;
                        return (
                            <g
                                key={`point-${coord.label}-${index}`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="cursor-pointer"
                            >
                                <circle cx={coord.x} cy={coord.y} r="14" fill="transparent" />
                                <circle
                                    cx={coord.x}
                                    cy={coord.y}
                                    r={isHovered ? "5.5" : "3.8"}
                                    fill={isHovered ? "var(--White)" : "var(--Primary)"}
                                    stroke="var(--Page-background)"
                                    strokeWidth="2"
                                />
                            </g>
                        );
                    })}
                </svg>
            </div>

            {labels && labels.length > 0 && (
                <div className="flex items-center justify-between gap-1 px-1 overflow-x-auto">
                    {labels.map((label, index) => (
                        <span
                            key={`${label}-${index}`}
                            className={`text-[11px] font-secondary text-center min-w-0 truncate ${
                                hoveredIndex === index
                                    ? "text-(--Primary) font-semibold"
                                    : "text-(--Text-primary-off)"
                            }`}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
