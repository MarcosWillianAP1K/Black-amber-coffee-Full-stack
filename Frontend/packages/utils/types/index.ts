/**
 * Barrel export — all shared domain types.
 */
export type { Product, ProductInput, ProductCategory } from "./product";
export { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from "./product";

export type { Order, OrderStatus, OrderItem, PaymentMethod, AdminOrderListResponse, WorkerOrderResponse } from "./order";
export { ORDER_STATUSES, PAYMENT_METHODS, ORDER_STATUS_LABELS } from "./order";

export type {
	InventoryItem,
	InventoryAddStockData,
	InventoryEditData,
	InventoryUnit,
	StockStatus,
} from "./inventory";
export { INVENTORY_UNITS, UNIT_LABELS, STOCK_STATUSES, deriveStockStatus } from "./inventory";

export type {
	User,
	UserUpdateInput,
	GetUserResponse,
	UpdateUserResponse,
} from "./user";

export type {
	RegisterInput,
	LoginInput,
	ProfileResponse,
	RegisterResponse,
	LoginResponse,
	SendPasswordResetInput,
	CheckPasswordResetInput,
	ResetPasswordInput,
	RefreshTokenInput,
	RefreshTokenResponse,
	LogoutInput,
	LogoutResponse,
	SendPasswordResetResponse,
	CheckPasswordResetResponse,
	ResetPasswordResponse,
	UserType,
} from "./auth";

export type {
	Worker,
	WorkerUpdateInput,
	GetWorkerResponse,
	UpdateWorkerResponse,
	WorkerRole,
} from "./worker";
export { WORKER_ROLES, WORKER_ROLE_LABELS } from "./worker";

export type { Cart, CartItem, GetCartResponse, AddCartItemInput, UpdateCartItemInput } from "./cart";
export type { Payment, SimulatePaymentInput, SimulatePaymentResponse } from "./payment";
