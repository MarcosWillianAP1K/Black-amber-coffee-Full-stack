import type { Order } from "shared-utils/types/order";
import { API } from "shared-utils/core/APIroutes";
import { authFetch } from "./httpClient.ts";

export async function fetchMyOrders(): Promise<Order[]> {
    const response = await authFetch(API.OrdersUser.List, { method: "GET" });
    if (!response.ok) throw new Error(`Falha ao carregar pedidos: ${response.status}`);

    const payload = (await response.json()) as { data: Order[] };
    return payload.data;
}

export async function cancelMyOrder(publicId: string): Promise<Order> {
    const response = await authFetch(API.OrdersUser.Cancel(publicId), {
        method: "POST",
    });

    if (!response.ok) {
        let message = `Não foi possível cancelar o pedido (${response.status}).`;
        try {
            const err = (await response.json()) as { error?: { message?: string }; message?: string };
            message = err.error?.message ?? err.message ?? message;
        } catch {
            // keep default
        }
        throw new Error(message);
    }

    const payload = (await response.json()) as { data: Order };
    return payload.data;
}
