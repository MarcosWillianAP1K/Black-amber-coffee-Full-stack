import { useState } from "react";
import { PerfilCard } from "ui-shared/components/ui/PerfilCard";
import { OptionsEllipsis } from "ui-shared/components/OptionElipisses";
import { ConfirmDialog } from "ui-shared/components/ConfirmDialog";
import { StatusBadge, type StatusColorMap } from "ui-shared/components/ui/StatusBadge";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import type { User as Customer } from "shared-utils/types/user";

const CUSTOMER_STATUS_COLORS: StatusColorMap = {
    active: { bg: "bg-(--Afirmation)/20", text: "text-(--Success-text)" },
    blocked: { bg: "bg-(--Danger-bg)", text: "text-(--Danger-text)" },
};

export interface CardCustomerProps extends Customer {
    onDeleteCustomer: (publicId: string) => void | Promise<void>;
    onBlockCustomer: (publicId: string) => void | Promise<void>;
    onViewCustomer: (publicId: string) => void;
    isPending?: boolean;
}

export function CardCustomer({
    publicId,
    email,
    fullName,
    avatarUrl,
    isActive = true,
    createdAt,
    onDeleteCustomer,
    onBlockCustomer,
    onViewCustomer,
    isPending = false,
}: CardCustomerProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const busy = isPending || isProcessing;

    const handleAction = async (action: () => void | Promise<void>) => {
        setIsProcessing(true);
        try {
            await action();
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full p-4 bg-(--Page-background) rounded-lg border border-(--Border)/70 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                    <PerfilCard
                        name={fullName}
                        email={email}
                        avatarUrl={avatarUrl ?? undefined}
                    />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {busy ? <LoadingSpinner size="xs" className="text-(--Primary)" /> : null}
                    <OptionsEllipsis
                        disabled={busy}
                        options={[
                            { label: "Ver Perfil", action: () => onViewCustomer(publicId) },
                            {
                                label: isActive ? "Bloquear Cliente" : "Desbloquear Cliente",
                                action: () => void handleAction(() => onBlockCustomer(publicId)),
                            },
                            { label: "Excluir", action: () => setConfirmDelete(true), danger: true },
                        ]}
                    />
                </div>
            </div>

            <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-(--Border)/40">
                <p className="text-(--Text-primary-off) text-xs font-secondary">
                    Membro desde {new Date(createdAt).toLocaleDateString("pt-BR")}
                </p>

                <StatusBadge
                    status={isActive ? "active" : "blocked"}
                    colorMap={CUSTOMER_STATUS_COLORS}
                >
                    {isActive ? "Ativo" : "Bloqueado"}
                </StatusBadge>
            </div>

            <ConfirmDialog
                isOpen={confirmDelete}
                title="Excluir Cliente"
                description={`Tem certeza que deseja excluir ${fullName}? Esta ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
                danger
                onConfirm={() => {
                    setConfirmDelete(false);
                    void handleAction(() => onDeleteCustomer(publicId));
                }}
                onCancel={() => setConfirmDelete(false)}
            />
        </div>
    );
}
