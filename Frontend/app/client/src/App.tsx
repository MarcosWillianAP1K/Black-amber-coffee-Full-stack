import { RouterProvider } from "react-router-dom";
import { API } from "shared-utils/core/APIroutes";
import { ServerWarmupGate } from "ui-shared/components/ServerWarmupGate";
import { router } from "./Router";

export default function App() {
    return (
        <ServerWarmupGate healthUrl={API.Health} appName="Black Amber Coffee">
            <RouterProvider router={router} />
        </ServerWarmupGate>
    );
}
