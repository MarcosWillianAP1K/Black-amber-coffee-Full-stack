import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, KeyRound, RotateCcw, UserCog } from "lucide-react";
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { FormBoxText } from "ui-shared/components/ui/FormBoxText";
import { ButtonPrimary } from "ui-shared/components/ui/ButtonPrimary";
import { useToastStore } from "shared-utils/stores/useToastStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useOrders } from "../hooks/useOrders";
import { useInventoryItems } from "../hooks/useInventoryItems";
import { APP_ROUTES } from "../utils/Path";

interface AdminPrefs {
    kdsUrgencyAlerts: boolean;
    stockBadgeAlerts: boolean;
}

const PREFS_KEY = "black_amber_admin_prefs";

function loadPrefs(): AdminPrefs {
    try {
        const raw = localStorage.getItem(PREFS_KEY);
        if (!raw) return { kdsUrgencyAlerts: true, stockBadgeAlerts: true };
        return JSON.parse(raw) as AdminPrefs;
    } catch {
        return { kdsUrgencyAlerts: true, stockBadgeAlerts: true };
    }
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
    const escape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function Settings() {
    const navigate = useNavigate();
    const showToast = useToastStore((s) => s.showToast);
    const { orders } = useOrders();
    const { items: inventoryItems } = useInventoryItems();

    const [prefs, setPrefs] = useState<AdminPrefs>(loadPrefs);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdatingPass, setIsUpdatingPass] = useState(false);

    const updatePrefs = (next: AdminPrefs) => {
        setPrefs(next);
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
        showToast({ variant: "success", title: "Preferências salvas" });
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            showToast({ variant: "error", title: "A senha deve ter no mínimo 6 caracteres." });
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast({ variant: "error", title: "As senhas informadas não conferem." });
            return;
        }
        setIsUpdatingPass(true);
        try {
            await useAuthStore.getState().updateMyProfile({ password: newPassword });
            setNewPassword("");
            setConfirmPassword("");
            showToast({ variant: "success", title: "Senha atualizada com sucesso!" });
        } catch (err) {
            showToast({
                variant: "error",
                title: "Erro ao atualizar senha",
                description: err instanceof Error ? err.message : undefined,
            });
        } finally {
            setIsUpdatingPass(false);
        }
    };

    const handleExportOrders = () => {
        downloadCsv(
            `pedidos-black-amber-${new Date().toISOString().slice(0, 10)}.csv`,
            ["Código", "Status", "Pagamento", "Total (R$)", "Criado Em"],
            orders.map((o) => [
                o.code || `#${o.id}`,
                o.status,
                o.paymentMethod ?? "N/A",
                o.totalPrice.toFixed(2),
                o.createdAt,
            ]),
        );
        showToast({ variant: "success", title: "Relatório CSV de pedidos exportado!" });
    };

    const handleExportInventory = () => {
        downloadCsv(
            `estoque-black-amber-${new Date().toISOString().slice(0, 10)}.csv`,
            ["Código", "Insumo", "Quantidade", "Unidade", "Status"],
            inventoryItems.map((i) => [i.code, i.name, i.amount, i.unit, i.status]),
        );
        showToast({ variant: "success", title: "Relatório CSV de estoque exportado!" });
    };

    return (
        <div className="w-full flex flex-col gap-6 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <DestakTitle
                    title="Configurações"
                    subtitle="Gerencie sua segurança, preferências operacionais e exportação de relatórios"
                />
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="min-h-10 px-4 py-2 rounded-lg border border-(--Border) text-(--Text-primary-off) text-xs font-secondary font-semibold uppercase tracking-wider hover:border-(--Primary) hover:text-(--Primary) transition-colors cursor-pointer"
                >
                    Voltar
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conta & Segurança */}
                <section className="rounded-xl border border-(--Border) bg-(--Widget-background) p-6 flex flex-col gap-5">
                    <div className="flex items-center justify-between border-b border-(--Border)/60 pb-3">
                        <div className="flex items-center gap-2">
                            <KeyRound size={18} className="text-(--Primary)" />
                            <h2 className="text-sm font-primary font-extrabold uppercase tracking-wider text-(--Primary)">
                                Segurança &amp; Conta
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate(APP_ROUTES.PERFIL)}
                            className="inline-flex items-center gap-1.5 text-xs font-secondary font-semibold text-(--Primary) hover:underline cursor-pointer"
                        >
                            <UserCog size={14} />
                            Editar Perfil
                        </button>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
                        <FormBoxText
                            title="Nova senha"
                            placeHolder="Mínimo 6 caracteres"
                            type="password"
                            value={newPassword}
                            required
                            minLength={6}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <FormBoxText
                            title="Confirmar nova senha"
                            placeHolder="Repita a nova senha"
                            type="password"
                            value={confirmPassword}
                            required
                            minLength={6}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <ButtonPrimary
                            type="submit"
                            isLoading={isUpdatingPass}
                            loadingText="Atualizando senha..."
                        >
                            Atualizar Senha
                        </ButtonPrimary>
                    </form>
                </section>

                {/* Preferências Operacionais & Exportação */}
                <div className="flex flex-col gap-6">
                    <section className="rounded-xl border border-(--Border) bg-(--Widget-background) p-6 flex flex-col gap-4">
                        <div className="border-b border-(--Border)/60 pb-3">
                            <h2 className="text-sm font-primary font-extrabold uppercase tracking-wider text-(--Primary)">
                                Preferências do Painel
                            </h2>
                        </div>

                        <label className="flex items-center justify-between gap-4 cursor-pointer">
                            <div>
                                <p className="text-sm font-primary font-bold text-(--Text-primary)">
                                    Alertas visuais de atraso no KDS
                                </p>
                                <p className="text-xs font-secondary text-(--Text-primary-off)">
                                    Destacar bordas dos pedidos com mais de 10 minutos na fila
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={prefs.kdsUrgencyAlerts}
                                onChange={(e) =>
                                    updatePrefs({ ...prefs, kdsUrgencyAlerts: e.target.checked })
                                }
                                className="w-5 h-5 accent-(--Primary) cursor-pointer"
                            />
                        </label>

                        <label className="flex items-center justify-between gap-4 cursor-pointer pt-3 border-t border-(--Border)/40">
                            <div>
                                <p className="text-sm font-primary font-bold text-(--Text-primary)">
                                    Indicador de estoque crítico
                                </p>
                                <p className="text-xs font-secondary text-(--Text-primary-off)">
                                    Exibir alertas no sino superior para insumos abaixo do mínimo
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={prefs.stockBadgeAlerts}
                                onChange={(e) =>
                                    updatePrefs({ ...prefs, stockBadgeAlerts: e.target.checked })
                                }
                                className="w-5 h-5 accent-(--Primary) cursor-pointer"
                            />
                        </label>

                        <button
                            type="button"
                            onClick={() =>
                                updatePrefs({ kdsUrgencyAlerts: true, stockBadgeAlerts: true })
                            }
                            className="mt-2 w-fit inline-flex items-center gap-1.5 text-xs font-secondary font-semibold text-(--Text-primary-off) hover:text-(--Primary) cursor-pointer"
                        >
                            <RotateCcw size={13} />
                            Restaurar preferências padrão
                        </button>
                    </section>

                    <section className="rounded-xl border border-(--Border) bg-(--Widget-background) p-6 flex flex-col gap-4">
                        <div className="border-b border-(--Border)/60 pb-3">
                            <h2 className="text-sm font-primary font-extrabold uppercase tracking-wider text-(--Primary)">
                                Exportar Dados (CSV)
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleExportOrders}
                                className="min-h-10 px-4 py-2 rounded-lg border border-(--Border) hover:border-(--Primary) text-(--Text-primary) hover:text-(--Primary) text-xs font-primary font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-colors"
                            >
                                <Download size={14} />
                                Baixar Pedidos ({orders.length})
                            </button>
                            <button
                                type="button"
                                onClick={handleExportInventory}
                                className="min-h-10 px-4 py-2 rounded-lg border border-(--Border) hover:border-(--Primary) text-(--Text-primary) hover:text-(--Primary) text-xs font-primary font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-colors"
                            >
                                <Download size={14} />
                                Baixar Estoque ({inventoryItems.length})
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
