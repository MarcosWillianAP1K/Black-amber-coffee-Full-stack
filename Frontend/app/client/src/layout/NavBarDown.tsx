import type { ElementType } from "react";
import { NavLink } from "react-router-dom";
import { APP_ROUTES } from "../utils/Path";
import { Home, Coffee, ShoppingCart, User } from "lucide-react";

const navItems = [
    { label: "Home", icon: Home, path: APP_ROUTES.HOME },
    { label: "Menu", icon: Coffee, path: APP_ROUTES.MENU },
    { label: "Cart", icon: ShoppingCart, path: APP_ROUTES.CART },
    { label: "Account", icon: User, path: APP_ROUTES.ACCOUNT },
];

function NavItem({ label, icon: Icon, path }: { label: string; icon: ElementType; path: string }) {
    return (
        <NavLink
            to={path}
            className={({ isActive }) =>
                `flex flex-col items-center gap-2 transition-colors duration-200 ${
                    isActive
                        ? "text-(--Primary)"
                        : "text-(--Primary-off) hover:text-(--Primary)"
                }`
            }
            aria-label={label}
        >
            <Icon size={18} />
            <span className="text-[10px] font-primary inline-flex ring-0 leading-none">{label}</span>
        </NavLink>
    );
}

export function NavBarDown() {
    return (
        <nav className="w-full h-12 bg-(--Nav-bar-background) flex flex-row items-center justify-around p-4">
            {navItems.map((item) => (
                <NavItem key={item.path} {...item} />
            ))}
        </nav>
    );
}
