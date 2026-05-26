import { NavBarTop } from "../layout/NavBarTop";
import { NavBarLeft } from "../layout/NavBarLeft";
import { Outlet } from "react-router-dom"; // Importe o Outlet aqui!

export function Template() {
    return (
        <div className="overflow-hidden w-full h-screen bg-(--Page-background) flex flex-col">

            <div className="w-full h-fit">
                <NavBarTop />
            </div>

            <div className="w-full h-full flex flex-1 overflow-hidden">

                <NavBarLeft />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

