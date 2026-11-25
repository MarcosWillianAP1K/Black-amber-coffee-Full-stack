import type { ElementType } from "react";
import { NavLink } from "react-router-dom";
import { APP_ROUTES } from "../utils/Path";
import { Home, Coffee, ShoppingCart, User } from "lucide-react";
import { useCart } from "../hooks/useCart";

const navItems = [
    { label: "Início", icon: Home, path: APP_ROUTES.HOME },
    { label: "Cardápio", icon: Coffee, path: APP_ROUTES.MENU },
    { label: "Carrinho", icon: ShoppingCart, path: APP_ROUTES.CART, showBadge: true },
    { label: "Conta", icon: User, path: APP_ROUTES.ACCOUNT },
];

function NavItem({
    label,
    icon: Icon,
    path,
    badge,
}: {
    label: string;
    icon: ElementType;
    path: string;
    badge?: number;
}) {
    return (
        <NavLink
            to={path}
            className={({ isActive }) =>
                `relative min-w-14 min-h-11 py-1 px-2 flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                    isActive
                        ? "text-(--Primary)"
                        : "text-(--Text-primary-off) hover:text-(--Primary)"
                }`
            }
            aria-label={label}
        >
            <div className="relative">
                <Icon size={19} aria-hidden="true" />
                {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-(--Primary) text-(--Text-dark) text-[10px] font-bold flex items-center justify-center tabular-nums">
                        {badge}
                    </span>
                )}
            </div>
            <span className="text-[11px] font-primary font-semibold leading-none">{label}</span>
        </NavLink>
    );
}

export function NavBarDown() {
    const { count } = useCart();

    return (
        <nav
            aria-label="Navegação inferior"
            className="md:hidden w-full min-h-16 bg-(--Nav-bar-background) flex flex-row items-center justify-around px-3 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] border-t border-(--Border)/40 shrink-0"
        >
            {navItems.map((item) => (
                <NavItem
                    key={item.path}
                    {...item}
                    badge={item.showBadge ? count : undefined}
                />
            ))}
        </nav>
    );
}
