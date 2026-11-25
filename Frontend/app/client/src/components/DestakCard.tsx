import { ProductThumb } from "ui-shared/components/ui/ProductThumb";

export interface DestakCardProps {
    title: string;
    description: string;
    imageUrl?: string;
    category?: string;
    badge?: string;
    onClick: () => void;
}

export function DestakCard({
    title,
    description,
    imageUrl,
    category = "cafe",
    badge,
    onClick,
}: DestakCardProps) {
    return (
        <button
            type="button"
            className="w-full aspect-16/10 sm:aspect-4/3 bg-(--Widget-background) rounded-xl border border-(--Border)/60 shadow-lg overflow-hidden flex flex-col relative text-left group cursor-pointer hover:border-(--Primary)/60 transition-colors"
            onClick={onClick}
        >
            <div className="absolute inset-0">
                <ProductThumb
                    name={title}
                    category={category}
                    imageUrl={imageUrl}
                    iconSize={48}
                    className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            <div className="absolute inset-0 bg-linear-to-t from-[#11100f] via-[#11100f]/35 to-transparent" />

            {badge && (
                <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-(--Primary) text-(--Text-dark) text-[11px] font-primary font-bold uppercase tracking-wider">
                    {badge}
                </span>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10 flex flex-col gap-1">
                <h2 className="text-lg sm:text-xl font-bold font-primary text-(--Text-primary) line-clamp-1">
                    {title}
                </h2>
                <p className="text-(--Primary-off) text-xs sm:text-sm font-secondary line-clamp-2">
                    {description}
                </p>
            </div>
        </button>
    );
}
