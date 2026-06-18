
import {
    Clock,

}
    from 'lucide-react'


interface compTimeProps {
    bankHours?: string;
    start?: string;
    lunch?: string;
    end?: string;
    active?: boolean;
}


function TimeDiplay({ label, time }: { label: string, time?: string }) {
    return (
        <div className="flex flex-row gap-2 items-center">
            <h1 className="text-(--Text-primary-off) text-[12px] font-secondary">{label}:</h1>
            <span className="text-(--Text-gray) text-[10px] font-primary font-bold">
                {time ? time : "---"}
            </span>
        </div>
    );
}


export function CompTime({ bankHours, start, lunch, end, active }: compTimeProps) {
    return (
        <div className="w-full h-fit flex flex-col gap-2">

            <div className="flex flex-row gap-2 items-center">
                <p className="text-(--Text-primary-off) text-[12px] font-secondary">Comp Time</p>
                <div className={`rounded-full ${active ? "bg-(--Afirmation) shadow-[0_0_8px_var(--Afirmation)]" : "bg-(--Select-background)"} w-3.5 h-3.5`}/>
            </div>

            <div className="flex justify-between">


                <div className="h-fit flex flex-row gap-2 items-center">
                    <div className="w-fit h-fit bg-(--Button-background) p-1 rounded-md">
                        <Clock className="w-6 h-6 text-(--White)" strokeWidth={1.5} />
                    </div>
                    <span className="text-(--Text-gray) text-[10px] font-primary font-bold">
                        {bankHours ? bankHours : "No hours recorded"}
                    </span>
                </div>

                <div className="h-fit flex flex-col gap-2 items-start justify-start">
                    <TimeDiplay label="Entry time" time={start} />
                    <TimeDiplay label="Lunch time" time={lunch} />
                    <TimeDiplay label="Out time" time={end} />
                </div>

            </div>

        </div>
    );
}