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
                        { label: "View Profile", action: () => handleAction(() => onViewEmployee(publicId)) },
                        { label: "Block Employee", action: () => handleAction(() => onBlockEmployee(publicId)) },
                        { label: "Delete", action: () => setConfirmDelete(true), danger: true },
                    ]}
                />
            </div>

            <div className="w-full h-fit">
                <CompTime active={isActive} />
            </div>

            <ConfirmDialog
                isOpen={confirmDelete}
                title="Delete Employee"
                description={`Are you sure you want to delete ${fullName}? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
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
