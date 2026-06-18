import { createContext, useMemo, useState, type ReactNode } from "react";
import type { User } from "shared-utils/types/user";
import type { NotificationProps } from "ui-shared/components/NotificationBell";
import { MOCK_NOTIFICATIONS, MOCK_USERS } from "shared-utils/MockBD.js";

export type AuthContextValue = {
    user: User | null;
    notifications: NotificationProps[];
    isAuthenticated: boolean;
    logout: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(MOCK_USERS[0] ?? null);

    const notifications = useMemo<NotificationProps[]>(
        () =>
            MOCK_NOTIFICATIONS.map((notification) => ({
                ...notification,
                action: () => undefined,
            })),
        []
    );

    const isAuthenticated = !!user;

    function logout() {
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, notifications, isAuthenticated, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
