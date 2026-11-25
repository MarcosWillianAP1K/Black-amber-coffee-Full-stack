import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { NavBarTop } from "../layout/NavBarTop";
import { NavBarLeft } from "../layout/NavBarLeft";
import { useAuth } from "../hooks/useAuth";
import { useOrderStore } from "../stores/useOrderStore";
import { useMenuStore } from "../stores/useMenuStore";
import { useEmployeeStore } from "../stores/useEmployeeStore";
import { useCustomerStore } from "../stores/useCustomerStore";
import { useInventoryStore } from "../stores/useInventoryStore";

export function Template() {
    const { isAuthenticated } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        useOrderStore.getState().startPolling();
        useMenuStore.getState().startPolling();
        useEmployeeStore.getState().startPolling();
        useCustomerStore.getState().startPolling();
        useInventoryStore.getState().startPolling();

        return () => {
            useOrderStore.getState().stopPolling();
            useMenuStore.getState().stopPolling();
            useEmployeeStore.getState().stopPolling();
            useCustomerStore.getState().stopPolling();
            useInventoryStore.getState().stopPolling();
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsMobileMenuOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isMobileMenuOpen]);

    return (
        <div className="w-full min-h-dvh h-dvh bg-(--Page-background) flex flex-col overflow-hidden">
            <NavBarTop onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />

            <div className="w-full flex-1 flex overflow-hidden relative">
                <NavBarLeft
                    isMobileOpen={isMobileMenuOpen}
                    onCloseMobile={() => setIsMobileMenuOpen(false)}
                />

                <main className="flex-1 min-w-0 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
