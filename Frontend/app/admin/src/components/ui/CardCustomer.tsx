/**
 * CardCustomer — Admin-specific customer card.
 * Combines PerfilCard (avatar + name + email).
 * Uses OptionsEllipsis for the dropdown menu with dynamic actions.
 */

import { PerfilCard } from "ui-shared/components/ui/PerfilCard";
import { OptionsEllipsis } from "ui-shared/components/OptionElipisses";
import type { User as Customer } from "shared-utils/types/user";

/** CardCustomer props = Customer data + action callbacks */
export interface CardCustomerProps extends Customer {
    onDeleteCustomer: (publicId: string) => void;
    onBlockCustomer: (publicId: string) => void;
    onViewCustomer: (publicId: string) => void;
}

export function CardCustomer({ publicId, email, profile, onDeleteCustomer, onBlockCustomer, onViewCustomer }: CardCustomerProps) {
    return (
        <div className="w-90 h-fit p-4 bg-(--Widget-background) rounded-md border border-(--Border) flex flex-col gap-6">
            {/* Top: Profile + Options dropdown */}
            <div className="flex items-start justify-between">
                <PerfilCard
                    name={profile.fullName}
                    email={email}
                    avatarUrl={profile.avatarImage ?? undefined}
                />

                <OptionsEllipsis
                    options={[
                        { label: "View Profile", action: () => onViewCustomer(publicId) },
                        { label: "Block Customer", action: () => onBlockCustomer(publicId) },
                        { label: "Delete", action: () => onDeleteCustomer(publicId), danger: true },
                    ]}
                />
            </div>

            <div className="w-full h-fit">
                <p className="text-(--Text-primary-off) text-xs font-secondary">
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
