/**
 * Worker domain types aligned with backend worker schema.
 */

/** Available worker roles (backend enum) */
export const WORKER_ROLES = ["barista", "caixa", "gerente", "atendente"] as const;
export type WorkerRole = (typeof WORKER_ROLES)[number];

export const WORKER_ROLE_LABELS: Record<WorkerRole, string> = {
    barista: "Barista",
    caixa: "Caixa",
    gerente: "Gerente",
    atendente: "Atendente",
};

/** Admin-only routes check against isAdmin flag */
export const allowedRoles: string[] = ["gerente"];

/** Represents a worker (flat shape from API) */
export interface Worker {
    publicId: string;
    email: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
    role: WorkerRole;
    salary: number;
    isAdmin: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface WorkerUpdateInput {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    salary?: number;
    role?: WorkerRole;
}

export interface GetWorkerResponse {
    data: Worker;
}

export interface UpdateWorkerResponse {
    data: Worker;
    message?: string;
}
