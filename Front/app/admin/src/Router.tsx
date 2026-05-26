import { useEffect, type JSX } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

// Importando paths
import { APP_ROUTES } from "./utils/Path";

// Importando o Layout Pai
import { Template } from "./pages/Template";

// Importando as Telas Prontas
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
import { logoutService, getStoredToken } from "./services/authService";

// Componente genérico para as telas não finalizadas
// eslint-disable-next-line react-refresh/only-export-components, @typescript-eslint/no-unused-vars
const EmConstrucao = () => (
    <div className="w-full h-full bg-(--Page-background) flex items-center justify-center">
        <h2 className="text-(--Text-primary-off) text-xl font-medium">
            Tela em construção...
        </h2>
    </div>
);

// eslint-disable-next-line react-refresh/only-export-components
const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const token = getStoredToken();
    return token ? children : <Navigate to={APP_ROUTES.LOGIN} replace />;
};

// eslint-disable-next-line react-refresh/only-export-components
const LogoutRoute = () => {
    useEffect(() => {
        logoutService();
    }, []);

    return <Navigate to={APP_ROUTES.LOGIN} replace />;
};

// Mapa central de rotas do sistema
export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <RequireAuth>
                <Template />
            </RequireAuth>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={APP_ROUTES.LOGIN} replace />
            },
            {
                path: APP_ROUTES.DASHBOARD,
                element: <Dashboard />
            },
            {
                path: APP_ROUTES.MENU,
                element: <Menu />
            },
            {
                path: APP_ROUTES.LIVE_ORDERS,
                element: <LiveOrders />
            },
            {
                path: APP_ROUTES.INVENTORY,
                element: <Inventory />
            },
            {
                path: APP_ROUTES.ANALYTICS,
                element: <Analytics />
            },
            {
                path: APP_ROUTES.STAFF,
                element: <Staff />
            }
        ]
    },
    {
        path: APP_ROUTES.SUPPORT,
        element: (
            <RequireAuth>
                <Support />
            </RequireAuth>
        )
    },
    {
        path: APP_ROUTES.LOGOUT,
        element: <LogoutRoute />
    },
    {
        path: APP_ROUTES.LOGIN,
        element: <Login />
    },
    {
        path: APP_ROUTES.SIGNUP,
        element: <SignUp />
    },
    {
        path: APP_ROUTES.SETTINGS,
        element: (
            <RequireAuth>
                <Settings />
            </RequireAuth>
        )
    },
    {
        path: APP_ROUTES.PERFIL,
        element: (
            <RequireAuth>
                <Perfil />
            </RequireAuth>
        )
    },
    {
        path: APP_ROUTES.PERFIL_DETAIL,
        element: (
            <RequireAuth>
                <Perfil />
            </RequireAuth>
        )
    }
]);