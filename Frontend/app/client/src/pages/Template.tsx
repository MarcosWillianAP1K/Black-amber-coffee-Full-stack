import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { NavBarTop } from "../layout/NavBarTop";
import { NavBarDown } from "../layout/NavBarDown";
import { useAuth } from "../hooks/useAuth";
import { useMenuStore } from "../stores/useMenuStore";
import { useCartStore } from "../stores/useCartStore";

export function Template() {
    const { user, notifications, logout, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) return;
        void useMenuStore.getState().refresh();
        void useCartStore.getState().refresh();
    }, [isAuthenticated]);

    return (
        <div className="w-full h-screen flex flex-col">
            <NavBarTop user={user} notifications={notifications} onLogout={logout} />

            <div className="flex-1 overflow-y-auto bg-(--Page-background) p-6">
                <Outlet />
            </div>

            <NavBarDown />
        </div>
    );
}
