import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationBell, type NotificationProps } from "ui-shared/components/NotificationBell";
import { MOCK_NOTIFICATIONS } from "shared-utils/MockBD.js";
import { APP_ROUTES } from "../utils/Path";
import { useAuth } from "../hooks/useAuth";


export function NavBarTop() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const avatarInitial = user?.fullName.trim().charAt(0).toUpperCase() ?? "U";
    const avatarImage = user?.avatarUrl ?? null;

    const profilePath = user
        ? APP_ROUTES.PERFIL_DETAIL.replace(":kind", "employee").replace(":id", user.publicId)
        : APP_ROUTES.PERFIL;

    const notifications = useMemo<NotificationProps[]>(
        () =>
            MOCK_NOTIFICATIONS.map((notification) => ({
                ...notification,
                action: () => undefined,
            })),
        []
    );



    return (

        <div className="w-full h-fit py-4 bg-(--Nav-bar-background) shadow-lg text-white flex items-center justify-between px-6">

            <div>
                <h1 className="text-(--Primary) font-medium font-primary text-lg">Black Amber</h1>
            </div>


            <div className="flex items-center gap-6">


                <NotificationBell notifications={notifications} />


                <button
                    type="button"
                    onClick={() => navigate(profilePath)}
                    className="w-8 h-8 bg-(--Widget-background) rounded-full cursor-pointer overflow-hidden flex items-center justify-center"
                    aria-label="Open profile"
                >
                    {avatarImage ? (
                        <img
                            src={avatarImage}
                            alt={user?.fullName ?? "User"}
                            className="rounded-full overflow-hidden w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-(--Primary) text-xs font-primary font-bold">
                            {avatarInitial}
                        </span>
                    )}
                </button>
            </div>

        </div>
    );
}

export default NavBarTop;