/**
 * CardEmployee — Admin-specific employee card.
 * Combines PerfilCard (avatar + name + email) with CompTime.
 * Uses OptionsEllipsis for the dropdown menu with dynamic actions.
 */

import { useState } from "react";
import { PerfilCard } from "ui-shared/components/ui/PerfilCard";
import { CompTime } from "ui-shared/components/CompTIme";
import { OptionsEllipsis } from "ui-shared/components/OptionElipisses";
import { ConfirmDialog } from "ui-shared/components/ConfirmDialog";
import type { Worker } from "shared-utils/types/worker";

/** CardEmployee props = Worker data + action callbacks */
export interface CardEmployeeProps extends Worker {
    onDeleteEmployee: (publicId: string) => void;
    onBlockEmployee: (publicId: string) => void;
    onViewEmployee: (publicId: string) => void;
}

export function CardEmployee({ publicId, profile, role, isActive, onDeleteEmployee, onBlockEmployee, onViewEmployee }: CardEmployeeProps) {
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

            {/* Top: Profile + Options dropdown */}
            <div className="flex items-start justify-between">
                <PerfilCard
                    name={profile.fullName}
                    email={profile.email}
                    job={role}
                    avatarUrl={profile.avatarImage ?? undefined}
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

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmDelete}
                title="Delete Employee"
                description={`Are you sure you want to delete ${profile.fullName}? This action cannot be undone.`}
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