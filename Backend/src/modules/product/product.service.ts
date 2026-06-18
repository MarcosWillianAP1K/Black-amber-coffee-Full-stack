import ProductRepository from "./product.repository";
import ProductModel from "./product.model";
import { r2StorageProvider, imageService } from "@/infra/storage";
import {
  CreateProductRequest,
  UpdateProductRequest,
  FilterProductsRequest,
  Product,
  ProductDetailResponse,
  ProductListItemResponse,
  PaginatedProductsResponse,
  ProductCategoriesResponse,
  ProductStockResponse,
  StockUpdateRequest,
  productSchema,
  productDetailSchema,
  productListItemSchema,
  paginatedProductsSchema,
  productCategoriesSchema,
  productStockSchema,
  stockUpdateRequestSchema,
} from "./product.schema";
import { ProductCategoryType } from "@/core/enuns/proudcCategory";

export default class ProductService {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  async getById(id: number): Promise<ProductDetailResponse> {
    const product = await this.productRepository.getById(id);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    return productSchema.parse({
      id: product.id,
      publicId: product.publicId,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      size: product.size,
      price: product.price,
      category: product.category,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }

  async getByPublicId(publicId: string): Promise<ProductDetailResponse> {
    const product = await this.productRepository.getByPublicId(publicId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    return productSchema.parse({
      id: product.id,
      publicId: product.publicId,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      size: product.size,
      price: product.price,
      category: product.category,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }

  async getAll(): Promise<ProductDetailResponse[]> {
    const products = await this.productRepository.getAll();
    return products.map((product) =>
      productSchema.parse({
        id: product.id,
        publicId: product.publicId,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        size: product.size,
        price: product.price,
        category: product.category,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }),
    );
  }

  async paginate(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedProductsResponse> {
    const offset = (page - 1) * limit;
    const allProducts = await this.productRepository.getAll();
    const total = allProducts.length;
    const start = offset;
    const end = start + limit;
    const paginated = allProducts.slice(start, end);

    return paginatedProductsSchema.parse({
      products: paginated.map((product) =>
        productSchema.parse({
          id: product.id,
          publicId: product.publicId,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          size: product.size,
          price: product.price,
          category: product.category,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }),
      ),
      total,
      page,
      limit,
    });
  }

  async filter(params: FilterProductsRequest): Promise<ProductDetailResponse[]> {
    const products = await this.productRepository.filter(params);
    return products.map((product) =>
      productSchema.parse({
        id: product.id,
        publicId: product.publicId,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        size: product.size,
        price: product.price,
        category: product.category,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }),
    );
  }

  async getCategories(): Promise<ProductCategoriesResponse> {
    const categories = await this.productRepository.getCategories();
    return productCategoriesSchema.parse(categories);
  }

  async getByCategory(category: ProductCategoryType): Promise<ProductDetailResponse[]> {
    const products = await this.productRepository.getByCategory(category);
    return products.map((product) =>
      productSchema.parse({
        id: product.id,
        publicId: product.publicId,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        size: product.size,
        price: product.price,
        category: product.category,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }),
    );
  }

  // ---- Admin operations ----

  async create(data: CreateProductRequest): Promise<ProductDetailResponse> {
    const created = await this.productRepository.create({
      name: data.name,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      size: data.size ?? null,
      price: data.price,
      category: data.category as ProductCategoryType,
      isActive: true,
    });

    return productSchema.parse({
      id: created.id,
      publicId: created.publicId,
      name: created.name,
      description: created.description,
      imageUrl: created.imageUrl,
      size: created.size,
      price: created.price,
      category: created.category,
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async update(
    publicId: string,
    data: UpdateProductRequest,
  ): Promise<ProductDetailResponse> {
    const existing = await this.productRepository.getByPublicId(publicId);
    if (!existing) throw new Error("PRODUCT_NOT_FOUND");

    const updated = await this.productRepository.update(publicId, {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      size: data.size,
      price: data.price,
      category: data.category as ProductCategoryType | undefined,
      isActive: data.isActive,
    });

    if (!updated) throw new Error("PRODUCT_NOT_FOUND");

    return productSchema.parse({
      id: updated.id,
      publicId: updated.publicId,
      name: updated.name,
      description: updated.description,
      imageUrl: updated.imageUrl,
      size: updated.size,
      price: updated.price,
      category: updated.category,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async uploadImage(
    publicId: string,
    buffer: Buffer,
  ): Promise<ProductDetailResponse> {
    const product = await this.productRepository.getByPublicId(publicId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    // Process and upload image (reuse avatar image service)
    const processedImages = await imageService.processAvatar(buffer);
    const key = `products/${publicId}/${Date.now()}-lg.webp`;

    await r2StorageProvider.upload({
      key,
      body: processedImages.large,
      contentType: processedImages.contentType,
    });

    const updated = await this.productRepository.update(publicId, {
      imageUrl: key,
    });

    if (!updated) throw new Error("PRODUCT_NOT_FOUND");

    return productSchema.parse({
      id: updated.id,
      publicId: updated.publicId,
      name: updated.name,
      description: updated.description,
      imageUrl: updated.imageUrl,
      size: updated.size,
      price: updated.price,
      category: updated.category,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(publicId: string): Promise<void> {
    const product = await this.productRepository.getByPublicId(publicId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    await this.productRepository.deleteByPublicId(publicId);
  }

  async activate(publicId: string): Promise<ProductDetailResponse> {
    const updated = await this.productRepository.activate(publicId);
    if (!updated) throw new Error("PRODUCT_NOT_FOUND");

    return productSchema.parse({
      id: updated.id,
      publicId: updated.publicId,
      name: updated.name,
      description: updated.description,
      imageUrl: updated.imageUrl,
      size: updated.size,
      price: updated.price,
      category: updated.category,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async deactivate(publicId: string): Promise<ProductDetailResponse> {
    const updated = await this.productRepository.deactivate(publicId);
    if (!updated) throw new Error("PRODUCT_NOT_FOUND");

    return productSchema.parse({
      id: updated.id,
      publicId: updated.publicId,
      name: updated.name,
      description: updated.description,
      imageUrl: updated.imageUrl,
      size: updated.size,
      price: updated.price,
      category: updated.category,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async getStock(
    productPublicId: string,
  ): Promise<{ quantity: number; minQuantity: number } | null> {
    const product = await this.productRepository.getByPublicId(productPublicId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    return this.productRepository.getStock(product.id);
  }

  async updateStock(
    productPublicId: string,
    data: StockUpdateRequest,
  ): Promise<ProductStockResponse> {
    const product = await this.productRepository.getByPublicId(productPublicId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    const stock = await this.productRepository.updateStock(
      product.id,
      data.quantity,
      data.minQuantity,
    );

    return productStockSchema.parse({
      productId: stock.productId,
      quantity: stock.quantity,
      minQuantity: stock.minQuantity,
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt,
    });
  }
}
