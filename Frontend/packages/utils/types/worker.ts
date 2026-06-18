/**
 * Worker domain types aligned with backend worker schema.
 */

/** Available worker roles */
export const WORKER_ROLES = ["ADMIN", "BARISTA", "BARMAN", "WAITER"] as const;
export type WorkerRole = (typeof WORKER_ROLES)[number];

export const allowedRoles = WORKER_ROLES.map(role => role.toLowerCase()).filter(role => role === 'admin'); 

export interface WorkerProfile {
    fullName: string;
    phone: string | null;
    avatarImage: string | null;
    email: string;
    createdAt: string;
    updatedAt: string;
}

/** Represents a worker */
export interface Worker {
    publicId: string;
    role: WorkerRole;
    salary: number;
    isActive: boolean;
    profile: WorkerProfile;
    createdAt: string;
    updatedAt: string;
}

export interface WorkerUpdateInput {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
}

export interface GetWorkerResponse {
    data: Worker;
}

export interface UpdateWorkerResponse {
    data: Worker;
    message?: string;
}
