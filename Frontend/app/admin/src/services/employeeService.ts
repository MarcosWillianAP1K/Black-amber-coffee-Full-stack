/**
 * Employee Service — Data access layer for staff/employees.
 *
 * Integrated with backend /api/admin/workers endpoints.
 */

import type { Worker, WorkerUpdateInput } from "shared-utils/types/worker";
import { MOCK_WORKERS } from "shared-utils/MockBD.js";
import { authFetch } from "./httpClient.ts";
import { API } from "shared-utils/core/APIroutes";

// Mock toggle — set to false to use real API
const USE_MOCK = false;

let nextId = 11;
let employees = [...MOCK_WORKERS];

// ──────────────────────────────────────────────
// Types for API responses
// ──────────────────────────────────────────────

interface AdminWorkersListResponse {
    data: Worker[];
}

interface AdminWorkerResponse {
    data: Worker;
}

interface AdminWorkerResponseWithMessage {
    data: Worker;
    message?: string;
}

// ──────────────────────────────────────────────
// Service functions
// ──────────────────────────────────────────────

/** Fetch all employees */
export async function fetchEmployees(): Promise<Worker[]> {
    if (USE_MOCK) {
        return [...employees];
    }

    const response = await authFetch(API.AdminWorkers.List, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.status}`);
    }

    const payload = (await response.json()) as AdminWorkersListResponse;
    return payload.data;
}

/** Create a new employee */
export async function createEmployee(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    role: Worker["role"];
    salary: number;
}): Promise<Worker> {
    if (USE_MOCK) {
        const now = new Date().toISOString();
        const newEmployee: Worker = {
            publicId: String(nextId++),
            role: data.role,
            salary: data.salary,
            isAdmin: data.role === "gerente",
            isActive: true,
            email: data.email,
            fullName: data.fullName,
            phone: data.phone ?? null,
            avatarUrl: null,
            createdAt: now,
            updatedAt: now,
        };
        employees = [...employees, newEmployee];
        return newEmployee;
    }

    const requestBody = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
        salary: data.salary,
    };


    const response = await authFetch(API.AdminWorkers.Register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        let message = `Failed to create employee: ${response.status}`;
        try {
            const rawBody = await response.text();
            const errBody = JSON.parse(rawBody) as { message?: string; error?: string };
            message = errBody.message ?? errBody.error ?? message;
        } catch {
            // response body is not JSON — keep the default message
        }

        if (response.status === 401) {
            throw new Error("Sem permissão — apenas admins podem cadastrar funcionários.");
        }
        if (response.status === 409) {
            throw new Error("Já existe um funcionário com esse e-mail.");
        }
        throw new Error(message);
    }

    const payload = (await response.json()) as AdminWorkerResponse;
    return payload.data;
}

/** Update an existing employee */
export async function updateEmployee(publicId: string, updates: Partial<WorkerUpdateInput>): Promise<Worker> {
    if (USE_MOCK) {
        const now = new Date().toISOString();
        employees = employees.map((e) =>
            e.publicId === publicId
                ? {
                    ...e,
                    fullName: updates.fullName ?? e.fullName,
                    email: updates.email ?? e.email,
                    phone: updates.phone ?? e.phone,
                    updatedAt: now,
                }
                : e
        );
        const updated = employees.find((e) => e.publicId === publicId);
        if (!updated) throw new Error(`Employee ${publicId} not found`);
        return updated;
    }

    const response = await authFetch(API.AdminWorkers.UpdateById(publicId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        throw new Error(`Failed to update employee: ${response.status}`);
    }

    const payload = (await response.json()) as AdminWorkerResponseWithMessage;
    return payload.data;
}

/** Toggle employee active/inactive status */
export async function toggleEmployeeStatus(publicId: string): Promise<Worker> {
    if (USE_MOCK) {
        const employee = employees.find((e) => e.publicId === publicId);
        if (!employee) throw new Error(`Employee ${publicId} not found`);
        const now = new Date().toISOString();
        employees = employees.map((e) =>
            e.publicId === publicId ? { ...e, isActive: !e.isActive, updatedAt: now } : e
        );
        const updated = employees.find((e) => e.publicId === publicId);
        if (!updated) throw new Error(`Employee ${publicId} not found`);
        return updated;
    }

    // ⚠️ Backend does not have a route to activate/deactivate workers.
    // The PUT /admin/workers/:id body accepts: fullName, email, password, phone, role, salary.
    // isActive is NOT accepted. When this endpoint is added, implement it here.
    throw new Error("Bloquear/desbloquear funcionário não está disponível — o backend não possui essa rota.");
}

/** Delete an employee */
export async function deleteEmployee(publicId: string): Promise<void> {
    if (USE_MOCK) {
        employees = employees.filter((e) => e.publicId !== publicId);
        return;
    }

    const response = await authFetch(API.AdminWorkers.DeleteById(publicId), {
        method: "DELETE",
    });

    // Backend returns 204 for delete, so ok status is 204
    if (response.status !== 204) {
        throw new Error(`Failed to delete employee: ${response.status}`);
    }
}
