import { useEffect, useState } from "react";
import {
    Settings,
    Shield,
    Bell,
    History,
    Languages,
    Moon,
    HelpCircle,
    Info,
    Coffee,
    Banknote,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { fetchMyOrders } from "../../services/orderService.ts";
import type { Order } from "shared-utils/types/order";

interface MenuOption {
    icon: React.ElementType;
    label: string;
}

const ACCOUNT_OPTIONS: MenuOption[] = [
    { icon: Settings, label: "Configurações" },
    { icon: Shield, label: "Security" },
    { icon: Bell, label: "Notification" },
    { icon: History, label: "Purchase history" },
];

const PREFERENCE_OPTIONS: MenuOption[] = [
    { icon: Languages, label: "Language" },
    { icon: Moon, label: "Theme" },
];

const SUPPORT_OPTIONS: MenuOption[] = [
    { icon: HelpCircle, label: "Help center" },
    { icon: Info, label: "About Us" },
];

function MenuSection({ title, options }: { title: string; options: MenuOption[] }) {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-(--Text-primary-off) text-xs font-secondary uppercase tracking-wider px-1">
                {title}
            </p>
            {options.map(({ icon: Icon, label }) => (
                <button
                    key={label}
                    type="button"
                    className="w-full flex items-center gap-4 p-4 bg-(--Widget-background) rounded-md border border-(--Border)/20 text-left hover:border-(--Primary)/40 transition-colors"
                >
                    <Icon size={18} className="text-(--Primary)" />
                    <span className="text-(--Text-gray) text-sm font-secondary">{label}</span>
                </button>
            ))}
        </div>
    );
}

export function Account() {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        fetchMyOrders()
            .then(setOrders)
            .catch(() => setOrders([]));
    }, []);

    const completedOrders = orders.filter((o) => o.status === "finalizado");
    const totalSaved = completedOrders.reduce((sum, o) => sum + o.totalPrice * 0.1, 0);

    if (!user) return null;

    return (
        <div className="w-full max-w-lg mx-auto gap-6 flex flex-col pb-8">
            <h1 className="text-(--Text-gray) text-2xl font-primary font-bold uppercase">Profile</h1>

            <div className="p-4 bg-(--Widget-background) rounded-md border border-(--Border)/30 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-(--Button-background) flex items-center justify-center shrink-0">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-(--Primary) text-xl font-primary font-bold">
                                {user.fullName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-(--Text-gray) font-primary font-bold truncate">{user.fullName}</h2>
                        <p className="text-(--Text-primary-off) text-sm font-secondary truncate">{user.email}</p>
                    </div>
                    <button
                        type="button"
                        className="px-3 py-1.5 bg-(--Primary) text-(--Text-dark) text-xs font-secondary font-bold rounded-sm shrink-0"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-(--Widget-background) rounded-md border border-(--Border)/20 flex flex-col items-center gap-2">
                    <Coffee size={20} className="text-(--Primary)" />
                    <span className="text-(--Text-primary-off) text-[10px] font-secondary uppercase">Orders</span>
                    <span className="text-(--Text-gray) text-xl font-primary font-bold">{orders.length}</span>
                </div>
                <div className="p-4 bg-(--Widget-background) rounded-md border border-(--Border)/20 flex flex-col items-center gap-2">
                    <Banknote size={20} className="text-(--Primary)" />
                    <span className="text-(--Text-primary-off) text-[10px] font-secondary uppercase">Saved</span>
                    <span className="text-(--Text-gray) text-xl font-primary font-bold">${totalSaved.toFixed(2)}</span>
                </div>
                <div className="p-4 bg-(--Widget-background) rounded-md border border-(--Border)/20 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border-2 border-(--Primary) flex items-center justify-center">
                        <span className="text-(--Primary) text-xs font-bold">60%</span>
                    </div>
                    <span className="text-(--Text-primary-off) text-[10px] font-secondary uppercase">Score</span>
                    <span className="text-(--Text-gray) text-xl font-primary font-bold">500</span>
                </div>
            </div>

            <MenuSection title="Account" options={ACCOUNT_OPTIONS} />
            <MenuSection title="Preferences" options={PREFERENCE_OPTIONS} />
            <MenuSection title="Support" options={SUPPORT_OPTIONS} />

            <button
                type="button"
                onClick={() => logout()}
                className="w-full py-3 border border-(--Negacion) text-(--Negacion) rounded-sm font-secondary font-bold text-sm uppercase"
            >
                Sair
            </button>
        </div>
    );
}
