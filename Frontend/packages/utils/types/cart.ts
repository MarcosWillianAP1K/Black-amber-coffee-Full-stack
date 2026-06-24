/**
 * Cart domain types aligned with backend cart schema.
 */

export interface CartItem {
    productId: number;
    productPublicId: string;
    name: string;
    description: string | null;
    imgUrl: string | null;
    price: number;
    category: string;
    quantity: number;
    observation: string | null;
    addedAt: string;
}

export interface Cart {
    id: number;
    itemCount: number;
    subtotal: number;
    items: CartItem[];
    createdAt: string;
    updatedAt: string;
}

export interface GetCartResponse {
    data: Cart;
}

export interface AddCartItemInput {
    productId: number;
    quantity?: number;
    observation?: string | null;
}

export interface UpdateCartItemInput {
    quantity?: number;
    observation?: string | null;
}
