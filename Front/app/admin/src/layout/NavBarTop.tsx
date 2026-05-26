import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { OptionConfig, type OptionConfigProps } from "ui-shared/components/OptionConfig";
import { NotificationBell } from "ui-shared/components/NotificationBell";
import { APP_ROUTES } from "../utils/Path";
import { useAuth } from "../hooks/useAuth";



const notifications = [
    { id: 1, message: "New order received", time: "2 mins ago", action: () => console.log("Notification 1 clicked") },
    { id: 2, message: "Inventory low for Espresso Beans", time: "10 mins ago", action: () => console.log("Notification 2 clicked") },
    { id: 3, message: "New staff member added", time: "1 hour ago", action: () => console.log("Notification 3 clicked") },
];


export function NavBarTop() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const avatarInitial = user?.profile.fullName.trim().charAt(0).toUpperCase() ?? "U";
    const avatarImage = user?.profile.avatarImage ?? null;

    const profilePath = user
        ? APP_ROUTES.PERFIL_DETAIL.replace(":kind", "employee").replace(":id", user.publicId)
        : APP_ROUTES.PERFIL;

    const options: OptionConfigProps[] = useMemo(() => [
        {
            label: "Profile",
            action: () => navigate(profilePath),
        },
        {
            label: "Settings",
            action: () => navigate(APP_ROUTES.SETTINGS),
        }
    ], [navigate, profilePath]);

    return (

        <div className="w-full h-fit py-4 bg-(--Nav-bar-background) shadow-lg text-white flex items-center justify-between px-6">

            <div>
                <h1 className="text-(--Primary) font-medium font-primary text-lg">Black Amber</h1>
            </div>


            <div className="flex items-center gap-6">


                <NotificationBell notifications={notifications} />

                <OptionConfig options={options} />

                <button
                    type="button"
                    onClick={() => navigate(profilePath)}
                    className="w-8 h-8 bg-(--Widget-background) rounded-full cursor-pointer overflow-hidden flex items-center justify-center"
                    aria-label="Open profile"
                >
                    {avatarImage ? (
                        <img
                            src={avatarImage}
                            alt={user?.profile.fullName ?? "User"}
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