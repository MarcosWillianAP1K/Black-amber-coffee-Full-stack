


export interface AddAndRemoveProps {
    onAdd: () => void;
    quantity?: number;
    onRemove: () => void;
}

export function AddAndRemove({ onAdd, quantity, onRemove }: AddAndRemoveProps) {

    return (
        <div className="w-fit h-fit flex flex-row items-center gap-2">

            <button
                type="button"
                className="cursor-pointer w-fit h-fit px-2 py-1 inline-flex items-center justify-center rounded-sm bg-(--Negacion) text-(--Text-gray) font-primary font-[12px] focus:outline-none ring-0 leading-none"
                onClick={onRemove}
            >
                -
            </button>

            {quantity !== undefined && <span className="text-[12px] font-primary text-(--Text-gray)  text-center">{quantity}</span>}

            <button
                type="button"
                className="cursor-pointer w-fit h-fit px-2 py-1 inline-flex items-center justify-center rounded-sm bg-(--Button-background) text-(--Text-gray) font-primary font-[12px] focus:outline-none ring-0 leading-none"
                onClick={onAdd}
            >
                +
            </button>

        </div>

    );
}