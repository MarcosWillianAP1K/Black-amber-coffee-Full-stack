/**
 * CardEmployee — Admin-specific employee card.
 */

import { useState } from "react";
import { PerfilCard } from "ui-shared/components/ui/PerfilCard";
import { CompTime } from "ui-shared/components/CompTIme";
import { OptionsEllipsis } from "ui-shared/components/OptionElipisses";
import { ConfirmDialog } from "ui-shared/components/ConfirmDialog";
import type { Worker } from "shared-utils/types/worker";

export interface CardEmployeeProps extends Worker {
    onDeleteEmployee: (publicId: string) => void;
    onBlockEmployee: (publicId: string) => void;
    onViewEmployee: (publicId: string) => void;
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
}: CardEmployeeProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleAction = async (action: () => void) => {
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

                <OptionsEllipsis
                    disabled={isProcessing}
                    options={[
                        { label: "Ver Perfil", action: () => handleAction(() => onViewEmployee(publicId)) },
                        { label: "Bloquear Funcionário", action: () => handleAction(() => onBlockEmployee(publicId)) },
                        { label: "Excluir", action: () => setConfirmDelete(true), danger: true },
                    ]}
                />
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
