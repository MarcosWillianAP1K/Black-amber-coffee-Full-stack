import type { Worker } from "./types/worker";
import type { InventoryItem } from "./types/inventory";
import type { Product } from "./types/product";
import type { Order } from "./types/order";
import type { User } from "./types/user";

const ts = "2024-01-01T00:00:00Z";

function worker(
    publicId: string,
    role: Worker["role"],
    fullName: string,
    email: string,
    salary: number,
    isAdmin = false,
    isActive = true,
): Worker {
    return {
        publicId,
        role,
        email,
        fullName,
        phone: null,
        avatarUrl: null,
        salary,
        isAdmin,
        isActive,
        createdAt: ts,
        updatedAt: ts,
    };
}

export const MOCK_WORKERS: Worker[] = [
    worker("1", "barista", "João Silva", "joao@blackamber.com", 2000),
    worker("2", "caixa", "Maria Santos", "maria@blackamber.com", 2100),
    worker("3", "gerente", "Pedro Almeida", "pedro@blackamber.com", 4000, true),
    worker("4", "barista", "Ana Oliveira", "ana@blackamber.com", 2000, false, false),
    worker("5", "atendente", "Carlos Souza", "carlos@blackamber.com", 1800),
    worker("6", "barista", "Sofia Pereira", "sofia@blackamber.com", 2000),
    worker("7", "gerente", "Miguel Costa", "miguel@blackamber.com", 4000, true, false),
    worker("8", "atendente", "Helena Rodrigues", "helena@blackamber.com", 1800),
    worker("9", "caixa", "Gonçalo Fernandes", "goncalo@blackamber.com", 2100),
    worker("10", "barista", "Beatriz Martins", "beatriz@blackamber.com", 2000),
];

export const MOCK_ITEMS_INVENTORY: InventoryItem[] = [
    { id: "1", name: "Arabica Coffee Beans", code: "COF-001", amount: 45, unit: "kg", status: "In Stock" },
    { id: "2", name: "Whole Milk", code: "MLK-001", amount: 8, unit: "L", status: "Low Stock" },
    { id: "3", name: "Oat Milk", code: "MLK-002", amount: 12, unit: "L", status: "In Stock" },
    { id: "4", name: "Vanilla Syrup", code: "SYR-001", amount: 3, unit: "L", status: "Low Stock" },
    { id: "5", name: "Paper Cups (Medium)", code: "CUP-001", amount: 250, unit: "un", status: "In Stock" },
    { id: "6", name: "Croissant (Frozen)", code: "PST-001", amount: 0, unit: "un", status: "Out of Stock" },
    { id: "7", name: "Chocolate Powder", code: "CHO-001", amount: 5, unit: "kg", status: "Low Stock" },
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        publicId: "product-1",
        name: "Amber Reserve Espresso",
        description: "Dark roast, honey processed, notes of molasses and sun-dried cherry.",
        category: "cafe",
        price: 4.5,
        isActive: true,
        imgUrl: null,
        createdAt: ts,
        updatedAt: ts,
    },
    {
        id: 2,
        publicId: "product-2",
        name: "Obsidian Cold Brew",
        description: "24-hour steep, velvety mouthfeel, smooth chocolate finish.",
        category: "cafe",
        price: 5.75,
        isActive: true,
        imgUrl: null,
        createdAt: ts,
        updatedAt: ts,
    },
    {
        id: 3,
        publicId: "product-3",
        name: "Artisan Croissant",
        description: "Flaky, buttery layers, baked fresh daily with French butter.",
        category: "lanche",
        price: 3.5,
        isActive: true,
        imgUrl: null,
        createdAt: ts,
        updatedAt: ts,
    },
];

export const MOCK_ORDERS: Order[] = [
    {
        id: 1,
        publicId: "ord-1",
        code: "BAC-0001",
        status: "em_preparo",
        totalPrice: 15.99,
        paymentMethod: "cartao_credito",
        observation: "No sugar in the coffee",
        itens: [
            { id: 1, name: "Amber Reserve Espresso", price: 4.5, quantity: 2, observation: null },
            { id: 2, name: "Artisan Croissant", price: 3.5, quantity: 1, observation: null },
        ],
        createdAt: ts,
        updatedAt: ts,
    },
    {
        id: 2,
        publicId: "ord-2",
        code: "BAC-0002",
        status: "criado",
        totalPrice: 12.5,
        paymentMethod: "dinheiro",
        observation: "Extra hot latte",
        itens: [{ id: 3, name: "Obsidian Cold Brew", price: 5.75, quantity: 2, observation: null }],
        createdAt: ts,
        updatedAt: ts,
    },
    {
        id: 3,
        publicId: "ord-3",
        code: "BAC-0003",
        status: "pronto",
        totalPrice: 10.75,
        paymentMethod: "pix",
        observation: "No cream in the espresso",
        itens: [
            { id: 4, name: "Amber Reserve Espresso", price: 4.5, quantity: 1, observation: null },
            { id: 5, name: "Artisan Croissant", price: 3.5, quantity: 1, observation: null },
        ],
        createdAt: ts,
        updatedAt: ts,
    },
    {
        id: 4,
        publicId: "ord-4",
        code: "BAC-0004",
        status: "em_preparo",
        totalPrice: 14.2,
        paymentMethod: "dinheiro",
        observation: "Add cinnamon to the cappuccino",
        itens: [
            { id: 6, name: "Obsidian Cold Brew", price: 5.75, quantity: 1, observation: null },
            { id: 7, name: "Artisan Croissant", price: 3.5, quantity: 1, observation: null },
        ],
        createdAt: ts,
        updatedAt: ts,
    },
    {
        id: 5,
        publicId: "ord-5",
        code: "BAC-0005",
        status: "cancelado",
        totalPrice: 11.5,
        paymentMethod: "cartao_debito",
        observation: "No cream in the americano",
        itens: [{ id: 8, name: "Amber Reserve Espresso", price: 4.5, quantity: 2, observation: null }],
        createdAt: ts,
        updatedAt: ts,
    },
    {
        id: 6,
        publicId: "ord-6",
        code: "BAC-0006",
        status: "criado",
        totalPrice: 13.4,
        paymentMethod: "pix",
        observation: "Serve without whipped cream",
        itens: [{ id: 9, name: "Artisan Croissant", price: 3.5, quantity: 2, observation: null }],
        createdAt: ts,
        updatedAt: ts,
    },
    {
        id: 7,
        publicId: "ord-7",
        code: "BAC-0007",
        status: "em_preparo",
        totalPrice: 18.9,
        paymentMethod: "dinheiro",
        observation: "Cookies on the side",
        itens: [
            { id: 10, name: "Amber Reserve Espresso", price: 4.5, quantity: 3, observation: null },
            { id: 11, name: "Obsidian Cold Brew", price: 5.75, quantity: 1, observation: null },
        ],
        createdAt: ts,
        updatedAt: ts,
    },
    {
        id: 8,
        publicId: "ord-8",
        code: "BAC-0008",
        status: "finalizado",
        totalPrice: 16.25,
        paymentMethod: "pix",
        observation: "Heat the pie before serving",
        itens: [{ id: 12, name: "Artisan Croissant", price: 3.5, quantity: 3, observation: null }],
        createdAt: ts,
        updatedAt: ts,
    },
    {
        id: 9,
        publicId: "ord-9",
        code: "BAC-0009",
        status: "criado",
        totalPrice: 19.8,
        paymentMethod: "dinheiro",
        observation: "No ice in one of the coffees",
        itens: [
            { id: 13, name: "Obsidian Cold Brew", price: 5.75, quantity: 2, observation: null },
            { id: 14, name: "Amber Reserve Espresso", price: 4.5, quantity: 2, observation: null },
        ],
        createdAt: ts,
        updatedAt: ts,
    },
    {
        id: 10,
        publicId: "ord-10",
        code: "BAC-0010",
        status: "criado",
        totalPrice: 12.1,
        paymentMethod: "pix",
        observation: "Jam on the side",
        itens: [{ id: 15, name: "Artisan Croissant", price: 3.5, quantity: 2, observation: null }],
        createdAt: ts,
        updatedAt: ts,
    },
];

export interface MockNotification {
    id: number;
    message: string;
    time: string;
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
    { id: 1, message: "New order received", time: "2 mins ago" },
    { id: 2, message: "Inventory low for Espresso Beans", time: "10 mins ago" },
    { id: 3, message: "New staff member added", time: "1 hour ago" },
];

function client(publicId: string, fullName: string, email: string): User {
    return {
        publicId,
        fullName,
        email,
        phone: null,
        avatarUrl: null,
        isActive: true,
        createdAt: ts,
        updatedAt: ts,
    };
}

export const MOCK_USERS: User[] = [
    client("u1", "João Silva", "joao@example.com"),
    client("u2", "Maria Santos", "maria@example.com"),
    client("u3", "Pedro Almeida", "pedro@example.com"),
    client("u4", "Ana Oliveira", "ana@example.com"),
    client("u5", "Carlos Souza", "carlos@example.com"),
    client("u6", "Sofia Pereira", "sofia@example.com"),
    client("u7", "Miguel Costa", "miguel@example.com"),
    client("u8", "Helena Rodrigues", "helena@example.com"),
    client("u9", "Gonçalo Fernandes", "goncalo@example.com"),
    client("u10", "Beatriz Martins", "beatriz@example.com"),
];
