import type { User as Customer, UserUpdateInput as CustomerUpdateInput } from "shared-utils/types/user";
import { MOCK_USERS } from "shared-utils/MockBD.js";

// In-memory store (will be replaced by API calls)
let customers: Customer[] = [...MOCK_USERS];

// ──────────────────────────────────────────────
// Service functions
// ──────────────────────────────────────────────

/** Fetch all customers */
export async function fetchCustomers(): Promise<Customer[]> {
    // TODO: Replace with actual API call
    // Example: return await fetch("/api/customers").then((res) => res.json());
    return [...customers];
}

/** Update customer (by publicId) */
export async function updateCustomer(publicId: string, updates: Partial<CustomerUpdateInput>): Promise<Customer> {
    // TODO: Replace with actual API call
    const now = new Date().toISOString();
    customers = customers.map((customer) =>
        customer.publicId === publicId
            ? {
                ...customer,
                email: updates.email ?? customer.email,
                profile: {
                    ...customer.profile,
                    fullName: updates.fullName ?? customer.profile.fullName,
                    phone: updates.phone ?? customer.profile.phone,
                    updatedAt: now,
                },
                updatedAt: now,
            }
            : customer
    );
    const updatedCustomer = customers.find((customer) => customer.publicId === publicId);
    if (!updatedCustomer) throw new Error(`Customer ${publicId} not found`);
    return updatedCustomer;
}

/** Delete a customer */
export async function deleteCustomer(publicId: string): Promise<void> {
    // TODO: Replace with actual API call
    customers = customers.filter((customer) => customer.publicId !== publicId);
}

/** Create a new customer */
export async function createCustomer(customerData: Omit<Customer, "publicId">): Promise<Customer> {
    // TODO: Replace with actual API call
    const now = new Date().toISOString();
    const newCustomer: Customer = {
        publicId: Math.random().toString(36).substr(2, 9),
        ...customerData,
        createdAt: now,
        updatedAt: now,
    };
    customers.push(newCustomer);
    return newCustomer;
}

/** Filter customers by name or email query */
export async function filterCustomers(
    filters: { query?: string }
): Promise<Customer[]> {
    // TODO: Replace with actual API call
    return customers.filter((customer) => {
        if (filters.query) {
            const q = filters.query.toLowerCase();
            return (
                customer.profile.fullName.toLowerCase().includes(q) ||
                customer.email.toLowerCase().includes(q)
            );
        }
        return true;
    });
}
