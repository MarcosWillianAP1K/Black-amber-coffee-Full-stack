import { AddAndRemove } from "ui-shared/components/ui/AddAndRemove.js";



export interface ProductCartProps {
    name: string;
    price: number;
    promotionPrice?: number;
    imageUrl?: string;
    quantity?: number;
    onAdd: () => void;
    onRemove: () => void;
}


export function ProductCart({ name, price, promotionPrice, imageUrl, quantity, onAdd, onRemove }: ProductCartProps) {



    return (


        <div className="w-full h-fit p-2 bg-(--Widget-background) rounded-sm flex flex-row items-center justify-between gap-2 ">

            <div className="flex flex-row items-center justify-start gap-2">

                {
                    imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={name}
                            className="w-12 h-12 object-cover rounded-sm overflow-hidden"
                        />
                    ) :
                        (
                            <div className="w-10 h-10 bg-gray-300 rounded-sm flex items-center justify-center">
                                <span className="text-gray-500 text-sm">NaN</span>
                            </div>
                        )
                }

                <h1 className="text-[14px] font-primary text-(--Text-gray) font-bold">{name}</h1>

            </div>

            <div className="flex flex-row items-center justify-end gap-2">

                <div className=" flex items-center gap-1 whitespace-nowrap">
                    {promotionPrice !== undefined && (
                        <span className="text-[12px] font-bold text-(--Primary)">R$ {promotionPrice.toFixed(2)}</span>
                    )}
                    <span className={` font-bold ${promotionPrice !== undefined ? 'text-(--Text-gray) text-[8px] line-through' : 'text-(--Primary) text-[12px]'}`}>
                        R$ {price.toFixed(2)}
                    </span>
                </div>

                <AddAndRemove onAdd={onAdd} onRemove={onRemove} quantity={quantity} />
            </div>

        </div>

    );

}