
import { Outlet } from "react-router-dom"; // Importe o Outlet aqui!

export function Template() {
    return (
        <div className="overflow-hidden w-full h-screen bg-(--Page-background) flex flex-col">
            <Outlet />
        </div>
    );
}

