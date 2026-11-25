import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface FormBoxProps {
    title: string;
    placeHolder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type: string;
    value?: string;
    required?: boolean;
    autoComplete?: string;
    minLength?: number;
    disabled?: boolean;
    error?: string;
}

export function FormBoxText({
    title,
    placeHolder,
    onChange,
    type,
    value,
    required,
    autoComplete,
    minLength,
    disabled,
    error,
}: FormBoxProps) {
    const inputId = useId();
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword && showPassword ? "text" : type;

    return (
        <div className="w-full flex flex-col gap-1.5">
            <label
                htmlFor={inputId}
                className="w-fit text-(--Primary-off) text-xs font-secondary font-semibold"
            >
                {title}
            </label>
            <div className="relative w-full">
                <input
                    id={inputId}
                    className={`w-full min-h-11 px-3.5 py-2.5 bg-(--Page-background) rounded-md text-sm font-secondary text-(--Text-primary) placeholder:text-(--Text-primary-off)/45 border transition-colors focus:outline-none focus:ring-2 focus:ring-(--Primary)/40 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isPassword ? "pr-11" : ""
                    } ${error ? "border-(--Danger-border)" : "border-(--Border) focus:border-(--Primary)"}`}
                    type={resolvedType}
                    placeholder={placeHolder}
                    value={value}
                    required={required}
                    autoComplete={autoComplete}
                    minLength={minLength}
                    disabled={disabled}
                    onChange={onChange}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-(--Text-primary-off) hover:text-(--Primary) transition-colors cursor-pointer"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-xs font-secondary text-(--Danger-text)">{error}</p>
            )}
        </div>
    );
}
