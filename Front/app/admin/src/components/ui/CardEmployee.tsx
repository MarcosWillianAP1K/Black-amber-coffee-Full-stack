/**
 * CardEmployee — Admin-specific employee card.
 * Combines PerfilCard (avatar + name + email) with CompTime.
 * Uses OptionsEllipsis for the dropdown menu with dynamic actions.
 */

import { PerfilCard } from "ui-shared/components/ui/PerfilCard";
import { CompTime } from "ui-shared/components/CompTIme";
import { OptionsEllipsis } from "ui-shared/components/OptionElipisses";
import type { Worker } from "shared-utils/types/worker";

/** CardEmployee props = Worker data + action callbacks */
export interface CardEmployeeProps extends Worker {
    onDeleteEmployee: (publicId: string) => void;
    onBlockEmployee: (publicId: string) => void;
    onViewEmployee: (publicId: string) => void;
}

export function CardEmployee({ publicId, profile, role, isActive, onDeleteEmployee, onBlockEmployee, onViewEmployee }: CardEmployeeProps) {
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
                    options={[
                        { label: "View Profile", action: () => onViewEmployee(publicId) },
                        { label: "Block Employee", action: () => onBlockEmployee(publicId) },
                        { label: "Delete", action: () => onDeleteEmployee(publicId), danger: true },
                    ]}
                />
            </div>

            <div className="w-full h-fit">
                <CompTime active={isActive} />
            </div>
        </div>
    );
}