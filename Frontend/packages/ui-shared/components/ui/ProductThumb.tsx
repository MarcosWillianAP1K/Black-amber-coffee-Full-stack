import { useState } from "react";
import {
    CakeSlice,
    Coffee,
    Croissant,
    CupSoda,
    GlassWater,
    Leaf,
    Package,
    type LucideIcon,
} from "lucide-react";

const CATEGORY_ICON_MAP: Record<string, { icon: LucideIcon; label: string }> = {
    cafe: { icon: Coffee, label: "Café Especial" },
    cha: { icon: Leaf, label: "Chá Artesanal" },
    suco: { icon: GlassWater, label: "Suco Natural" },
    smoothie: { icon: CupSoda, label: "Smoothie" },
    lanche: { icon: Croissant, label: "Lanche & Padaria" },
    sobremesa: { icon: CakeSlice, label: "Confeitaria" },
    outro: { icon: Package, label: "Bebidas & Outros" },
};

export interface ProductThumbProps {
    name: string;
    category?: string;
    imageUrl?: string | null;
    className?: string;
    iconSize?: number;
    showBadgeLabel?: boolean;
}

export function ProductThumb({
    name,
    category = "cafe",
    imageUrl,
    className = "w-full aspect-square rounded-md",
    iconSize = 28,
    showBadgeLabel = false,
}: ProductThumbProps) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const cleanUrl = imageUrl?.trim() || "";
    const showImage = Boolean(cleanUrl) && failedUrl !== cleanUrl;

    const meta = CATEGORY_ICON_MAP[category.toLowerCase()] ?? CATEGORY_ICON_MAP.cafe;
    const Icon = meta.icon;

    if (showImage) {
        return (
            <div className={`relative overflow-hidden bg-[#191613] ${className}`}>
                <img
                    src={cleanUrl}
                    alt={name}
                    loading="lazy"
                    onError={() => setFailedUrl(cleanUrl)}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    return (
        <div
            aria-label={name}
            className={`relative overflow-hidden bg-[linear-gradient(145deg,#252019_0%,#161412_100%)] border border-(--Border)/45 flex flex-col items-center justify-center gap-2 select-none ${className}`}
        >
            <div className="w-12 h-12 rounded-full bg-(--Primary)/10 border border-(--Primary)/25 flex items-center justify-center text-(--Primary)">
                <Icon size={iconSize} strokeWidth={1.75} aria-hidden="true" />
            </div>
            {showBadgeLabel && (
                <span className="text-[11px] font-secondary font-medium tracking-wider uppercase text-(--Text-primary-off)/80 px-2 text-center">
                    {meta.label}
                </span>
            )}
        </div>
    );
}
