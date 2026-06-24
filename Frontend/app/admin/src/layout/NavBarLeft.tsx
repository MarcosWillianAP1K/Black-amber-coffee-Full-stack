import { useState } from "react";
import {
    LayoutDashboard,
    Menu,
    Activity,
    Archive,
    BarChart2,
    Users,
    HelpCircle,
    LogOut
} from "lucide-react";

import { APP_ROUTES, ADMIN_ROUTES } from "../utils/Path";
import { useAuth } from "../hooks/useAuth";

import { NavItem } from "ui-shared/components/ui/NavItem";
import { PerfilNav } from "ui-shared/components/ui/PerfilNav";
import { ConfirmDialog } from "ui-shared/components/ConfirmDialog";


const mainLinks = [
    { label: "Dashboard", icon: LayoutDashboard, path: APP_ROUTES.DASHBOARD },
    { label: "Menu", icon: Menu, path: APP_ROUTES.MENU },
    { label: "Live Orders", icon: Activity, path: APP_ROUTES.LIVE_ORDERS },
    { label: "Inventory", icon: Archive, path: APP_ROUTES.INVENTORY },
    { label: "Analytics", icon: BarChart2, path: APP_ROUTES.ANALYTICS },
    { label: "Staff", icon: Users, path: APP_ROUTES.STAFF },
];

export function NavBarLeft() {
    const { user, logout } = useAuth();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const navButtonClass = "w-full flex items-center gap-4 px-6 py-3 text-sm font-primary font-medium transition-colors border-r-4 text-(--Text-primary-off) border-transparent hover:bg-(--Button-background) hover:text-(--Text-gray)";
    const userRole = user?.role?.toLowerCase();
    const visibleLinks = mainLinks.filter((link) => {
        if (ADMIN_ROUTES.includes(link.path) && (userRole === "gerente" || user?.isAdmin)) {
            return true;
        }

        if (!ADMIN_ROUTES.includes(link.path)) {
            return true;
        }

        return false;
    });


    


    return (
        <>
            <aside className="w-64 h-full bg-(--Widget-background) flex flex-col py-6 gap-6">

            {/* SEÇÃO 1: Perfil do Usuário */}
            <PerfilNav
                name={user?.fullName}
                job={user?.role}
                avatarUrl={user?.avatarUrl ?? undefined}
            />

            {/* SEÇÃO 2: Navegação Principal */}
            <nav className="flex-1">
                {visibleLinks.map((link) => (
                    <NavItem
                        key={link.path} // Usar o path como key é mais seguro que o label!
                        icon={link.icon}
                        label={link.label}
                        to={link.path}
                    />
                ))}
            </nav>

            {/* SEÇÃO 3: Rodapé (Suporte e Logout) */}
            <div className="mt-auto">
                <NavItem
                    icon={HelpCircle}
                    label="Support"
                    to={APP_ROUTES.SUPPORT}
                />
                <button
                    type="button"
                    onClick={() => setIsLogoutOpen(true)}
                    className={navButtonClass}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

            </aside>

            <ConfirmDialog
                isOpen={isLogoutOpen}
                title="Sign out"
                description="Are you sure you want to log out?"
                confirmLabel="Logout"
                cancelLabel="Cancel"
                danger
                onCancel={() => setIsLogoutOpen(false)}
                onConfirm={async () => {
                    setIsLogoutOpen(false);
                    await logout();
                }}
            />
        </>
    );
}