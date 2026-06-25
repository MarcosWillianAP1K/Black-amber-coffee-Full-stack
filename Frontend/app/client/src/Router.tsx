import { createBrowserRouter, Navigate } from "react-router-dom";
import { APP_ROUTES } from "./utils/Path";
import { Template } from "./pages/Template";
import { Home } from "./pages/content/Home";
import { Menu } from "./pages/content/Menu";
import { Cart } from "./pages/content/Cart";
import { Account } from "./pages/content/Account";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { RouteProtector } from "./components/RouteProtector";

export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <RouteProtector>
            <Template />
            </RouteProtector>
        ),
        children: [
            { index: true, element: <Navigate to={APP_ROUTES.HOME} replace /> },
            { path: APP_ROUTES.HOME, element: <Home /> },
            { path: APP_ROUTES.MENU, element: <Menu /> },
            { path: APP_ROUTES.CART, element: <Cart /> },
            { path: APP_ROUTES.ACCOUNT, element: <Account /> },
        ],
    },
    { path: APP_ROUTES.LOGIN, element: <Login /> },
    { path: APP_ROUTES.SIGN_UP, element: <SignUp /> },
]);
