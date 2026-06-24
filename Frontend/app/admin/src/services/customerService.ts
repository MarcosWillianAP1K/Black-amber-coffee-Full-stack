/* eslint-disable @typescript-eslint/no-unused-vars */
import type { User as Customer, UserUpdateInput as CustomerUpdateInput } from "shared-utils/types/user";
import { API } from "shared-utils/core/APIroutes";
import { authFetch } from "./httpClient";

// ──────────────────────────────────────────────
// Service functions
// ──────────────────────────────────────────────

interface PaginatedCustomersResponse {
    data: Customer[];
    total: number;
    page: number;
    limit: number;
}

interface SingleCustomerResponse {
    data: Customer;
    message?: string;
}

/** Fetch all customers */
export async function fetchCustomers(): Promise<Customer[]> {
    const response = await authFetch(API.AdminUsers.List, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status}`);
    }

    const payload = (await response.json()) as PaginatedCustomersResponse;
    // Assuming backend returns an array in data or products, adjust based on your API response.
    // The user had: return data.data; 
    return payload.data ?? [];
}

/** Update customer (by publicId) */
export async function updateCustomer(publicId: string, updates: Partial<CustomerUpdateInput>): Promise<Customer> {
    const response = await authFetch(API.AdminUsers.UpdateById(publicId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        throw new Error(`Failed to update customer: ${response.status}`);
    }

    const payload = (await response.json()) as SingleCustomerResponse;
    return payload.data;
}

/** Delete a customer */
export async function deleteCustomer(publicId: string): Promise<void> {
    const response = await authFetch(API.AdminUsers.DeleteById(publicId), {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Failed to delete customer: ${response.status}`);
    }
}

/** Create a new customer */
export async function createCustomer(_customerData: Omit<Customer, "publicId">): Promise<Customer> {
    // The backend doesn't currently expose a POST /users route for admins. 
    // If needed in the future, it would look like this:
    /*
    const response = await authFetch(API.AdminUsers.List, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
    });

    if (!response.ok) {
        throw new Error(`Failed to create customer: ${response.status}`);
    }

    const payload = await response.json();
    return payload.data;
    */
    throw new Error("createCustomer is not implemented on the backend for admin.");
}

/** Filter customers by name or email query */
export async function filterCustomers(
    filters: { query?: string }
): Promise<Customer[]> {
    // Currently fetches all and filters locally. 
    // Can be optimized to use query params if backend supports it (e.g. ?query=...)
    const customers = await fetchCustomers();

    if (!filters.query) return customers;

    const q = filters.query.toLowerCase();
    return customers.filter((customer) => {
        return (
            customer.fullName?.toLowerCase().includes(q) ||
            customer.email?.toLowerCase().includes(q)
        );
    });
}
