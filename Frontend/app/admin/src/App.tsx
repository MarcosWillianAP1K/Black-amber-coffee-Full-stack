import { RouterProvider } from "react-router-dom";
import { API } from "shared-utils/core/APIroutes";
import { ServerWarmupGate } from "ui-shared/components/ServerWarmupGate";
import { ToastViewport } from "ui-shared/components/ui/ToastViewport";
import { router } from "./Router";

export default function App() {
    return (
        <ServerWarmupGate healthUrl={API.Health} appName="Black Amber Coffee — Painel">
            <RouterProvider router={router} />
            <ToastViewport />
        </ServerWarmupGate>
    );
}
