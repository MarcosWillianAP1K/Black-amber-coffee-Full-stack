import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Edit3, X } from "lucide-react";
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { CompTime } from "ui-shared/components/CompTIme";
import { FormBoxText } from "ui-shared/components/ui/FormBoxText";
import { ButtonPrimary } from "ui-shared/components/ui/ButtonPrimary";
import { useToastStore } from "shared-utils/stores/useToastStore";
import { useCustomers } from "../hooks/useCustomers";
import { useEmployee } from "../hooks/useEmployee";
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../stores/useAuthStore";
import type { Worker } from "shared-utils/types/worker";

export const Perfil = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { kind, id } = useParams();
    const { customers, isLoading: customersLoading } = useCustomers();
    const { employees, isLoading: employeesLoading, refresh: refreshEmployees } = useEmployee();
    const { user: loggedUser } = useAuth();
    const showToast = useToastStore((s) => s.showToast);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const resolvedKind = kind === "customer" || kind === "employee" ? kind : null;

    const profile = useMemo(() => {
        if (resolvedKind === "customer" && id) {
            return customers.find((customer) => customer.publicId === id) ?? null;
        }

        if (resolvedKind === "employee" && id) {
            const match = employees.find((employee) => employee.publicId === id);
            if (match) return match;
            if (loggedUser && loggedUser.publicId === id) return loggedUser;
            return null;
        }

        return resolvedKind ? null : loggedUser ?? null;
    }, [resolvedKind, id, customers, employees, loggedUser]);

    useEffect(() => {
        if (!isEditOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsEditOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isEditOpen]);

    const isLoading =
        (resolvedKind === "customer" && customersLoading) ||
        (resolvedKind === "employee" && employeesLoading);

    const profileSubtitle =
        resolvedKind === "customer"
            ? "Detalhes da conta do cliente"
            : resolvedKind === "employee"
              ? "Detalhes da conta do colaborador"
              : "Seu perfil operacional";

    if (!profile && isLoading) {
        return (
            <div className="w-full py-12 flex items-center justify-center text-(--Text-primary-off) text-sm font-secondary">
                Carregando perfil...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="w-full py-12 flex items-center justify-center text-(--Text-primary-off) text-sm font-secondary">
                Perfil não encontrado
            </div>
        );
    }

    const isOwnProfile = Boolean(loggedUser && profile.publicId === loggedUser.publicId);
    const isEmployee = resolvedKind === "employee" || (resolvedKind === null && Boolean(loggedUser));
    const accountType = isEmployee ? "Funcionário" : "Cliente";
    const fullNameDisplay = profile.fullName;
    const emailDisplay = profile.email;
    const avatarImage = profile.avatarUrl;
    const worker = isEmployee && "role" in profile ? (profile as Worker) : null;
    const statusLabel = worker
        ? worker.isActive
            ? "Ativo"
            : "Inativo"
        : profile.isActive === false
          ? "Bloqueado"
          : "Ativo";
    const roleLabel = worker ? worker.role : "Cliente da Cafeteria";
    const profileId = profile.publicId;
    const backLabel =
        (location.state as { from?: string } | null)?.from === "staff"
            ? "Voltar para Equipe"
            : "Voltar";

    const openEdit = () => {
        setFullName(profile.fullName);
        setEmail(profile.email);
        setPhone(profile.phone ?? "");
        setSaveError(null);
        setIsEditOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveError(null);
        try {
            await useAuthStore.getState().updateMyProfile({
                fullName,
                email,
                phone: phone.trim() ? phone.trim() : undefined,
            });
            void refreshEmployees();
            setIsEditOpen(false);
            showToast({ variant: "success", title: "Seus dados foram atualizados" });
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Erro ao atualizar perfil");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-6 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <DestakTitle title="Perfil" subtitle={profileSubtitle} />

                <div className="flex items-center gap-3">
                    {isOwnProfile && (
                        <button
                            type="button"
                            onClick={openEdit}
                            className="min-h-10 px-4 py-2 rounded-lg bg-(--Primary) hover:bg-(--Primary-selected) text-(--Text-dark) text-xs font-primary font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                            <Edit3 size={14} />
                            Editar Meu Perfil
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="min-h-10 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--Border) text-(--Text-primary-off) text-xs font-secondary font-semibold uppercase tracking-wider hover:border-(--Primary) hover:text-(--Primary) transition-all duration-200 cursor-pointer"
                        aria-label={backLabel}
                    >
                        {backLabel}
                    </button>
                </div>
            </div>

            <div className="grid w-full gap-6 xl:grid-cols-[340px_1fr]">
                <div className="rounded-xl border border-(--Border) bg-(--Widget-background) p-6 flex flex-col gap-5">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-(--Border2) bg-(--Button-background) flex items-center justify-center text-(--Primary) text-3xl font-primary font-extrabold">
                        {avatarImage ? (
                            <img
                                src={avatarImage}
                                alt={fullNameDisplay}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            fullNameDisplay.charAt(0).toUpperCase()
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <div>
                            <h2 className="text-(--Text-primary) text-xl sm:text-2xl font-primary font-extrabold leading-snug wrap-break-word">
                                {fullNameDisplay}
                            </h2>
                            <p className="text-(--Text-primary-off) text-sm font-secondary break-all mt-1">
                                {emailDisplay}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3.5 py-1 rounded-full text-xs font-secondary font-semibold uppercase tracking-wider border border-(--Border) bg-(--Select-background) text-(--Text-primary-off)">
                                {accountType}
                            </span>
                            <span
                                className={`px-3.5 py-1 rounded-full text-xs font-secondary font-semibold uppercase tracking-wider ${
                                    statusLabel === "Ativo"
                                        ? "bg-(--Afirmation)/20 text-(--Success-text)"
                                        : "bg-(--Danger-bg) text-(--Danger-text)"
                                }`}
                            >
                                {statusLabel}
                            </span>
                        </div>

                        <div className="pt-2 text-xs font-secondary text-(--Text-gray) capitalize">
                            <span className="text-(--Primary-off) font-semibold">Função:</span>{" "}
                            {roleLabel}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="rounded-xl border border-(--Border) bg-(--Widget-background) p-6">
                        <h3 className="text-(--Primary) text-xs font-primary font-extrabold tracking-[0.25em] uppercase">
                            Visão geral da conta
                        </h3>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-1 rounded-lg border border-(--Border)/70 bg-(--Page-background) p-4">
                                <span className="text-[11px] font-secondary font-semibold uppercase tracking-wider text-(--Text-primary-off)">
                                    Tipo de conta
                                </span>
                                <span className="text-(--Text-primary) text-base font-primary font-extrabold">
                                    {accountType}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1 rounded-lg border border-(--Border)/70 bg-(--Page-background) p-4">
                                <span className="text-[11px] font-secondary font-semibold uppercase tracking-wider text-(--Text-primary-off)">
                                    Status
                                </span>
                                <span className="text-(--Text-primary) text-base font-primary font-extrabold">
                                    {statusLabel}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1 rounded-lg border border-(--Border)/70 bg-(--Page-background) p-4">
                                <span className="text-[11px] font-secondary font-semibold uppercase tracking-wider text-(--Text-primary-off)">
                                    E-mail
                                </span>
                                <span className="text-(--Text-primary) text-sm font-primary font-bold break-all">
                                    {emailDisplay}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1 rounded-lg border border-(--Border)/70 bg-(--Page-background) p-4">
                                <span className="text-[11px] font-secondary font-semibold uppercase tracking-wider text-(--Text-primary-off)">
                                    Telefone
                                </span>
                                <span className="text-(--Text-primary) text-sm font-primary font-bold">
                                    {profile.phone || "Não informado"}
                                </span>
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-1 rounded-lg border border-(--Border)/70 bg-(--Page-background) p-4">
                                <span className="text-[11px] font-secondary font-semibold uppercase tracking-wider text-(--Text-primary-off)">
                                    ID do membro
                                </span>
                                <span className="text-(--Text-primary-off) text-xs font-mono break-all">
                                    {profileId}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-(--Border) bg-(--Widget-background) p-6">
                        {worker ? (
                            <CompTime active={worker.isActive} />
                        ) : (
                            <div className="text-(--Text-primary-off) text-sm font-secondary">
                                Membro desde {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                        aria-labelledby="edit-worker-title"
                        className="relative w-full max-w-md rounded-xl border border-(--Border) bg-(--Widget-background) p-6 shadow-2xl flex flex-col gap-5"
                    >
                        <div className="flex items-center justify-between">
                            <h3
                                id="edit-worker-title"
                                className="text-lg font-primary font-extrabold text-(--Text-primary)"
                            >
                                Editar Meus Dados
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

                        <form onSubmit={handleSave} className="flex flex-col gap-4">
                            <FormBoxText
                                title="Nome completo"
                                placeHolder="Seu nome"
                                type="text"
                                value={fullName}
                                required
                                onChange={(e) => setFullName(e.target.value)}
                            />
                            <FormBoxText
                                title="E-mail"
                                placeHolder="seu@blackamber.com"
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

                            {saveError && (
                                <div className="rounded-md border border-(--Danger-border) bg-(--Danger-bg) px-3 py-2 text-xs text-(--Danger-text)">
                                    {saveError}
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
                                    <ButtonPrimary type="submit" isLoading={isSaving} loadingText="Salvando...">
                                        Salvar
                                    </ButtonPrimary>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
