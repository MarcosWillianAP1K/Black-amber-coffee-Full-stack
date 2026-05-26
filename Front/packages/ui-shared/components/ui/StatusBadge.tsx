/**
 * StatusBadge — Generic status indicator badge.
 *
 * Displays a pill-shaped badge with configurable colors per status value.
 * Can be used for orders, inventory, staff, or any domain with statuses.
 */

import type { ReactNode } from "react";

/** Color configuration for a single status */
export interface StatusColor {
    bg: string;
    text: string;
}

/** Map of status values to their visual colors */
export type StatusColorMap = Record<string, StatusColor>;

interface StatusBadgeProps {
    status: string;
    /** Map of status → { bg, text } Tailwind color classes */
    colorMap?: StatusColorMap;
    children?: ReactNode;
}

/** Default color map — neutral fallback */
const DEFAULT_COLORS: StatusColor = {
    bg: "bg-(--Select-background)",
    text: "text-(--Text-primary-off)",
};

export function StatusBadge({
    status,
    colorMap = {},
    children,
}: StatusBadgeProps) {
    const colors = colorMap[status] ?? DEFAULT_COLORS;

    return (
        <div
            className={`w-fit h-6 p-3 whitespace-nowrap rounded-full flex items-center justify-center ${colors.bg}`}
        >
            <p className={`text-[12px] font-primary font-black ${colors.text}`}>
                {children ?? status}
            </p>
        </div>
    );
}
