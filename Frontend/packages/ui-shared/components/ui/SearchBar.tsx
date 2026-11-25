import { useState } from "react";
import { Search, X } from "lucide-react";

export interface SearchBarProps {
    placeholder: string;
    value?: string;
    onChange: (value: string) => void;
    className?: string;
}

export function SearchBar({ placeholder, value, onChange, className = "" }: SearchBarProps) {
    const [internalValue, setInternalValue] = useState(value ?? "");
    const currentValue = value !== undefined ? value : internalValue;

    const handleChange = (next: string) => {
        if (value === undefined) {
            setInternalValue(next);
        }
        onChange(next);
    };

    const widthClass = className.trim() || "w-full sm:w-72";

    return (
        <div
            className={`min-h-10 min-w-0 flex px-3 items-center bg-(--Select-background) border border-(--Border)/60 rounded-md focus-within:ring-2 focus-within:ring-(--Primary)/50 focus-within:border-(--Primary) transition-all duration-200 ${widthClass}`}
        >
            <Search className="w-4 h-4 text-(--Primary) shrink-0" aria-hidden="true" />
            <input
                type="text"
                aria-label={placeholder}
                className="w-full min-w-0 px-2.5 py-2 text-sm text-(--Text-primary) placeholder:text-(--Text-primary-off)/50 outline-none bg-transparent"
                placeholder={placeholder}
                value={currentValue}
                onChange={(e) => handleChange(e.target.value)}
            />
            {currentValue.length > 0 && (
                <button
                    type="button"
                    onClick={() => handleChange("")}
                    aria-label="Limpar busca"
                    className="p-1 text-(--Text-primary-off) hover:text-(--Text-primary) cursor-pointer shrink-0"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}
