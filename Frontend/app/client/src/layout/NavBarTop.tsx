
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationBell, type NotificationProps } from "ui-shared/components/NotificationBell";
import type { User } from "shared-utils/types/user";
import { MOCK_NOTIFICATIONS } from "shared-utils/MockBD.js";
import { APP_ROUTES } from "../utils/Path";

export interface NavBarTopProps {
    user: User | null;
    notifications?: NotificationProps[];
    profilePath?: string;
    onLogout?: () => void;
}

export function NavBarTop({
    user,
    notifications,
    profilePath,
}: NavBarTopProps) {
    const navigate = useNavigate();

    const displayName =
        user?.profile.fullName?.trim() ||
        user?.name?.trim() ||
        user?.email ||
        "User";

    const avatarInitial = displayName.charAt(0).toUpperCase() || "U";
    const avatarImage = user?.profile.avatarImage ?? null;
    const resolvedProfilePath = profilePath ?? (user ? APP_ROUTES.ACCOUNT : APP_ROUTES.LOGIN);

    const resolvedNotifications = useMemo<NotificationProps[]>(() => {
        if (notifications !== undefined) {
            return notifications;
        }

        return MOCK_NOTIFICATIONS.map((notification) => ({
            ...notification,
            action: () => undefined,
        }));
    }, [notifications]);

   
    return (
        <div className="w-full h-16 bg-(--Nav-bar-background) flex items-center justify-between px-4">
            <h1 className="text-(--Primary) text-[20px] font-primary font-bold">Black Amber Coffee</h1>

            <div className="flex items-center gap-4">
                <NotificationBell notifications={resolvedNotifications} />

                <button
                    type="button"
                    onClick={() => navigate(resolvedProfilePath)}
                    className="w-8 h-8 bg-(--Widget-background) rounded-full cursor-pointer overflow-hidden flex items-center justify-center"
                    aria-label="Open profile"
                >
                    {avatarImage ? (
                        <img
                            src={avatarImage}
                            alt={displayName}
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