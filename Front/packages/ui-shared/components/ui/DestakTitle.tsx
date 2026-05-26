


export function DestakTitle({ title, subtitle }: { title: string, subtitle: string }) {

    return (
        <div className="w-fit h-fit flex flex-col">
            <h1 className="text-(--Text-gray) text-[48px] font-primary font-extrabold">{title}</h1>
            <p className="text-(--Text-primary-off) text-[12px] font-secondary">{subtitle}</p>
        </div>
    );
}