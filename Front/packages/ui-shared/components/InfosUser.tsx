
import {
    Coffee,
    Banknote,
    Gauge,
} from "lucide-react";


interface InfosUserProps {
    orders: number;
    saved: number;
    score: number;
}


export function InfosUser({ orders, saved, score }: InfosUserProps) {
    return (
        <div className="w-full h-fit flex justify-center items-center flex-row gap-12 px-4">

            {/* Orders */}
            <div className="flex flex-col justify-center items-center gap-2">
                <Coffee className="w-10 h-10 text-(--Primary)" strokeWidth={1.5} />
                <span className="text-(--Text-primary-off) text-[12px] font-secondary">Orders</span>
                <span className="text-(--Text-gray) text-[16px] font-primary font-bold">{orders}</span>
            </div>

            {/* Saved */}
            <div className="flex flex-col justify-center items-center gap-2">
                <Banknote className="w-10 h-10 text-(--Primary)" strokeWidth={1.5} />
                <span className="text-(--Text-primary-off) text-[12px] font-secondary">Saved</span>
                <span className="text-(--Text-gray) text-[16px] font-primary font-bold">
                    ${saved.toFixed(2)}
                </span>
            </div>

            {/* Score */}
            <div className="flex flex-col justify-center items-center gap-2">
                <Gauge className="w-10 h-10 text-(--Primary)" strokeWidth={1.5} />
                <span className="text-(--Text-primary-off) text-[12px] font-secondary">Score</span>
                <span className="text-(--Text-gray) text-[16px] font-primary font-bold">{score}</span>
            </div>

        </div>
    );
}