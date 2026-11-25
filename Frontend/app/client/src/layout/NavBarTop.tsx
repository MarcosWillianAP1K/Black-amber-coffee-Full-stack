import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Coffee, ShoppingCart } from "lucide-react";
import { NotificationBell, type NotificationProps } from "ui-shared/components/NotificationBell";
import type { User } from "shared-utils/types/user";
import { APP_ROUTES } from "../utils/Path";
import { useCart } from "../hooks/useCart";
import { useClientOrderStore } from "../stores/useClientOrderStore";

export interface NavBarTopProps {
    user: User | null;
    notifications?: NotificationProps[];
    onLogout?: () => void;
}

const DESKTOP_LINKS = [
    { label: "Início", path: APP_ROUTES.HOME },
    { label: "Cardápio", path: APP_ROUTES.MENU },
    { label: "Pedidos e Conta", path: APP_ROUTES.ACCOUNT },
];

export function NavBarTop({ user, notifications }: NavBarTopProps) {
    const navigate = useNavigate();
    const { count } = useCart();
    const orders = useClientOrderStore((s) => s.orders);

    const displayName = user?.fullName?.trim() || user?.email || "Cliente";
    const avatarInitial = displayName.charAt(0).toUpperCase() || "C";
    const avatarImage = user?.avatarUrl ?? null;
    const resolvedProfilePath = user ? APP_ROUTES.ACCOUNT : APP_ROUTES.LOGIN;

    const resolvedNotifications = useMemo<NotificationProps[]>(() => {
        if (notifications !== undefined) {
            return notifications;
        }
        const activeOrders = orders.filter(
            (o) => o.status === "criado" || o.status === "em_preparo" || o.status === "pronto",
        );
        return activeOrders.map((order) => ({
            id: order.id,
            message:
                order.status === "pronto"
                    ? `Pedido ${order.code || `#${order.id}`} pronto para retirada`
                    : order.status === "em_preparo"
                      ? `Pedido ${order.code || `#${order.id}`} em preparo`
                      : `Pedido ${order.code || `#${order.id}`} recebido`,
            time: new Date(order.updatedAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            action: () => navigate(APP_ROUTES.ACCOUNT),
        }));
    }, [notifications, orders, navigate]);

    return (
        <header className="w-full h-16 bg-(--Nav-bar-background) border-b border-(--Border)/40 shrink-0">
            <div className="w-full max-w-6xl h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={() => navigate(APP_ROUTES.HOME)}
                    className="flex items-center gap-2.5 text-left cursor-pointer group"
                >
                    <div className="w-8 h-8 rounded-lg bg-(--Primary)/15 border border-(--Primary)/30 flex items-center justify-center text-(--Primary)">
                        <Coffee size={17} aria-hidden="true" />
                    </div>
                    <span className="text-(--Primary) text-sm sm:text-base font-primary font-extrabold tracking-wider uppercase group-hover:text-(--Primary-selected) transition-colors">
                        Black Amber Coffee
                    </span>
                </button>

                <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-6">
                    {DESKTOP_LINKS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `text-sm font-primary font-semibold transition-colors ${
                                    isActive
                                        ? "text-(--Primary)"
                                        : "text-(--Text-primary-off) hover:text-(--Text-primary)"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(APP_ROUTES.CART)}
                        className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--Widget-background) border border-(--Border)/60 hover:border-(--Primary) text-(--Text-primary) text-xs font-secondary font-semibold transition-colors cursor-pointer"
                        aria-label="Abrir carrinho"
                    >
                        <ShoppingCart size={15} className="text-(--Primary)" aria-hidden="true" />
                        <span>Carrinho</span>
                        {count > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-(--Primary) text-(--Text-dark) text-[11px] font-bold tabular-nums leading-none">
                                {count}
                            </span>
                        )}
                    </button>

                    <NotificationBell notifications={resolvedNotifications} />

                    <button
                        type="button"
                        onClick={() => navigate(resolvedProfilePath)}
                        className="w-9 h-9 bg-(--Widget-background) rounded-full cursor-pointer overflow-hidden flex items-center justify-center border border-(--Border)/60 hover:border-(--Primary) transition-colors"
                        aria-label="Abrir perfil"
                    >
                        {avatarImage ? (
                            <img
                                src={avatarImage}
                                alt={displayName}
                                className="rounded-full w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-(--Primary) text-xs font-primary font-bold">
                                {avatarInitial}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
