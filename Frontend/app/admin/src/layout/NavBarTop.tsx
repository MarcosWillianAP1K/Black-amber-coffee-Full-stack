import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Coffee, Menu } from "lucide-react";
import { NotificationBell, type NotificationProps } from "ui-shared/components/NotificationBell";
import { APP_ROUTES } from "../utils/Path";
import { useAuth } from "../hooks/useAuth";
import { useOrderStore } from "../stores/useOrderStore";
import { useInventoryStore } from "../stores/useInventoryStore";

interface NavBarTopProps {
    onToggleMobileMenu?: () => void;
}

export function NavBarTop({ onToggleMobileMenu }: NavBarTopProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const orders = useOrderStore((s) => s.orders);
    const inventoryItems = useInventoryStore((s) => s.items);

    const avatarInitial = user?.fullName.trim().charAt(0).toUpperCase() ?? "F";
    const avatarImage = user?.avatarUrl ?? null;

    const profilePath = user
        ? APP_ROUTES.PERFIL_DETAIL.replace(":kind", "employee").replace(":id", user.publicId)
        : APP_ROUTES.PERFIL;

    const notifications = useMemo<NotificationProps[]>(() => {
        const list: NotificationProps[] = [];
        const newOrders = orders.filter((o) => o.status === "criado");
        const criticalStock = inventoryItems.filter((i) => i.status !== "In Stock");

        if (newOrders.length > 0) {
            list.push({
                id: 1,
                message: `${newOrders.length} ${newOrders.length === 1 ? "novo pedido aguardando" : "novos pedidos aguardando"} preparo`,
                time: "Fila ao vivo",
                action: () => navigate(APP_ROUTES.LIVE_ORDERS),
            });
        }

        if (criticalStock.length > 0) {
            list.push({
                id: 2,
                message: `${criticalStock.length} ${criticalStock.length === 1 ? "insumo com estoque crítico" : "insumos com estoque crítico"}`,
                time: "Alertas de estoque",
                action: () => navigate(APP_ROUTES.INVENTORY),
            });
        }

        return list;
    }, [orders, inventoryItems, navigate]);

    return (
        <header className="w-full h-16 bg-(--Nav-bar-background) border-b border-(--Border)/40 flex items-center justify-between px-4 sm:px-6 shrink-0">
            <div className="flex items-center gap-3">
                {onToggleMobileMenu && (
                    <button
                        type="button"
                        onClick={onToggleMobileMenu}
                        aria-label="Abrir menu de navegação"
                        className="lg:hidden p-2 -ml-1 rounded-md text-(--Text-primary-off) hover:text-(--Primary) hover:bg-(--Button-background) transition-colors cursor-pointer"
                    >
                        <Menu size={20} />
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => navigate(APP_ROUTES.DASHBOARD)}
                    className="flex items-center gap-2.5 cursor-pointer"
                >
                    <div className="w-8 h-8 rounded-lg bg-(--Primary)/15 border border-(--Primary)/30 flex items-center justify-center text-(--Primary)">
                        <Coffee size={17} aria-hidden="true" />
                    </div>
                    <span className="text-(--Primary) font-bold font-primary text-sm sm:text-base uppercase tracking-wider">
                        Black Amber Coffee
                    </span>
                </button>
            </div>

            <div className="flex items-center gap-3">
                <NotificationBell notifications={notifications} />

                <button
                    type="button"
                    onClick={() => navigate(profilePath)}
                    className="w-9 h-9 bg-(--Widget-background) border border-(--Border)/60 hover:border-(--Primary) rounded-full cursor-pointer overflow-hidden flex items-center justify-center transition-colors"
                    aria-label="Abrir meu perfil"
                >
                    {avatarImage ? (
                        <img
                            src={avatarImage}
                            alt={user?.fullName ?? "Funcionário"}
                            className="rounded-full overflow-hidden w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-(--Primary) text-xs font-primary font-bold">
                            {avatarInitial}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}

export default NavBarTop;
