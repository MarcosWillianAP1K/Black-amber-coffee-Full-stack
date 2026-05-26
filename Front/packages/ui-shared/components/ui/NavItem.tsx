import type { ElementType } from "react";
import { NavLink } from "react-router-dom"; // 1. Importamos o NavLink

interface NavItemProps {
    icon: ElementType;
    label: string;
    to: string; // 2. Trocamos isActive e onClick pelo 'to' (para onde o link vai)
}

export function NavItem({ icon: Icon, label, to }: NavItemProps) {
    return (
        // 3. Trocamos a tag <button> por <NavLink>
        <NavLink
            to={to}
            // 4. A mágica acontece aqui: o className vira uma função que recebe o isActive do próprio roteador!
            className={({ isActive }) =>
                `w-full flex items-center gap-4 px-6 py-3 text-sm font-primary font-medium transition-colors border-r-4 ${
                    isActive
                        ? "bg-(--Button-background) text-(--Primary) border-(--Primary)" // Cores quando selecionado
                        : "text-(--Text-primary-off) border-transparent hover:bg-(--Button-background) hover:text-(--Text-gray)" // Cores normais
                }`
            }
        >
            <Icon size={20} />
            <span>{label}</span>
        </NavLink>
    );
}