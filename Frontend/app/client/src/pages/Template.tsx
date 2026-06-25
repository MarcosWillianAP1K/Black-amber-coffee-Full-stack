
import { Outlet } from "react-router-dom";
import { NavBarTop } from "../layout/NavBarTop";
import { NavBarDown } from "../layout/NavBarDown";
import { useAuth } from "../hooks/useAuth";

import { MenuProvider } from "../context/MenuContext";
import { CartProvider } from "../context/CartContext";

export function Template() {
    const { user, notifications, logout } = useAuth();


    return (
        <MenuProvider>
            <CartProvider>
                <div className="w-full h-screen flex flex-col">
                    <NavBarTop user={user} notifications={notifications} onLogout={logout} />

                    <div
                        className="flex-1 overflow-y-auto bg-(--Page-background) p-6"
                    >
                        <Outlet />
                    </div>

                    <NavBarDown />
                </div>
            </CartProvider>
        </MenuProvider>
    );
}
