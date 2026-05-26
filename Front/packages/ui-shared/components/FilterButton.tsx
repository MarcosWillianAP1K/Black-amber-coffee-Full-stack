import { useEffect, useRef, useState } from "react";
import { Check, SlidersHorizontal } from "lucide-react";

export interface FilterOption {
    label: string;
    action: () => void;
    active?: boolean;
}

interface FilterButtonProps {
    options: FilterOption[];
    title?: string;
    buttonLabel?: string;
    align?: "left" | "right";
    closeOnSelect?: boolean;
    emptyLabel?: string;
    disabled?: boolean;
}

export function FilterButton({
    options,
    title = "Filters",
    buttonLabel,
    align = "right",
    closeOnSelect = true,
    emptyLabel = "No filters",
    disabled = false,
}: FilterButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all duration-200 cursor-pointer
                    ${disabled
                        ? "text-(--Text-primary-off)/60 bg-(--Button-background)/50 cursor-not-allowed"
                        : "text-(--Text-primary-off) hover:text-(--Primary) hover:bg-(--Button-background)"
                    }
                `}
                aria-label="Filter"
                aria-expanded={isOpen}
                disabled={disabled}
            >
                <SlidersHorizontal size={18} />
                {buttonLabel ? <span className="text-sm font-secondary">{buttonLabel}</span> : null}
            </button>

            {isOpen && (
                <div
                    className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-56 bg-(--Page-background) border border-(--Border) rounded-md shadow-lg z-50 overflow-hidden animate-[slideIn_0.15s_ease-out]`}
                >
                    {title ? (
                        <div className="px-4 py-3 text-xs uppercase tracking-wide text-(--Text-primary-off) border-b border-(--Border)">
                            {title}
                        </div>
                    ) : null}

                    <div className="py-1">
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-(--Text-primary-off)">{emptyLabel}</div>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => {
                                        option.action();
                                        if (closeOnSelect) {
                                            setIsOpen(false);
                                        }
                                    }}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-secondary transition-colors cursor-pointer
                                        ${option.active
                                            ? "text-(--Primary) bg-(--Select-background)"
                                            : "text-(--Text-gray) hover:bg-(--Select-background)"
                                        }
                                    `}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.active ? <Check size={16} /> : null}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
