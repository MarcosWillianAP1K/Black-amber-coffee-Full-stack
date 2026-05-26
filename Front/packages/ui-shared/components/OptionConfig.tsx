


import { useState, useRef, useEffect } from 'react'
import { Settings } from "lucide-react";


export interface OptionConfigProps {
    label: string;
    action: () => void;
}


interface OptionConfigComponentProps {
    options: OptionConfigProps[];
}


export function OptionConfig({ options }: OptionConfigComponentProps) {

    const [isOpen, setIsOpen] = useState(false);
    const optionConfigRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (isOpen && optionConfigRef.current && !optionConfigRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className='relative' ref={optionConfigRef}>
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="p-1.5 rounded-md text-(--Text-primary-off) hover:text-(--Primary) hover:bg-(--Button-background) transition-all duration-200 cursor-pointer"

                aria-label="Settings"
            >
                <Settings size={20} />
            </button>

            
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-(--Page-background) border border-(--Border) rounded-sm shadow-lg z-50 overflow-hidden animate-[slideIn_0.15s_ease-out] option-config">
                    {options.map((option) => (
                        <button
                            key={option.label}
                            onClick={() => {
                                option.action();
                                setIsOpen(false);
                            }}
                            className={"w-full text-left px-4 py-2.5 text-sm font-secondary transition-colors cursor-pointer hover:bg-(--Select-background) text-(--Text-gray) bg-(--Page-background) hover:border-r-4 hover:border-(--White)"}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

}


