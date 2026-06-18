import { NavLink } from "react-router-dom";

export interface LinkTextLoginProps {
    path: string;
    text1: string;
    text2: string;
}



export function LinkTextLogin({ text1, text2, path }: LinkTextLoginProps) {

    return (
        <div className="w-fit h-fit flex flex-row items-center justify-center gap-2">
            <p className="text-(--Text-primary-off) text-[10px] font-primary font-bold">{text1}</p>
            <NavLink to={path} className="text-(--Primary) text-[10px] font-secondary font-bold">{text2}</NavLink>
        </div>
    );
}
