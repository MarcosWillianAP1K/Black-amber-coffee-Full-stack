import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { APP_ROUTES } from "../utils/Path";
import type { JSX } from "react";

export function RouteProtector({ children }: { children: JSX.Element }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to={APP_ROUTES.LOGIN} replace />;
    }

    return children;
}
