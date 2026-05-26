/**
 * Employee Service — Data access layer for staff/employees.
 *
 * Currently uses in-memory mock data.
 * Replace with real API calls when backend is ready.
 */

import type { Worker, WorkerUpdateInput } from "shared-utils/types/worker";
import { MOCK_WORKERS } from "shared-utils/MockBD.js";


let nextId = 11;



let employees = [...MOCK_WORKERS];

// ──────────────────────────────────────────────
// Service functions
// ──────────────────────────────────────────────

/** Fetch all employees */
export async function fetchEmployees(): Promise<Worker[]> {
    // TODO: return await fetch("/api/employees").then(res => res.json());
    return [...employees];
}

/** Create a new employee */
export async function createEmployee(data: Omit<Worker, "publicId">): Promise<Worker> {
    // TODO: return await fetch("/api/employees", { method: "POST", body: JSON.stringify(data) }).then(res => res.json());
    const now = new Date().toISOString();
    const newEmployee: Worker = {
        publicId: String(nextId++),
        ...data,
        createdAt: now,
        updatedAt: now,
    };
    employees = [...employees, newEmployee];
    return newEmployee;
}

/** Update an existing employee */
export async function updateEmployee(publicId: string, updates: Partial<WorkerUpdateInput>): Promise<Worker> {
    // TODO: return await fetch(`/api/employees/${publicId}`, { method: "PATCH", body: JSON.stringify(updates) }).then(res => res.json());
    const now = new Date().toISOString();
    employees = employees.map((e) =>
        e.publicId === publicId
            ? {
                ...e,
                profile: {
                    ...e.profile,
                    fullName: updates.fullName ?? e.profile.fullName,
                    email: updates.email ?? e.profile.email,
                    phone: updates.phone ?? e.profile.phone,
                    updatedAt: now,
                },
                updatedAt: now,
            }
            : e
    );
    const updated = employees.find((e) => e.publicId === publicId);
    if (!updated) throw new Error(`Employee ${publicId} not found`);
    return updated;
}

/** Toggle employee active/inactive status */
export async function toggleEmployeeStatus(publicId: string): Promise<Worker> {
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

/** Delete an employee */
export async function deleteEmployee(publicId: string): Promise<void> {
    // TODO: await fetch(`/api/employees/${publicId}`, { method: "DELETE" });
    employees = employees.filter((e) => e.publicId !== publicId);
}
