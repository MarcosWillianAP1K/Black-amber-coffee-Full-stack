
import type { Worker } from "./types/worker";

export const MOCK_WORKERS: Worker[] = [
    {
        publicId: "1",
        role: "BARISTA",
        salary: 2000,
        isActive: true,
        profile: { fullName: "João Silva", phone: null, avatarImage: null, email: "joao@blackamber.com", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "2",
        role: "BARMAN",
        salary: 2100,
        isActive: true,
        profile: { fullName: "Maria Santos", phone: null, avatarImage: null, email: "maria@blackamber.com", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "3",
        role: "ADMIN",
        salary: 4000,
        isActive: true,
        profile: { fullName: "Pedro Almeida", phone: null, avatarImage: null, email: "pedro@blackamber.com", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "4",
        role: "BARISTA",
        salary: 2000,
        isActive: false,
        profile: { fullName: "Ana Oliveira", phone: null, avatarImage: null, email: "ana@blackamber.com", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "5",
        role: "WAITER",
        salary: 1800,
        isActive: true,
        profile: { fullName: "Carlos Souza", phone: null, avatarImage: null, email: "carlos@blackamber.com", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "6",
        role: "BARISTA",
        salary: 2000,
        isActive: true,
        profile: { fullName: "Sofia Pereira", phone: null, avatarImage: null, email: "sofia@blackamber.com", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "7",
        role: "ADMIN",
        salary: 4000,
        isActive: false,
        profile: { fullName: "Miguel Costa", phone: null, avatarImage: null, email: "miguel@blackamber.com", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "8",
        role: "WAITER",
        salary: 1800,
        isActive: true,
        profile: { fullName: "Helena Rodrigues", phone: null, avatarImage: null, email: "helena@blackamber.com", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "9",
        role: "BARMAN",
        salary: 2100,
        isActive: true,
        profile: { fullName: "Gonçalo Fernandes", phone: null, avatarImage: null, email: "goncalo@blackamber.com", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "10",
        role: "BARISTA",
        salary: 2000,
        isActive: true,
        profile: { fullName: "Beatriz Martins", phone: null, avatarImage: null, email: "beatriz@blackamber.com", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
];


import type { InventoryItem } from "./types/inventory";

export const MOCK_ITEMS_INVENTORY: InventoryItem[] = [
    { id: "1", name: "Arabica Coffee Beans", code: "COF-001", amount: 45, unit: "kg", status: "In Stock" },
    { id: "2", name: "Whole Milk", code: "MLK-001", amount: 8, unit: "L", status: "Low Stock" },
    { id: "3", name: "Oat Milk", code: "MLK-002", amount: 12, unit: "L", status: "In Stock" },
    { id: "4", name: "Vanilla Syrup", code: "SYR-001", amount: 3, unit: "L", status: "Low Stock" },
    { id: "5", name: "Paper Cups (Medium)", code: "CUP-001", amount: 250, unit: "un", status: "In Stock" },
    { id: "6", name: "Croissant (Frozen)", code: "PST-001", amount: 0, unit: "un", status: "Out of Stock" },
    { id: "7", name: "Chocolate Powder", code: "CHO-001", amount: 5, unit: "kg", status: "Low Stock" },
];

import type { Product } from "./types/product";

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        publicId: "product-1",
        name: "Amber Reserve Espresso",
        description: "Dark roast, honey processed, notes of molasses and sun-dried cherry.",
        size: null,
        category: "Hot Coffee",
        price: 4.50,
        isActive: true,
        imageUrl: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        id: 2,
        publicId: "product-2",
        name: "Obsidian Cold Brew",
        description: "24-hour steep, velvety mouthfeel, smooth chocolate finish.",
        size: null,
        category: "Cold Brew",
        price: 5.75,
        isActive: true,
        imageUrl: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        id: 3,
        publicId: "product-3",
        name: "Artisan Croissant",
        description: "Flaky, buttery layers, baked fresh daily with French butter.",
        size: null,
        category: "Pastry",
        price: 3.50,
        isActive: true,
        imageUrl: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
];


import type { Order } from "./types/order";

export const MOCK_ORDERS: Order[] = [
    {
        id: 1,
        publicId: "ord-1",
        code: "PED-20260607-0001",
        status: "IN PROGRESS",
        totalPrice: 15.99,
        paymentMethod: "CARD",
        observation: "No sugar in the coffee",
        itens: [
            { id: 1, name: "Amber Reserve Espresso", price: 4.50, quantity: 2, observation: "" },
            { id: 2, name: "Artisan Croissant", price: 3.50, quantity: 1, observation: "" },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        id: 2,
        publicId: "ord-2",
        code: "PED-20260607-0002",
        status: "PENDING",
        totalPrice: 12.50,
        paymentMethod: "CASH",
        observation: "Extra hot latte",
        itens: [
            { id: 3, name: "Obsidian Cold Brew", price: 5.75, quantity: 2, observation: "" },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        id: 3,
        publicId: "ord-3",
        code: "PED-20260607-0003",
        status: "COMPLETED",
        totalPrice: 10.75,
        paymentMethod: "CARD",
        observation: "No cream in the espresso",
        itens: [
            { id: 4, name: "Amber Reserve Espresso", price: 4.50, quantity: 1, observation: "" },
            { id: 5, name: "Artisan Croissant", price: 3.50, quantity: 1, observation: "" },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        id: 4,
        publicId: "ord-4",
        code: "PED-20260607-0004",
        status: "LATE",
        totalPrice: 14.20,
        paymentMethod: "CASH",
        observation: "Add cinnamon to the cappuccino",
        itens: [
            { id: 6, name: "Obsidian Cold Brew", price: 5.75, quantity: 1, observation: "" },
            { id: 7, name: "Artisan Croissant", price: 3.50, quantity: 1, observation: "" },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        id: 5,
        publicId: "ord-5",
        code: "PED-20260607-0005",
        status: "CANCELLED",
        totalPrice: 11.50,
        paymentMethod: "CARD",
        observation: "No cream in the americano",
        itens: [
            { id: 8, name: "Amber Reserve Espresso", price: 4.50, quantity: 2, observation: "" },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        id: 6,
        publicId: "ord-6",
        code: "PED-20260607-0006",
        status: "PENDING",
        totalPrice: 13.40,
        paymentMethod: "CARD",
        observation: "Serve without whipped cream",
        itens: [
            { id: 9, name: "Artisan Croissant", price: 3.50, quantity: 2, observation: "" },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        id: 7,
        publicId: "ord-7",
        code: "PED-20260607-0007",
        status: "IN PROGRESS",
        totalPrice: 18.90,
        paymentMethod: "CASH",
        observation: "Cookies on the side",
        itens: [
            { id: 10, name: "Amber Reserve Espresso", price: 4.50, quantity: 3, observation: "" },
            { id: 11, name: "Obsidian Cold Brew", price: 5.75, quantity: 1, observation: "" },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        id: 8,
        publicId: "ord-8",
        code: "PED-20260607-0008",
        status: "COMPLETED",
        totalPrice: 16.25,
        paymentMethod: "CARD",
        observation: "Heat the pie before serving",
        itens: [
            { id: 12, name: "Artisan Croissant", price: 3.50, quantity: 3, observation: "" },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        id: 9,
        publicId: "ord-9",
        code: "PED-20260607-0009",
        status: "LATE",
        totalPrice: 19.80,
        paymentMethod: "CASH",
        observation: "No ice in one of the coffees",
        itens: [
            { id: 13, name: "Obsidian Cold Brew", price: 5.75, quantity: 2, observation: "" },
            { id: 14, name: "Amber Reserve Espresso", price: 4.50, quantity: 2, observation: "" },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        id: 10,
        publicId: "ord-10",
        code: "PED-20260607-0010",
        status: "PENDING",
        totalPrice: 12.10,
        paymentMethod: "CARD",
        observation: "Jam on the side",
        itens: [
            { id: 15, name: "Artisan Croissant", price: 3.50, quantity: 2, observation: "" },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
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


import type { User } from "./types/user";

export const MOCK_USERS: User[] = [
    {
        publicId: "u1",
        name: "João Silva",
        email: "joao@example.com",
        profile: { fullName: "João Silva", phone: null, avatarImage: null, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "u2",
        name: "Maria Santos",
        email: "maria@example.com",
        profile: { fullName: "Maria Santos", phone: null, avatarImage: null, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "u3",
        name: "Pedro Almeida",
        email: "pedro@example.com",
        profile: { fullName: "Pedro Almeida", phone: null, avatarImage: null, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "u4",
        name: "Ana Oliveira",
        email: "ana@example.com",
        profile: { fullName: "Ana Oliveira", phone: null, avatarImage: null, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "u5",
        name: "Carlos Souza",
        email: "carlos@example.com",
        profile: { fullName: "Carlos Souza", phone: null, avatarImage: null, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "u6",
        name: "Sofia Pereira",
        email: "sofia@example.com",
        profile: { fullName: "Sofia Pereira", phone: null, avatarImage: null, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "u7",
        name: "Miguel Costa",
        email: "miguel@example.com",
        profile: { fullName: "Miguel Costa", phone: null, avatarImage: null, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "u8",
        name: "Helena Rodrigues",
        email: "helena@example.com",
        profile: { fullName: "Helena Rodrigues", phone: null, avatarImage: null, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "u9",
        name: "Gonçalo Fernandes",
        email: "goncalo@example.com",
        profile: { fullName: "Gonçalo Fernandes", phone: null, avatarImage: null, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
    {
        publicId: "u10",
        name: "Beatriz Martins",
        email: "beatriz@example.com",
        profile: { fullName: "Beatriz Martins", phone: null, avatarImage: null, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    },
];