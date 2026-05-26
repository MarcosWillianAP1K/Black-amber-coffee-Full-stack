/**
 * PerfilCard — Generic user profile display widget.
 * Shows avatar, name, and email. Reusable across admin and client apps.
 */

interface PerfilCardProps {
    name: string;
    email: string;
    job?: string;
    avatarUrl?: string;
}

export function PerfilCard({ name, email, job, avatarUrl }: PerfilCardProps) {
    return (
        <div className="w-full h-fit flex items-start justify-start gap-4 pe-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-(--Button-background) shrink-0">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-(--Primary) text-xl font-primary font-bold">
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            {/* Name + Email */}
            <div className="w-full flex flex-col min-w-0 justify-start items-start break-all">
                <h3 className="text-(--Text-gray) text-[20px] font-primary font-bold">
                    {name}
                </h3>
                <p className="text-(--Text-primary-off) text-[12px] font-secondary truncate">
                    {email}
                </p>

                {job && (
                    <p className="text-(--Text-gray) text-[12px] font-secondary ">
                        {job}
                    </p>
                )}
            </div>
        </div>
    );
}
