// Centralized API route registry.
// Fill in missing routes as backend expands.


const API_BASE = "http://localhost:3000/v1/api";




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
        Register: `${API_BASE}/admin/workers`,
        List: `${API_BASE}/admin/workers`,
        FindById: (id: string) => `${API_BASE}/admin/workers/${id}`,
        UpdateById: (id: string) => `${API_BASE}/admin/workers/${id}`,
        DeleteById: (id: string) => `${API_BASE}/admin/workers/${id}`,
    },
    AdminOrders: {
        List: `${API_BASE}/admin/orders`,
        FindById: (id: string) => `${API_BASE}/admin/orders/${id}`,
        CancelById: (id: string) => `${API_BASE}/admin/orders/${id}/cancel`,
    },
    OrdersWorker: {
        List: `${API_BASE}/worker/orders`,
        FindById: (id: string) => `${API_BASE}/worker/orders/${id}`,
        UpdateStatus: (id: string) => `${API_BASE}/worker/orders/${id}/status`,
    },
    Products: {
        List: `${API_BASE}/products`,
        ListCategories: `${API_BASE}/products/categories`,
    },
    OrdersUser: {
        Create: `${API_BASE}/user/orders`,
        List: `${API_BASE}/user/orders`,
        Cancel: (id: string) => `${API_BASE}/user/orders/${id}/cancel`,
    },
    AdminProducts: {
        Create: `${API_BASE}/admin/products`,
        UpdateById: (id: string) => `${API_BASE}/admin/products/${id}`,
        DeleteById: (id: string) => `${API_BASE}/admin/products/${id}`,
        UploadImageById: (id: string) => `${API_BASE}/admin/products/${id}/image`,
        ActiveProductsByID: (id: string) => `${API_BASE}/admin/products/${id}/activate`,
        DesactiveProductsByID: (id: string) => `${API_BASE}/admin/products/${id}/deactivate`,
        GetProductsById: (id: string) => `${API_BASE}/admin/products/${id}/stock`,
        UpdateProductsById: (id: string) => `${API_BASE}/admin/products/${id}/stock`,
    },
    Users: {
        Base: `${API_BASE}/user`,
        GetMe: `${API_BASE}/user/me`,
        UptadeMe: `${API_BASE}/user/me`,
        DeleteMe: `${API_BASE}/user/me`,
    },
    Workers: {
        GetMe: `${API_BASE}/worker/get/me`,
        Login: `${API_BASE}/worker/login`,
        UptadeMe: `${API_BASE}/worker/update/me`,
        // DeleteMe: `${API_BASE}/worker/delete/me`,
    },
} as const;
