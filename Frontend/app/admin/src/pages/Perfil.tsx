import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { CompTime } from "ui-shared/components/CompTIme";
import { useCustomers } from "../hooks/useCustomers";
import { useEmployee } from "../hooks/useEmployee";
import { useAuth } from "../hooks/useAuth";
import type { Worker } from "shared-utils/types/worker";

export const Perfil = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { kind, id } = useParams();
    const { customers, isLoading: customersLoading } = useCustomers();
    const { employees, isLoading: employeesLoading } = useEmployee();
    const { user: loggedUser } = useAuth();

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

    const isLoading =
        (resolvedKind === "customer" && customersLoading) ||
        (resolvedKind === "employee" && employeesLoading);

    const profileSubtitle = resolvedKind === "customer"
        ? "Customer profile"
        : resolvedKind === "employee"
            ? "Employee profile"
            : "Your profile";

    if (!profile && isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center text-(--Text-primary-off) text-sm font-secondary">
                Loading profile...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="w-full h-full flex items-center justify-center text-(--Text-primary-off) text-sm font-secondary">
                Profile not found
            </div>
        );
    }

    const isEmployee = resolvedKind === "employee" || (resolvedKind === null && !!loggedUser);
    const accountType = isEmployee ? "Employee" : "Customer";
    const fullName = profile.fullName;
    const email = profile.email;
    const avatarImage = profile.avatarUrl;
    const worker = isEmployee && "role" in profile ? (profile as Worker) : null;
    const statusLabel = worker ? (worker.isActive ? "Active" : "Inactive") : "Member";
    const roleLabel = worker ? worker.role : "Loyalty member";
    const profileId = profile.publicId;
    const backLabel = (location.state as { from?: string } | null)?.from === "staff"
        ? "Back to Staff"
        : "Back";

    return (
        <div className="w-full min-h-screen gap-6 flex flex-col bg-(--Page-background) p-4">
            <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-0 flex-1">
                    <DestakTitle title="Profile" subtitle={profileSubtitle} />
                </div>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-(--Border) text-(--Text-primary-off) text-xs font-secondary font-semibold uppercase tracking-wider hover:border-(--Primary) hover:text-(--Primary) transition-all duration-200"
                    aria-label={backLabel}
                >
                    {backLabel}
                </button>
            </div>

            <div className="grid w-full gap-6 xl:grid-cols-[340px_1fr]">
                <div className="relative overflow-hidden rounded-sm border border-(--Border) bg-(--Widget-background) p-6">

                    <div className="relative flex flex-col gap-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border border-(--Border2) bg-(--Button-background) flex items-center justify-center text-(--Primary) text-3xl font-primary font-extrabold">
                            {avatarImage ? (
                                <img
                                    src={avatarImage}
                                    alt={fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                fullName.charAt(0).toUpperCase()
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <div>
                                <h2 className="text-(--Text-gray) text-2xl md:text-3xl font-primary font-extrabold tracking-wide">
                                    {fullName}
                                </h2>
                                <p className="text-(--Text-primary-off) text-sm font-secondary break-all">
                                    {email}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-4 py-1.5 rounded-full text-[11px] font-secondary font-semibold uppercase tracking-wider border border-(--Border2) bg-(--Select-background) text-(--Text-primary-off)">
                                    {accountType}
                                </span>
                                {worker && (
                                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-secondary font-semibold uppercase tracking-wider ${worker.isActive ? "bg-(--Afirmation)/15 text-(--Afirmation) border border-(--Afirmation)/40" : "bg-(--Negacion)/15 text-(--Negacion) border border-(--Negacion)/40"}`}>
                                        {statusLabel}
                                    </span>
                                )}
                            </div>

                            <div className="pt-3 text-xs font-secondary text-(--Text-gray)">
                                <span className="text-(--Primary-off) font-semibold">Function:</span> {roleLabel}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="rounded-sm border border-(--Border) bg-(--Widget-background) p-6">
                        <h3 className="text-(--Primary) text-xs font-primary font-extrabold tracking-[0.3em] uppercase">
                            Account overview
                        </h3>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-1 rounded-sm border border-(--Border) bg-(--Page-background) p-4">
                                <span className="text-[11px] font-secondary font-semibold uppercase tracking-wider text-(--Text-primary-off)">Account type</span>
                                <span className="text-(--Text-gray) text-base font-primary font-extrabold">{accountType}</span>
                            </div>

                            <div className="flex flex-col gap-1 rounded-sm border border-(--Border) bg-(--Page-background) p-4">
                                <span className="text-[11px] font-secondary font-semibold uppercase tracking-wider text-(--Text-primary-off)">Status</span>
                                <span className="text-(--Text-gray) text-base font-primary font-extrabold">{statusLabel}</span>
                            </div>

                            <div className="flex flex-col gap-1 rounded-sm border border-(--Border) bg-(--Page-background) p-4">
                                <span className="text-[11px] font-secondary font-semibold uppercase tracking-wider text-(--Text-primary-off)">Email</span>
                                <span className="text-(--Text-gray) text-sm font-primary font-extrabold break-all">{email}</span>
                            </div>

                            <div className="flex flex-col gap-1 rounded-sm border border-(--Border) bg-(--Page-background) p-4">
                                <span className="text-[11px] font-secondary font-semibold uppercase tracking-wider text-(--Text-primary-off)">Member id</span>
                                <span className="text-(--Text-gray) text-sm font-primary font-extrabold">{profileId}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-sm border border-(--Border) bg-(--Widget-background) p-6">
                        {worker ? (
                            <CompTime
                                active={worker.isActive}
                            />
                        ) : (
                            <div className="text-(--Text-primary-off) text-sm font-secondary">
                                Member since {new Date(profile.createdAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};