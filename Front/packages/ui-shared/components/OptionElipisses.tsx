/**
 * OptionsEllipsis — Generic dropdown menu triggered by an ellipsis (⋯) button.
 *
 * Receives an array of options, each with a label and an action callback.
 * Clicking outside the dropdown closes it automatically.
 * Reusable across any card/widget that needs a "more options" menu.
 */

import { useState, useRef, useEffect } from "react";
import { Ellipsis } from "lucide-react";

export interface EllipsisOption {
    /** Display name of the option (e.g. "Delete", "Block", "View") */
    label: string;
    /** Callback fired when the option is clicked */
    action: () => void;
    /** Optional: makes the text red for destructive actions */
    danger?: boolean;
}

interface OptionsEllipsisProps {
    options: EllipsisOption[];
}

export function OptionsEllipsis({ options }: OptionsEllipsisProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="p-1.5 rounded-md text-(--Text-primary-off) hover:text-(--Primary) hover:bg-(--Button-background) transition-all duration-200 cursor-pointer"
                aria-label="More options"
            >
                <Ellipsis size={20} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-(--Page-background) border border-(--Border) rounded-md shadow-lg z-50 overflow-hidden animate-[slideIn_0.15s_ease-out]">
                    {options.map((option) => (
                        <button
                            key={option.label}
                            onClick={() => {
                                option.action();
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-secondary transition-colors cursor-pointer
                                ${option.danger
                                    ? "text-(--Negacion) hover:bg-(--Negacion)/10"
                                    : "text-(--Text-gray) hover:bg-(--Select-background)"
                                }
                            `}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
