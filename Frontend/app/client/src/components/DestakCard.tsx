


export interface DestakCardProps {
    title: string;
    description: string;
    imageUrl?: string;
    onClick: () => void;
}


export function DestakCard({ title, description, imageUrl, onClick }: DestakCardProps) {

    return (
        <button className="w-full aspect-[4/3] bg-(--Widget-background) rounded-sm shadow-lg overflow-hidden flex flex-col relative"
            onClick={onClick}>

                {/* Imagem de fundo */}
            {
                imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">NaN</span>
                    </div>
                )
            }

            {/* Gradiente overlay forte */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-(--Page-background)/95"></div>

            {/* Título e descrição em overlay na parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col  items-start">
                <h2 className="text-[20px] font-bold font-primary text-(--Text-gray) line-clamp-1">{title}</h2>
                <p className="text-(--Primary-off) text-[12px] font-secondary line-clamp-1">{description}</p>
            </div>
        </button>
    );
}