/**
 * shared-utils — barrel export.
 *
 * Usage:
 *   import { Product, Order, formatPrice } from "shared-utils";
 *   import type { ProductCategory } from "shared-utils/types/product";
 */

// Types
export * from "./types";

// Helpers
export { formatPrice } from "./helpers/currency";
