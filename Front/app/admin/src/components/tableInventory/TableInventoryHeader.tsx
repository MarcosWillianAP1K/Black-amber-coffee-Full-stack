/**
 * TableInventoryHeader — Top section of the inventory table with title and live status.
 */

interface TableInventoryHeaderProps {
    title?: string;
    isLive?: boolean;
}

export function TableInventoryHeader({title = "INVENTORY", isLive = true}: TableInventoryHeaderProps) {
    return (
        <div className="flex items-center justify-between w-full">
            <h2 className="text-(--Primary) text-xl font-primary font-extrabold tracking-wide uppercase">
                {title}
            </h2>

            {isLive && (
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--Primary) opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-(--Primary)" />
                    </span>
                    <span className="text-(--Text-gray) text-xs font-secondary font-semibold tracking-wider uppercase">
                        Live Updates Active
                    </span>
                </div>
            )}
        </div>
    );
}
