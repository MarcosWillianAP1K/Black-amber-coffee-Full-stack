


export function DestakTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="min-w-0 flex flex-col gap-1">
            <h1 className="text-(--Text-primary) text-2xl sm:text-3xl lg:text-4xl font-primary font-extrabold leading-tight tracking-tight">
                {title}
            </h1>
            <p className="text-(--Text-primary-off) text-xs sm:text-sm font-secondary">
                {subtitle}
            </p>
        </div>
    );
}