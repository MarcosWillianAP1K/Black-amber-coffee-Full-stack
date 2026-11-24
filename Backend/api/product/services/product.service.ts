import { imageService } from "../../../core/storage/image.service.js";
import { r2StorageProvider } from "../../../core/storage/bucket.provider.js";
import { ProductModel } from "../models/product.model.js";
import type {
  CreateProductInput,
  FilterProductsInput,
  PaginatedProductsDTO,
  ProductDTO,
  ProductStockDTO,
  UpdateProductInput,
  UpdateProductStockInput,
} from "../dtos/product.dto.js";
import type { ProductCategoryType } from "../../../core/enums/index.js";

export class ProductService {
  static async paginate(page = 1, limit = 50): Promise<PaginatedProductsDTO> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const { products, total } = await ProductModel.findPaginated(safePage, safeLimit);
    return { products, total, page: safePage, limit: safeLimit };
  }

  static async filter(params: FilterProductsInput): Promise<ProductDTO[]> {
    return ProductModel.filter(params);
  }

  static async getByPublicId(publicId: string): Promise<ProductDTO> {
    const product = await ProductModel.findByPublicId(publicId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    return product;
  }

  static async getCategories(): Promise<ProductCategoryType[]> {
    return ProductModel.findCategories();
  }

  static async create(data: CreateProductInput): Promise<ProductDTO> {
    return ProductModel.create({
      name: data.name,
      description: data.description ?? null,
      imgUrl: data.imgUrl ?? null,
      price: data.price,
      category: data.category,
    });
  }

  static async update(publicId: string, data: UpdateProductInput): Promise<ProductDTO> {
    const updated = await ProductModel.updateByPublicId(publicId, {
      name: data.name,
      description: data.description,
      imgUrl: data.imgUrl,
      price: data.price,
      category: data.category,
      isActive: data.isActive,
    });
    if (!updated) throw new Error("PRODUCT_NOT_FOUND");
    return updated;
  }

  static async uploadImage(publicId: string, buffer: Buffer): Promise<ProductDTO> {
    const current = await ProductModel.findByPublicId(publicId);
    if (!current) throw new Error("PRODUCT_NOT_FOUND");

    const processed = await imageService.processAvatar(buffer);
    const key = imageService.generateAvatarKey("products", publicId);
    const uploaded = await r2StorageProvider.upload({
      key,
      body: processed.large,
      contentType: processed.contentType,
    });

    if (current.imgUrl) {
      await r2StorageProvider.delete(current.imgUrl).catch(() => undefined);
    }

    const updated = await ProductModel.updateByPublicId(publicId, { imgUrl: uploaded.url });
    if (!updated) throw new Error("PRODUCT_NOT_FOUND");
    return updated;
  }

  static async deleteOrDeactivate(
    publicId: string,
  ): Promise<{ softDeleted: boolean; product?: ProductDTO }> {
    const current = await ProductModel.findByPublicId(publicId);
    if (!current) throw new Error("PRODUCT_NOT_FOUND");

    const hasOrders = await ProductModel.hasOrderReferences(current.id);
    if (hasOrders) {
      const deactivated = await ProductModel.updateByPublicId(publicId, { isActive: false });
      if (!deactivated) throw new Error("PRODUCT_NOT_FOUND");
      return { softDeleted: true, product: deactivated };
    }

    if (current.imgUrl) {
      await r2StorageProvider.delete(current.imgUrl).catch(() => undefined);
    }
    await ProductModel.deleteByPublicId(publicId);
    return { softDeleted: false };
  }

  static async activate(publicId: string): Promise<ProductDTO> {
    const updated = await ProductModel.updateByPublicId(publicId, { isActive: true });
    if (!updated) throw new Error("PRODUCT_NOT_FOUND");
    return updated;
  }

  static async deactivate(publicId: string): Promise<ProductDTO> {
    const updated = await ProductModel.updateByPublicId(publicId, { isActive: false });
    if (!updated) throw new Error("PRODUCT_NOT_FOUND");
    return updated;
  }

  static async getStock(publicId: string): Promise<ProductStockDTO | null> {
    const product = await ProductModel.findByPublicId(publicId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    return ProductModel.getStock(product.id);
  }

  static async updateStock(
    publicId: string,
    data: UpdateProductStockInput,
  ): Promise<ProductStockDTO> {
    const product = await ProductModel.findByPublicId(publicId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    return ProductModel.upsertStock(product.id, data.quantity, data.minQuantity);
  }
}
