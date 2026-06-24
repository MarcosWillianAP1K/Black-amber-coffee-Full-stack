import type { Cart, GetCartResponse, AddCartItemInput, UpdateCartItemInput } from "shared-utils/types/cart";
import { API } from "shared-utils/core/APIroutes";
import { authFetch } from "./httpClient.ts";

export async function fetchCart(): Promise<Cart> {
    const response = await authFetch(API.Cart.Get, { method: "GET" });
    if (!response.ok) throw new Error(`Failed to fetch cart: ${response.status}`);

    const payload = (await response.json()) as GetCartResponse;
    return payload.data;
}

export async function addCartItem(data: AddCartItemInput): Promise<Cart> {
    const response = await authFetch(API.Cart.AddItem, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            productId: data.productId,
            quantity: data.quantity ?? 1,
            observation: data.observation ?? null,
        }),
    });

    if (!response.ok) throw new Error(`Failed to add item: ${response.status}`);

    const payload = (await response.json()) as GetCartResponse;
    return payload.data;
}

export async function updateCartItem(
    productId: number,
    data: UpdateCartItemInput,
): Promise<Cart> {
    const response = await authFetch(API.Cart.UpdateItem(productId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`Failed to update item: ${response.status}`);

    const payload = (await response.json()) as GetCartResponse;
    return payload.data;
}

export async function removeCartItem(productId: number): Promise<Cart> {
    const response = await authFetch(API.Cart.RemoveItem(productId), {
        method: "DELETE",
    });

    if (!response.ok) throw new Error(`Failed to remove item: ${response.status}`);

    const payload = (await response.json()) as GetCartResponse;
    return payload.data;
}

export async function clearCart(): Promise<Cart> {
    const response = await authFetch(API.Cart.Clear, { method: "DELETE" });
    if (!response.ok) throw new Error(`Failed to clear cart: ${response.status}`);

    const payload = (await response.json()) as GetCartResponse;
    return payload.data;
}
