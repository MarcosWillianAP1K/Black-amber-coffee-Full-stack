/**
 * CardEmployee — Admin-specific employee card.
 */

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
        <div className="w-90 h-fit p-4 bg-(--Widget-background) rounded-md border border-(--Border) flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <PerfilCard
                    name={fullName}
                    email={email}
                    job={role}
                    avatarUrl={avatarUrl ?? undefined}
                />

                <div className="flex items-center gap-2">
                    {busy ? <LoadingSpinner size="xs" className="text-(--Primary)" /> : null}
                    <OptionsEllipsis
                        disabled={busy}
                        options={[
                            { label: "Ver Perfil", action: () => void handleAction(() => onViewEmployee(publicId)) },
                            {
                                label: isActive ? "Bloquear Funcionário" : "Desbloquear Funcionário",
                                action: () => void handleAction(() => onBlockEmployee(publicId)),
                            },
                            { label: "Excluir", action: () => setConfirmDelete(true), danger: true },
                        ]}
                    />
                </div>
            </div>

            <div className="w-full h-fit">
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
                    handleAction(() => onDeleteEmployee(publicId));
                }}
                onCancel={() => setConfirmDelete(false)}
            />
        </div>
    );
}
