/**
 * TableInventoryHeader — Top section of the inventory table with title and live status.
 */

interface TableInventoryHeaderProps {
    title?: string;
    isLive?: boolean;
}

export function TableInventoryHeader({
    title = "INSUMOS EM ESTOQUE",
    isLive = true,
}: TableInventoryHeaderProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-(--Primary) text-lg sm:text-xl font-primary font-extrabold tracking-wide uppercase">
                {title}
            </h2>

            {isLive && (
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-(--Primary)/10 border border-(--Primary)/25">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--Primary) opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-(--Primary)" />
                    </span>
                    <span className="text-(--Primary-off) text-[11px] font-secondary font-semibold tracking-wider uppercase">
                        Ao Vivo
                    </span>
                </div>
            )}
        </div>
    );
}
