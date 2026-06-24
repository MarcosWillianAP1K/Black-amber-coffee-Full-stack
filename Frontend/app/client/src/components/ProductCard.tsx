import { ButtonAddProduct } from "ui-shared/components/ui/ButtonAddProduct";

export interface ProductCardProps {
    name: string;
    itens: string;
    price: number;
    promotionPrice?: number;
    imageUrl?: string;
    onClick: () => void;
}





export function ProductCard({ name, itens, price, promotionPrice, imageUrl, onClick }: ProductCardProps) {

    return (
        <div className="w-36 h-fit p-4 bg-(--Widget-background) rounded-sm flex flex-col items-center justify-center gap-2 shadow-lg">
            {
                imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-26 object-cover rounded-sm overflow-hidden"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-300 rounded-sm flex items-center justify-center">
                        <span className="text-gray-500 text-sm">NaN</span>
                    </div>
                )
            }


            <div className="w-full h-full flex flex-col items-start gap-2">

                <h2 className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-bold text-(--Text-gray)">{name}</h2>
                <p className="text-(--Primary-off) text-[8px] font-secondary overflow-hidden text-ellipsis line-clamp-2">{itens}</p>
                
                <div className="w-full h-fit flex flex-row items-center justify-between gap-0">
                    <div className=" flex items-center gap-1 whitespace-nowrap">
                        {promotionPrice !== undefined && (
                            <span className="text-[12px] font-bold text-(--Primary)">${promotionPrice.toFixed(2)}</span>
                        )}
                        <span className={`text-[8px] font-bold ${promotionPrice !== undefined ? 'text-(--Text-gray) line-through' : 'text-(--Primary)'}`}>
                            ${price.toFixed(2)}
                        </span>
                    </div>
                        
                    <ButtonAddProduct onClick={onClick} />
                </div>
            </div>
        </div>
    );
}