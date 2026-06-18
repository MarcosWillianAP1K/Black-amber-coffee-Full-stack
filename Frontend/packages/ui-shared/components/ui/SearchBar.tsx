

import { Search } from "lucide-react";



export interface SearchBarProps {
    placeholder: string;
    value?: string;
    onChange: (value: string) => void;
}

export function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
    return (
        <div className="w-80 h-fit flex px-3 items-center justify-center bg-(--Select-background) rounded-md focus-within:ring-2 focus-within:ring-(--Primary) transition-all duration-200">
            <Search className="w-5 h-5 text-(--Primary)" />
            <input
                type="text"
                className="w-full h-fit px-3 py-2 text-(--Text-gray) outline-none bg-transparent"
                placeholder={placeholder}
                defaultValue={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}