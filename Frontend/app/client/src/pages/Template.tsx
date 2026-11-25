import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { NavBarTop } from "../layout/NavBarTop";
import { NavBarDown } from "../layout/NavBarDown";
import { useAuth } from "../hooks/useAuth";
import { useMenuStore } from "../stores/useMenuStore";
import { useCartStore } from "../stores/useCartStore";
import { useClientOrderStore } from "../stores/useClientOrderStore";

export function Template() {
    const { user, logout, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) return;
        void useMenuStore.getState().refresh();
        void useCartStore.getState().refresh();
        useClientOrderStore.getState().startPolling();

        return () => {
            useClientOrderStore.getState().stopPolling();
        };
    }, [isAuthenticated]);

    return (
        <div className="w-full min-h-dvh h-dvh flex flex-col bg-(--Page-background)">
            <NavBarTop user={user} onLogout={logout} />

            <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            <NavBarDown />
        </div>
    );
}
