import { createBrowserRouter, Navigate } from "react-router-dom";

import { APP_ROUTES } from "./utils/Path";
import { Template } from "./pages/Template";
import { RouteProtector } from "./components/RouteProtector";
import { allowedRoles } from "shared-utils/types/worker";

import { Dashboard } from "./pages/content/Dashboard";
import { Menu } from "./pages/content/Menu";
import { LiveOrders } from "./pages/content/LiveOrders";
import { Inventory } from "./pages/content/Inventory";
import { Analytics } from "./pages/content/Analytics";
import { Staff } from "./pages/content/Staff";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { Perfil } from "./pages/Perfil";
import { Settings } from "./pages/Settings";
import { Support } from "./pages/Support";
import { useEffect } from "react";
import { useAuthStore } from "./stores/useAuthStore.ts";

// eslint-disable-next-line react-refresh/only-export-components
const LogoutRoute = () => {
    useEffect(() => {
        void useAuthStore.getState().logout();
    }, []);

    return <Navigate to={APP_ROUTES.LOGIN} replace />;
};

export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <RouteProtector>
                <Template />
            </RouteProtector>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={APP_ROUTES.DASHBOARD} replace />,
            },
            {
                path: APP_ROUTES.DASHBOARD,
                element: <Dashboard />,
            },
            {
                path: APP_ROUTES.MENU,
                element: (
                    <RouteProtector allowedRoles={allowedRoles}>
                        <Menu />
                    </RouteProtector>
                ),
            },
            {
                path: APP_ROUTES.LIVE_ORDERS,
                element: <LiveOrders />,
            },
            {
                path: APP_ROUTES.INVENTORY,
                element: (
                    <RouteProtector allowedRoles={allowedRoles}>
                        <Inventory />
                    </RouteProtector>
                ),
            },
            {
                path: APP_ROUTES.ANALYTICS,
                element: (
                    <RouteProtector allowedRoles={allowedRoles}>
                        <Analytics />
                    </RouteProtector>
                ),
            },
            {
                path: APP_ROUTES.STAFF,
                element: (
                    <RouteProtector allowedRoles={allowedRoles}>
                        <Staff />
                    </RouteProtector>
                ),
            },
            {
                path: APP_ROUTES.SUPPORT,
                element: <Support />,
            },
            {
                path: APP_ROUTES.SETTINGS,
                element: <Settings />,
            },
            {
                path: APP_ROUTES.PERFIL,
                element: <Perfil />,
            },
            {
                path: APP_ROUTES.PERFIL_DETAIL,
                element: <Perfil />,
            },
        ],
    },
    {
        path: APP_ROUTES.LOGOUT,
        element: <LogoutRoute />,
    },
    {
        path: APP_ROUTES.LOGIN,
        element: <Login />,
    },
    {
        path: APP_ROUTES.SIGNUP,
        element: <SignUp />,
    },
]);
