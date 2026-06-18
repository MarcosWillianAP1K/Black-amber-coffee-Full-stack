import { createBrowserRouter, Navigate } from "react-router-dom";

// Importando paths
import { APP_ROUTES } from "./utils/Path";

// Importando o Layout Pai
import { Template } from "./pages/Template";

// Importando Contents
import { Home } from "./pages/content/Home";

// Importando as Telas Prontas
import { Login } from "./pages/Login";
// import { SignUp } from "./pages/SignUp";




// Componente genérico para as telas não finalizadas
// eslint-disable-next-line react-refresh/only-export-components, @typescript-eslint/no-unused-vars
const EmConstrucao = () => (
    <div className="w-full h-full bg-(--Page-background) flex items-center justify-center">
        <h2 className="text-(--Text-primary-off) text-xl font-medium">
            Tela em construção...
        </h2>
    </div>
);

// Mapa central de rotas do sistema
export const router = createBrowserRouter([
    {
        path: "/",
        element: <Template />,
        children: [
            {
                index: true,
                element: <Navigate to={APP_ROUTES.LOGIN} replace />
            },
            {
                path: APP_ROUTES.HOME,
                element: <Home />
            }
        ]
    },
    {
        path: APP_ROUTES.LOGIN,
        element: <Login />
    },
    // {
    //     path: APP_ROUTES.SIGN_UP,
    //     element: <SignUp />
    // },
    
]);