import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { NotificationBell, type NotificationProps } from "ui-shared/components/NotificationBell";
import type { User } from "shared-utils/types/user";
import { MOCK_NOTIFICATIONS } from "shared-utils/MockBD.js";
import { APP_ROUTES } from "../utils/Path";

export interface NavBarTopProps {
    user: User | null;
    notifications?: NotificationProps[];
    onLogout?: () => void;
}

export function NavBarTop({ user, notifications }: NavBarTopProps) {
    const navigate = useNavigate();

    const displayName = user?.fullName?.trim() || user?.email || "User";
    const avatarInitial = displayName.charAt(0).toUpperCase() || "U";
    const avatarImage = user?.avatarUrl ?? null;
    const resolvedProfilePath = user ? APP_ROUTES.ACCOUNT : APP_ROUTES.LOGIN;

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
        <div className="w-full h-16 bg-(--Nav-bar-background) flex items-center justify-between px-4 border-b border-(--Border)/20">
            <h1 className="text-(--Primary) text-sm font-primary font-bold uppercase tracking-wider">
                Black Amber
            </h1>

            <div className="flex items-center gap-4">
                <NotificationBell notifications={resolvedNotifications} />

                <button
                    type="button"
                    className="text-(--Primary) hover:text-(--Primary-selected) transition-colors"
                    aria-label="Settings"
                >
                    <Settings size={18} />
                </button>

                <button
                    type="button"
                    onClick={() => navigate(resolvedProfilePath)}
                    className="w-8 h-8 bg-(--Widget-background) rounded-full cursor-pointer overflow-hidden flex items-center justify-center border border-(--Border)/30"
                    aria-label="Open profile"
                >
                    {avatarImage ? (
                        <img
                            src={avatarImage}
                            alt={displayName}
                            className="rounded-full w-full h-full object-cover"
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
