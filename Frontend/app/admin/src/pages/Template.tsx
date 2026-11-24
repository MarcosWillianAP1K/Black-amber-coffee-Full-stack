import { useEffect } from "react";
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

    return (
        <div className="overflow-hidden w-full h-screen bg-(--Page-background) flex flex-col">
            <div className="w-full h-fit">
                <NavBarTop />
            </div>

            <div className="w-full h-full flex flex-1 overflow-hidden">
                <NavBarLeft />

                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
