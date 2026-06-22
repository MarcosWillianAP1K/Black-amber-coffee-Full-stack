// Centralized API route registry.
// Fill in missing routes as backend expands.
//
// API_BASE is resolved from the VITE_API_BASE_URL environment variable at
// build time (Vite injects it via import.meta.env). Set it in the root .env:
//   VITE_API_BASE_URL=http://localhost:3001/v1/api

const _meta = typeof import.meta !== "undefined" ? (import.meta as unknown as { env?: Record<string, string> }) : null;
const API_BASE: string = _meta?.env?.["VITE_API_BASE_URL"] ?? "http://localhost:3001/v1/api";



export const API = {
    Base: API_BASE,
    Auth: {
        Base: `${API_BASE}/auth`,
        Login: `${API_BASE}/auth/login`,
        Register: `${API_BASE}/auth/register`,
        RefreshToken: `${API_BASE}/auth/jwt/refresh-token`,
        Logout: `${API_BASE}/auth/logout`,
    },
    ForgotPassword: {
        SendCode: `${API_BASE}/auth/forgotpassword/send`,
        VerifyCode: `${API_BASE}/auth/forgotpassword/check`,
        ResetPassword: `${API_BASE}/auth/forgotpassword/reset`,
    },
    AdminWorkers: {    
        Register: `${API_BASE}/workers`,
        List: `${API_BASE}/workers`,
        FindById: (id: string) => `${API_BASE}/workers/${id}`,
        UpdateById: (id: string) => `${API_BASE}/workers/${id}`,
        DeleteById: (id: string) => `${API_BASE}/workers/${id}`,
    },
    AdminUsers: {
        List: `${API_BASE}/users`,
        FindById: (id: string) => `${API_BASE}/users/${id}`,
        UpdateById: (id: string) => `${API_BASE}/users/${id}`,
        DeleteById: (id: string) => `${API_BASE}/users/${id}`,
    },
    AdminOrders: {
        List: `${API_BASE}/orders`,
        Create: `${API_BASE}/orders`,
        FindById: (id: string) => `${API_BASE}/orders/${id}`,
        CancelById: (id: string) => `${API_BASE}/orders/${id}/cancel`,
        DeleteById: (id: string) => `${API_BASE}/orders/${id}`,
    },
    OrdersWorker: {
        List: `${API_BASE}/orders`,
        FindById: (id: string) => `${API_BASE}/orders/${id}`,
        UpdateStatus: (id: string) => `${API_BASE}/orders/${id}/status`,
    },
    Products: {
        List: `${API_BASE}/products`,
        ListCategories: `${API_BASE}/products/categories`,
    },
    OrdersUser: {
        Create: `${API_BASE}/orders`,
        List: `${API_BASE}/orders`,
        Cancel: (id: string) => `${API_BASE}/orders/${id}/cancel`,
    },
    AdminProducts: {
        Create: `${API_BASE}/products`,
        UpdateById: (id: string) => `${API_BASE}/products/${id}`,
        DeleteById: (id: string) => `${API_BASE}/products/${id}`,
        UploadImageById: (id: string) => `${API_BASE}/products/${id}/image`,
        ActiveProductsByID: (id: string) => `${API_BASE}/products/${id}/activate`,
        DesactiveProductsByID: (id: string) => `${API_BASE}/products/${id}/deactivate`,
        GetProductsById: (id: string) => `${API_BASE}/products/${id}/stock`,
        UpdateProductsById: (id: string) => `${API_BASE}/products/${id}/stock`,
    },
    Users: {
        Base: `${API_BASE}/users`,
        GetMe: `${API_BASE}/users/me`,
        UptadeMe: `${API_BASE}/users/me`,
        DeleteMe: `${API_BASE}/users/me`,
    },
    Workers: {
        GetMe: `${API_BASE}/workers/me`,
        Login: `${API_BASE}/auth/login`,
        UptadeMe: `${API_BASE}/workers/me`,
        // DeleteMe: `${API_BASE}/workers/me`,
    },
} as const;
