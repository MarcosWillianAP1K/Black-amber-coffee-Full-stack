import type { SimulatePaymentInput, SimulatePaymentResponse } from "shared-utils/types/payment";
import { API } from "shared-utils/core/APIroutes";
import { authFetch } from "./httpClient.ts";

export async function simulatePayment(
    data: SimulatePaymentInput,
): Promise<SimulatePaymentResponse> {
    const response = await authFetch(API.Payments.Simulate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        let message = `Failed to process payment: ${response.status}`;
        try {
            const err = (await response.json()) as { error?: { message?: string } };
            message = err.error?.message ?? message;
        } catch {
            // keep default
        }
        throw new Error(message);
    }

    return response.json() as Promise<SimulatePaymentResponse>;
}
