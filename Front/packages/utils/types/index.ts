/**
 * Barrel export — all shared domain types.
 */
export type { Product, ProductInput, ProductCategory } from "./product";
export { PRODUCT_CATEGORIES } from "./product";

export type { Order, OrderStatus, OrderItem, Payment } from "./order";
export { ORDER_STATUSES } from "./order";

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
	UserProfile,
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
	WorkerProfile,
	WorkerUpdateInput,
	GetWorkerResponse,
	UpdateWorkerResponse,
	WorkerRole,
} from "./worker";
export { WORKER_ROLES } from "./worker";
