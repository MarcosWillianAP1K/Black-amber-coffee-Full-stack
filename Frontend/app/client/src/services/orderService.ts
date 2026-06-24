import type { Order } from "shared-utils/types/order";
import { API } from "shared-utils/core/APIroutes";
import { authFetch } from "./httpClient.ts";

export async function fetchMyOrders(): Promise<Order[]> {
    const response = await authFetch(API.OrdersUser.List, { method: "GET" });
    if (!response.ok) throw new Error(`Failed to fetch orders: ${response.status}`);

    const payload = (await response.json()) as { data: Order[] };
    return payload.data;
}
