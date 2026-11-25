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
        <div className="w-full min-w-0 flex items-start justify-start gap-3.5">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-(--Button-background) border border-(--Border)/40 shrink-0">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-(--Primary) text-lg font-primary font-bold">
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            {/* Name + Email */}
            <div className="flex-1 min-w-0 flex flex-col justify-start items-start gap-0.5">
                <h3 className="text-(--Text-primary) text-base font-primary font-bold leading-snug wrap-break-word w-full">
                    {name}
                </h3>
                <p
                    className="text-(--Text-primary-off) text-xs font-secondary truncate w-full"
                    title={email}
                >
                    {email}
                </p>

                {job && (
                    <p className="text-(--Primary-off) text-xs font-secondary capitalize mt-0.5">
                        {job}
                    </p>
                )}
            </div>
        </div>
    );
}
