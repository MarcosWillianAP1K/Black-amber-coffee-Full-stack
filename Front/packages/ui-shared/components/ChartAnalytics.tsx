interface ChartAnalyticsProps {
    title?: string;
    data: number[];
    labels?: string[];
    seriesLabel?: string;
    height?: number;
    accentColor?: string;
}

const DEFAULT_HEIGHT = 220;
const DEFAULT_COLOR = "var(--Primary)";
const GRID_COLUMNS: Record<number, string> = {
    4: "grid-cols-4",
    6: "grid-cols-6",
    12: "grid-cols-12",
};

export function ChartAnalytics({
    title = "Chart",
    data,
    labels,
    seriesLabel = "Series",
    height = DEFAULT_HEIGHT,
    accentColor = DEFAULT_COLOR,
}: ChartAnalyticsProps) {
    const safeData = data.length > 0 ? data : [0];
    const min = Math.min(...safeData);
    const max = Math.max(...safeData);
    const range = max - min || 1;

    const width = 640;
    const chartHeight = 120;
    const paddingX = 10;
    const paddingY = 10;

    const points = safeData
        .map((value, index) => {
            const x =
                paddingX +
                (index / Math.max(safeData.length - 1, 1)) *
                    (width - paddingX * 2);
            const y =
                paddingY +
                (1 - (value - min) / range) *
                    (chartHeight - paddingY * 2);
            return `${x},${y}`;
        })
        .join(" ");

    const labelGridClass = labels ? (GRID_COLUMNS[labels.length] ?? "grid-cols-6") : "";

    return (
        <div className="w-full h-fit p-4 bg-(--Widget-background) rounded-md border border-(--Border) flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-(--Primary-off) text-sm font-primary font-bold">
                    {title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-(--Text-primary-off) font-secondary">
                    <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ background: accentColor }}
                    />
                    {seriesLabel}
                </div>
            </div>

            <div className="w-full" style={{ height }}>
                <svg
                    viewBox={`0 0 ${width} ${chartHeight}`}
                    className="w-full h-full"
                    preserveAspectRatio="none"
                >
                    <line x1="0" y1="120" x2="640" y2="120" stroke="var(--Border)" />
                    <line x1="0" y1="80" x2="640" y2="80" stroke="var(--Border)" />
                    <line x1="0" y1="40" x2="640" y2="40" stroke="var(--Border)" />

                    <polyline
                        points={points}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth="2"
                    />

                    {safeData.map((value, index) => {
                        const x =
                            paddingX +
                            (index / Math.max(safeData.length - 1, 1)) *
                                (width - paddingX * 2);
                        const y =
                            paddingY +
                            (1 - (value - min) / range) *
                                (chartHeight - paddingY * 2);
                        return (
                            <circle
                                key={`point-${index}`}
                                cx={x}
                                cy={y}
                                r="3"
                                fill="var(--Primary)"
                                stroke="var(--Page-background)"
                                strokeWidth="1"
                            />
                        );
                    })}
                </svg>
            </div>

            {labels && labels.length > 0 && (
                <div
                    className={`grid ${labelGridClass} gap-2 text-[10px] text-(--Text-primary-off) font-secondary`}
                >
                    {labels.map((label, index) => (
                        <span key={`${label}-${index}`} className="text-center">
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
