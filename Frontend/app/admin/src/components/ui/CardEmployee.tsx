import { useState } from "react";
import { PerfilCard } from "ui-shared/components/ui/PerfilCard";
import { CompTime } from "ui-shared/components/CompTIme";
import { OptionsEllipsis } from "ui-shared/components/OptionElipisses";
import { ConfirmDialog } from "ui-shared/components/ConfirmDialog";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import type { Worker } from "shared-utils/types/worker";

export interface CardEmployeeProps extends Worker {
    onDeleteEmployee: (publicId: string) => void;
    onBlockEmployee: (publicId: string) => void;
    onViewEmployee: (publicId: string) => void;
    isPending?: boolean;
}

export function CardEmployee({
    publicId,
    fullName,
    email,
    role,
    avatarUrl,
    isActive,
    onDeleteEmployee,
    onBlockEmployee,
    onViewEmployee,
    isPending = false,
}: CardEmployeeProps) {
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
                        job={role}
                        avatarUrl={avatarUrl ?? undefined}
                    />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {busy ? <LoadingSpinner size="xs" className="text-(--Primary)" /> : null}
                    <OptionsEllipsis
                        disabled={busy}
                        options={[
                            {
                                label: "Ver Perfil",
                                action: () => void handleAction(() => onViewEmployee(publicId)),
                            },
                            {
                                label: isActive ? "Bloquear Funcionário" : "Desbloquear Funcionário",
                                action: () => void handleAction(() => onBlockEmployee(publicId)),
                            },
                            { label: "Excluir", action: () => setConfirmDelete(true), danger: true },
                        ]}
                    />
                </div>
            </div>

            <div className="w-full pt-2 border-t border-(--Border)/40">
                <CompTime active={isActive} />
            </div>

            <ConfirmDialog
                isOpen={confirmDelete}
                title="Excluir Funcionário"
                description={`Tem certeza que deseja excluir ${fullName}? Esta ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
                danger
                onConfirm={() => {
                    setConfirmDelete(false);
                    void handleAction(() => onDeleteEmployee(publicId));
                }}
                onCancel={() => setConfirmDelete(false)}
            />
        </div>
    );
}
