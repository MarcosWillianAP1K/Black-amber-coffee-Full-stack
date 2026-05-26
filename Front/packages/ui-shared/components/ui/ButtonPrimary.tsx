


export function ButtonPrimary({ children, onClick, type="button" }: { children: React.ReactNode; onClick?: () => void, type?: "button" | "submit" | "reset" }) {
    return (
        <button className="w-full h-fit px-4 py-2 bg-(--Primary) hover:bg-(--Primary-selected) text-(--Text-dark) font-primary font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors"
            onClick={onClick}
            type={type}
        >
            {children}
        </button>
    );
}