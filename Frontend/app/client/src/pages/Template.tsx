
import { Outlet } from "react-router-dom"; // Importe o Outlet aqui!
import { NavBarTop } from "../layout/NavBarTop";
import { NavBarDown } from "../layout/NavBarDown";
import { useAuth } from "../hooks/useAuth";
import { useDragScroll } from "shared-utils/hooks/useDragScroll";

export function Template() {
    const { user, notifications, logout } = useAuth();
    const { ref, isDragging, events } = useDragScroll<HTMLDivElement>();

    return (
        <div className="w-full h-screen flex flex-col">
            <NavBarTop user={user} notifications={notifications} onLogout={logout} />

            <div ref={ref} {...events} className={`flex-1 overflow-y-auto bg-(--Page-background) p-6 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
                <Outlet />
            </div>


            <NavBarDown />
        </div>
    );
}

