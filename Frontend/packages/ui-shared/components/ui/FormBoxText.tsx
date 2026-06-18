


export interface FormBoxProps {
    title: string;
    placeHolder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type: string;
}

export function FormBoxText({ title, placeHolder, onChange, type }: FormBoxProps) {
    return (
        <div className="w-fit h-fit flex flex-col ">
            <p className="w-fit h-fit text-(--Primary-off) text-[12px] font-secondary font-bold mb-1">
                {title}
            </p>
            <input className="w-100 h-fit px-4 py-2 bg-(--Button-background) text-[12px] text-(--Text-gray) border border-(--Border2)"
             type={type} placeholder={placeHolder} onChange={onChange} />
        </div>
    );
}