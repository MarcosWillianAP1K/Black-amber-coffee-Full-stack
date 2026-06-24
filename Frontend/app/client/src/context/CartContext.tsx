import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import type { Cart, CartItem } from "shared-utils/types/cart";
import type { Product } from "shared-utils/types/product";
import * as cartService from "../services/cartService.ts";

interface CartContextValue {
    cart: Cart | null;
    items: CartItem[];
    count: number;
    subtotal: number;
    discount: number;
    observation: string;
    isLoading: boolean;
    error: string | null;
    setObservation: (value: string) => void;
    refresh: () => Promise<void>;
    addItem: (product: Product, quantity?: number) => Promise<void>;
    increment: (productId: number) => Promise<void>;
    decrement: (productId: number) => Promise<void>;
    clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [observation, setObservation] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const data = await cartService.fetchCart();
            setCart(data);
            window.dispatchEvent(new CustomEvent("cart:updated"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao carregar carrinho");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addItem = useCallback(async (product: Product, quantity = 1) => {
        setError(null);
        try {
            const data = await cartService.addCartItem({
                productId: product.id,
                quantity,
            });
            setCart(data);
            window.dispatchEvent(new CustomEvent("cart:updated"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao adicionar item");
            throw err;
        }
    }, []);

    const increment = useCallback(async (productId: number) => {
        const item = cart?.items.find((i) => i.productId === productId);
        if (!item) return;

        setError(null);
        try {
            const data = await cartService.updateCartItem(productId, {
                quantity: item.quantity + 1,
            });
            setCart(data);
            window.dispatchEvent(new CustomEvent("cart:updated"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao atualizar item");
        }
    }, [cart]);

    const decrement = useCallback(async (productId: number) => {
        const item = cart?.items.find((i) => i.productId === productId);
        if (!item) return;

        setError(null);
        try {
            const data =
                item.quantity <= 1
                    ? await cartService.removeCartItem(productId)
                    : await cartService.updateCartItem(productId, {
                          quantity: item.quantity - 1,
                      });
            setCart(data);
            window.dispatchEvent(new CustomEvent("cart:updated"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao atualizar item");
        }
    }, [cart]);

    const clear = useCallback(async () => {
        setError(null);
        try {
            const data = await cartService.clearCart();
            setCart(data);
            setObservation("");
            window.dispatchEvent(new CustomEvent("cart:updated"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao limpar carrinho");
        }
    }, []);

    const items = cart?.items ?? [];
    const count = cart?.itemCount ?? 0;
    const subtotal = cart?.subtotal ?? 0;
    const discount = 0;

    return (
        <CartContext.Provider
            value={{
                cart,
                items,
                count,
                subtotal,
                discount,
                observation,
                isLoading,
                error,
                setObservation,
                refresh,
                addItem,
                increment,
                decrement,
                clear,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCartContext(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCartContext must be used within CartProvider");
    return ctx;
}
