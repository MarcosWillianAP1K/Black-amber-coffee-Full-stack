import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getStoredUser } from "../services/authService.ts";
import { APP_ROUTES } from "../utils/Path";
import { type JSX } from "react";

type RouteProtectorProps = {
    children: JSX.Element;
    allowedRoles?: string[];
};

export function RouteProtector({ children, allowedRoles }: RouteProtectorProps) {
    const { isAuthenticated, user: loggedUser } = useAuth();
    const storedUser = loggedUser ?? getStoredUser();
    const shouldCheckRole = Array.isArray(allowedRoles) && allowedRoles.length > 0;
    const isAdmin = storedUser?.isAdmin === true;

    if (!isAuthenticated) {
        return <Navigate to={APP_ROUTES.LOGIN} replace />;
    }

    if (shouldCheckRole && allowedRoles?.includes("gerente") && !isAdmin) {
        return <Navigate to={APP_ROUTES.DASHBOARD} replace />;
    }

    return children;
}
