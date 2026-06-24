import type { ElementType } from "react";
import { NavLink } from "react-router-dom";
import { APP_ROUTES } from "../utils/Path";
import { Home, Coffee, ShoppingCart, User } from "lucide-react";
import { useCart } from "../hooks/useCart";

const navItems = [
    { label: "Home", icon: Home, path: APP_ROUTES.HOME },
    { label: "Menu", icon: Coffee, path: APP_ROUTES.MENU },
    { label: "Cart", icon: ShoppingCart, path: APP_ROUTES.CART, showBadge: true },
    { label: "Account", icon: User, path: APP_ROUTES.ACCOUNT },
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
                `relative flex flex-col items-center gap-1 transition-colors duration-200 ${
                    isActive
                        ? "text-(--Primary)"
                        : "text-(--Primary-off) hover:text-(--Primary)"
                }`
            }
            aria-label={label}
        >
            <div className="relative">
                <Icon size={18} />
                {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-(--Primary) text-(--Text-dark) text-[9px] font-bold flex items-center justify-center">
                        {badge}
                    </span>
                )}
            </div>
            <span className="text-[10px] font-primary uppercase leading-none">{label}</span>
        </NavLink>
    );
}

export function NavBarDown() {
    const { count } = useCart();

    return (
        <nav className="w-full h-14 bg-(--Nav-bar-background) flex flex-row items-center justify-around px-4 border-t border-(--Border)/20">
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
