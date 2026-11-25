import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, Clock, Coffee, Edit3, LogOut, RotateCcw, X } from "lucide-react";
import { StatusBadge } from "ui-shared/components/ui/StatusBadge";
import { ConfirmDialog } from "ui-shared/components/ConfirmDialog";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import { FormBoxText } from "ui-shared/components/ui/FormBoxText";
import { ButtonPrimary } from "ui-shared/components/ui/ButtonPrimary";
import { useToastStore } from "shared-utils/stores/useToastStore";
import { formatPrice } from "shared-utils/helpers/currency";
import {
    ORDER_STATUS_LABELS,
    formatPaymentMethod,
    type Order,
} from "shared-utils/types/order";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useMenu } from "../../hooks/useMenu";
import { useAuthStore } from "../../stores/useAuthStore";
import { useClientOrderStore } from "../../stores/useClientOrderStore";
import { APP_ROUTES } from "../../utils/Path";

const ORDER_BADGE_COLORS = {
    criado: { bg: "bg-(--Select-background)", text: "text-(--Text-primary-off)" },
    em_preparo: { bg: "bg-(--Primary)/15", text: "text-(--Primary)" },
    pronto: { bg: "bg-(--Info)/20", text: "text-(--Info)" },
    finalizado: { bg: "bg-(--Afirmation)/20", text: "text-(--Success-text)" },
    cancelado: { bg: "bg-(--Danger-bg)", text: "text-(--Danger-text)" },
};

export function Account() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { products } = useMenu();
    const { addItem } = useCart();
    const showToast = useToastStore((s) => s.showToast);

    const orders = useClientOrderStore((s) => s.orders);
    const isLoadingOrders = useClientOrderStore((s) => s.isLoading);
    const cancellingId = useClientOrderStore((s) => s.cancellingId);
    const refreshOrders = useClientOrderStore((s) => s.refresh);
    const cancelOrder = useClientOrderStore((s) => s.cancelOrder);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [fullName, setFullName] = useState(user?.fullName ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
    const [logoutOpen, setLogoutOpen] = useState(false);

    useEffect(() => {
        void refreshOrders();
    }, [refreshOrders]);

    useEffect(() => {
        if (!isEditOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsEditOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isEditOpen]);

    if (!user) return null;

    const activeOrdersCount = orders.filter(
        (o) => o.status === "criado" || o.status === "em_preparo" || o.status === "pronto",
    ).length;
    const totalSpent = orders
        .filter((o) => o.status !== "cancelado")
        .reduce((sum, o) => sum + o.totalPrice, 0);

    const openEditModal = () => {
        setFullName(user.fullName);
        setEmail(user.email);
        setPhone(user.phone ?? "");
        setProfileError(null);
        setIsEditOpen(true);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setProfileError(null);
        try {
            await useAuthStore.getState().updateProfile({
                fullName,
                email,
                phone: phone || null,
            });
            setIsEditOpen(false);
            showToast({ variant: "success", title: "Perfil atualizado com sucesso!" });
        } catch (err) {
            setProfileError(err instanceof Error ? err.message : "Erro ao atualizar perfil");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleConfirmCancel = async () => {
        if (!cancelTarget) return;
        const target = cancelTarget;
        setCancelTarget(null);
        try {
            await cancelOrder(target.publicId);
            showToast({
                variant: "info",
                title: `Pedido ${target.code || `#${target.id}`} cancelado`,
            });
        } catch (err) {
            showToast({
                variant: "error",
                title: "Não foi possível cancelar o pedido",
                description: err instanceof Error ? err.message : undefined,
            });
        }
    };

    const handleReorder = async (order: Order) => {
        let addedCount = 0;
        for (const item of order.itens) {
            const matchedProduct =
                products.find((p) => p.id === item.id || p.name === item.name) ?? null;
            if (matchedProduct) {
                await addItem(matchedProduct, item.quantity, item.observation);
                addedCount += 1;
            }
        }
        if (addedCount > 0) {
            showToast({
                variant: "success",
                title: "Itens adicionados ao carrinho",
                description: "Revise seu pedido antes de finalizar.",
            });
            navigate(APP_ROUTES.CART);
        } else {
            showToast({
                variant: "warning",
                title: "Produtos indisponíveis no momento",
            });
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-primary font-extrabold text-(--Text-primary) uppercase">
                        Minha Conta
                    </h1>
                    <p className="text-sm font-secondary text-(--Text-primary-off) mt-1">
                        Gerencie seus dados e acompanhe seus pedidos
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setLogoutOpen(true)}
                    className="min-h-10 px-4 py-2 rounded-lg border border-(--Danger-border) bg-(--Danger-bg) text-(--Danger-text) text-xs font-primary font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-(--Negacion) hover:text-white transition-colors cursor-pointer"
                >
                    <LogOut size={15} />
                    Sair da Conta
                </button>
            </div>

            {/* Dados do Perfil */}
            <section className="p-5 sm:p-6 bg-(--Widget-background) rounded-xl border border-(--Border)/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-(--Button-background) border border-(--Border)/60 flex items-center justify-center shrink-0">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-(--Primary) text-2xl font-primary font-extrabold">
                                {user.fullName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-primary font-extrabold text-(--Text-primary) wrap-break-word">
                            {user.fullName}
                        </h2>
                        <p className="text-sm font-secondary text-(--Text-primary-off) break-all">
                            {user.email}
                        </p>
                        <p className="text-xs font-secondary text-(--Text-primary-off)/80 mt-0.5">
                            {user.phone ? `Tel.: ${user.phone}` : "Telefone não informado"} • Membro desde{" "}
                            {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={openEditModal}
                    className="min-h-10 px-4 py-2 bg-(--Primary) hover:bg-(--Primary-selected) text-(--Text-dark) text-xs font-primary font-extrabold uppercase tracking-wider rounded-lg inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-colors"
                >
                    <Edit3 size={14} />
                    Editar Perfil
                </button>
            </section>

            {/* Indicadores Reais */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-(--Widget-background) rounded-xl border border-(--Border)/50 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-(--Primary)/15 text-(--Primary) flex items-center justify-center shrink-0">
                        <Coffee size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-secondary uppercase tracking-wider text-(--Text-primary-off)">
                            Pedidos Realizados
                        </p>
                        <p className="text-2xl font-primary font-extrabold text-(--Text-primary) tabular-nums">
                            {orders.length}
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-(--Widget-background) rounded-xl border border-(--Border)/50 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-(--Info)/15 text-(--Info) flex items-center justify-center shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-secondary uppercase tracking-wider text-(--Text-primary-off)">
                            Pedidos em Andamento
                        </p>
                        <p className="text-2xl font-primary font-extrabold text-(--Text-primary) tabular-nums">
                            {activeOrdersCount}
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-(--Widget-background) rounded-xl border border-(--Border)/50 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-(--Afirmation)/15 text-(--Success-text) flex items-center justify-center shrink-0">
                        <Banknote size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-secondary uppercase tracking-wider text-(--Text-primary-off)">
                            Total em Pedidos
                        </p>
                        <p className="text-2xl font-primary font-extrabold text-(--Text-primary) tabular-nums">
                            {formatPrice(totalSpent)}
                        </p>
                    </div>
                </div>
            </section>

            {/* Histórico de Pedidos */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-primary font-extrabold text-(--Text-primary)">
                        Histórico de Pedidos
                    </h2>
                    <button
                        type="button"
                        onClick={() => void refreshOrders()}
                        className="text-xs font-secondary font-semibold text-(--Primary) hover:underline cursor-pointer"
                    >
                        Atualizar lista
                    </button>
                </div>

                {isLoadingOrders && orders.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm font-secondary text-(--Text-primary-off) py-4">
                        <LoadingSpinner size="sm" className="text-(--Primary)" />
                        <span>Carregando seu histórico...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-xl border border-(--Border)/50 bg-(--Widget-background) p-8 text-center flex flex-col items-center gap-3">
                        <p className="text-sm font-secondary text-(--Text-primary-off)">
                            Você ainda não realizou nenhum pedido.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate(APP_ROUTES.MENU)}
                            className="px-4 py-2 rounded-lg bg-(--Primary) text-(--Text-dark) text-xs font-primary font-extrabold uppercase tracking-wider cursor-pointer"
                        >
                            Fazer Primeiro Pedido
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {orders.map((order) => (
                            <article
                                key={order.publicId}
                                className="rounded-xl border border-(--Border)/50 bg-(--Widget-background) p-4 sm:p-5 flex flex-col gap-3"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--Border)/40 pb-3">
                                    <div>
                                        <span className="text-sm sm:text-base font-primary font-extrabold text-(--Primary)">
                                            {order.code || `Pedido #${order.id}`}
                                        </span>
                                        <p className="text-xs font-secondary text-(--Text-primary-off)">
                                            {new Date(order.createdAt).toLocaleString("pt-BR")} •{" "}
                                            {formatPaymentMethod(order.paymentMethod)}
                                        </p>
                                    </div>
                                    <StatusBadge status={order.status} colorMap={ORDER_BADGE_COLORS}>
                                        {ORDER_STATUS_LABELS[order.status]}
                                    </StatusBadge>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    {order.itens.map((item, idx) => (
                                        <div
                                            key={`${order.publicId}-${item.id}-${idx}`}
                                            className="flex justify-between text-sm font-secondary text-(--Text-gray)"
                                        >
                                            <span>
                                                {item.quantity}x {item.name}
                                            </span>
                                            <span className="tabular-nums text-(--Text-primary-off)">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {order.observation && (
                                    <p className="text-xs font-secondary text-(--Text-primary-off) bg-(--Page-background) rounded-md px-3 py-2 border border-(--Border)/40">
                                        Obs.: {order.observation}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-(--Border)/40">
                                    <span className="text-base font-primary font-extrabold text-(--Text-primary) tabular-nums">
                                        Total: {formatPrice(order.totalPrice)}
                                    </span>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {order.status === "criado" && (
                                            <button
                                                type="button"
                                                disabled={cancellingId === order.publicId}
                                                onClick={() => setCancelTarget(order)}
                                                className="min-h-9 px-3.5 py-1.5 rounded-md border border-(--Danger-border) bg-(--Danger-bg) text-(--Danger-text) text-xs font-primary font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                                            >
                                                {cancellingId === order.publicId
                                                    ? "Cancelando..."
                                                    : "Cancelar Pedido"}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => void handleReorder(order)}
                                            className="min-h-9 px-3.5 py-1.5 rounded-md border border-(--Border) text-(--Text-primary) hover:border-(--Primary) hover:text-(--Primary) text-xs font-primary font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                                        >
                                            <RotateCcw size={13} />
                                            Pedir Novamente
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Modal Editar Perfil */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="Fechar edição"
                        onClick={() => setIsEditOpen(false)}
                        className="absolute inset-0 bg-black/70 backdrop-blur-xs"
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-profile-title"
                        className="relative w-full max-w-md rounded-xl border border-(--Border) bg-(--Widget-background) p-6 shadow-2xl flex flex-col gap-5"
                    >
                        <div className="flex items-center justify-between">
                            <h3
                                id="edit-profile-title"
                                className="text-lg font-primary font-extrabold text-(--Text-primary)"
                            >
                                Editar Perfil
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
                                aria-label="Fechar"
                                className="p-1.5 rounded-md text-(--Text-primary-off) hover:text-(--Text-primary) cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                            <FormBoxText
                                title="Nome completo"
                                placeHolder="Seu nome"
                                type="text"
                                value={fullName}
                                required
                                minLength={2}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                            <FormBoxText
                                title="E-mail"
                                placeHolder="seu@email.com"
                                type="email"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <FormBoxText
                                title="Telefone (opcional)"
                                placeHolder="(11) 99999-9999"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />

                            {profileError && (
                                <div className="rounded-md border border-(--Danger-border) bg-(--Danger-bg) px-3 py-2 text-xs text-(--Danger-text)">
                                    {profileError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="flex-1 min-h-10 rounded-md border border-(--Border) text-(--Text-primary-off) text-xs font-primary font-bold uppercase cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <div className="flex-1">
                                    <ButtonPrimary
                                        type="submit"
                                        isLoading={isSavingProfile}
                                        loadingText="Salvando..."
                                    >
                                        Salvar
                                    </ButtonPrimary>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={cancelTarget !== null}
                title="Cancelar Pedido"
                description={`Deseja cancelar o pedido ${cancelTarget?.code || `#${cancelTarget?.id}`}?`}
                confirmLabel="Cancelar Pedido"
                cancelLabel="Voltar"
                danger
                onCancel={() => setCancelTarget(null)}
                onConfirm={() => void handleConfirmCancel()}
            />

            <ConfirmDialog
                isOpen={logoutOpen}
                title="Sair da conta"
                description="Tem certeza que deseja encerrar sua sessão neste dispositivo?"
                confirmLabel="Sair"
                cancelLabel="Cancelar"
                danger
                onCancel={() => setLogoutOpen(false)}
                onConfirm={() => {
                    setLogoutOpen(false);
                    void logout();
                }}
            />
        </div>
    );
}
