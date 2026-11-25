import { useState } from "react";
import {
    LayoutDashboard,
    Menu,
    Activity,
    Archive,
    BarChart2,
    Users,
    HelpCircle,
    Settings,
    LogOut,
    X,
} from "lucide-react";

import { APP_ROUTES, ADMIN_ROUTES } from "../utils/Path";
import { useAuth } from "../hooks/useAuth";

import { NavItem } from "ui-shared/components/ui/NavItem";
import { PerfilNav } from "ui-shared/components/ui/PerfilNav";
import { ConfirmDialog } from "ui-shared/components/ConfirmDialog";

const mainLinks = [
    { label: "Dashboard", icon: LayoutDashboard, path: APP_ROUTES.DASHBOARD },
    { label: "Cardápio", icon: Menu, path: APP_ROUTES.MENU },
    { label: "Pedidos ao Vivo", icon: Activity, path: APP_ROUTES.LIVE_ORDERS },
    { label: "Estoque", icon: Archive, path: APP_ROUTES.INVENTORY },
    { label: "Análises", icon: BarChart2, path: APP_ROUTES.ANALYTICS },
    { label: "Equipe", icon: Users, path: APP_ROUTES.STAFF },
];

interface NavBarLeftProps {
    isMobileOpen?: boolean;
    onCloseMobile?: () => void;
}

export function NavBarLeft({ isMobileOpen = false, onCloseMobile }: NavBarLeftProps) {
    const { user, logout } = useAuth();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const navButtonClass =
        "w-full flex items-center gap-4 px-6 py-3 text-sm font-primary font-medium transition-colors border-r-4 text-(--Text-primary-off) border-transparent hover:bg-(--Button-background) hover:text-(--Text-gray) cursor-pointer";
    const userRole = user?.role?.toLowerCase();
    const visibleLinks = mainLinks.filter((link) => {
        if (ADMIN_ROUTES.includes(link.path) && (userRole === "gerente" || user?.isAdmin)) {
            return true;
        }
        return !ADMIN_ROUTES.includes(link.path);
    });

    const sidebarContent = (
        <aside className="w-64 h-full bg-(--Widget-background) border-r border-(--Border)/40 flex flex-col py-5 gap-5 overflow-y-auto overflow-x-hidden">
            <div className="flex items-center justify-between pr-3">
                <div className="flex-1 min-w-0">
                    <PerfilNav
                        name={user?.fullName}
                        job={user?.role}
                        avatarUrl={user?.avatarUrl ?? undefined}
                    />
                </div>
                {onCloseMobile && (
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        aria-label="Fechar menu"
                        className="lg:hidden p-1.5 rounded-md text-(--Text-primary-off) hover:text-(--Text-primary) hover:bg-(--Button-background)"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <nav aria-label="Menu operacional" className="flex-1" onClick={onCloseMobile}>
                {visibleLinks.map((link) => (
                    <NavItem
                        key={link.path}
                        icon={link.icon}
                        label={link.label}
                        to={link.path}
                    />
                ))}
            </nav>

            <div className="mt-auto border-t border-(--Border)/30 pt-2">
                <div onClick={onCloseMobile}>
                    <NavItem icon={Settings} label="Configurações" to={APP_ROUTES.SETTINGS} />
                    <NavItem icon={HelpCircle} label="Suporte" to={APP_ROUTES.SUPPORT} />
                </div>
                <button
                    type="button"
                    onClick={() => setIsLogoutOpen(true)}
                    className={navButtonClass}
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block h-full shrink-0">{sidebarContent}</div>

            {/* Mobile Drawer */}
            {isMobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <button
                        type="button"
                        aria-label="Fechar navegação"
                        onClick={onCloseMobile}
                        className="fixed inset-0 bg-black/65 backdrop-blur-xs"
                    />
                    <div className="relative z-10 h-full animate-[fadeSlideUp_0.15s_ease-out]">
                        {sidebarContent}
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={isLogoutOpen}
                title="Sair da conta"
                description="Tem certeza que deseja encerrar a sessão?"
                confirmLabel="Sair"
                cancelLabel="Cancelar"
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
