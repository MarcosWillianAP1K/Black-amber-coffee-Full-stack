// import { ButtonPrimary } from "./ButtonPrimary";

interface PerfilNavProps {
    name?: string;
    job?: string;
    avatarUrl?: string;
}

export function PerfilNav({ name, job, avatarUrl }: PerfilNavProps) {
    const displayName = name ?? "Black Amber Coffee";
    const displayJob = job ?? "Painel Operacional";
    const hasAvatar = Boolean(avatarUrl);
    const avatarInitial = displayName.trim().charAt(0).toUpperCase();

    return (
        <div className="w-full px-5 flex flex-col">
            <div className="flex items-center gap-3 w-full min-w-0">
                {hasAvatar ? (
                    <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-10 h-10 rounded-sm bg-zinc-800 object-cover shrink-0"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-sm bg-zinc-800 flex items-center justify-center text-(--Primary) text-sm font-primary font-bold shrink-0">
                        {avatarInitial}
                    </div>
                )}

                <div className="flex flex-col min-w-0 flex-1">
                    <h2 className="text-(--Primary) font-primary font-bold text-lg leading-tight truncate">{displayName}</h2>
                    <span className="text-[12px] text-(--Text-gray) font-secondary tracking-wider truncate">{displayJob}</span>
                </div>
            </div>


            {/* <ButtonPrimary onClick={() => console.log("Criar nova entrada")}>
                <span>+</span> New Entry
            </ButtonPrimary> */}
        </div>
    );

}