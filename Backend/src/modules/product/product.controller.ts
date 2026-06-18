import ProductService from "./product.service";
import { NextFunction, Request, Response } from "express";

export default class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  /**
   * GET /products
   * List all products with optional pagination
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (req.query.category || req.query.search || req.query.minPrice || req.query.maxPrice) {
        const products = await this.productService.filter({
          category: req.query.category as string | undefined,
          minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
          maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
          search: req.query.search as string | undefined,
        });
        res.status(200).json({ products });
        return;
      }

      const result = await this.productService.paginate(page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/:publicId
   * Get a product by its public ID
   */
  async getByPublicId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const product = await this.productService.getByPublicId(publicId);
      res.status(200).json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/categories
   * List all product categories
   */
  async getCategories(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const categories = await this.productService.getCategories();
      res.status(200).json({ data: categories });
    } catch (error) {
      next(error);
    }
  }

  // ---- Admin Handlers ----

  /**
   * POST /admin/products
   * Create a new product (admin only)
   */
  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const product = await this.productService.create(req.body);
      res.status(201).json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /admin/products/:publicId
   * Update a product (admin only)
   */
  async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const product = await this.productService.update(publicId, req.body);
      res.status(200).json({ data: product, message: "Product updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /admin/products/:publicId
   * Delete a product (admin only)
   */
  async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      await this.productService.delete(publicId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /admin/products/:publicId/image
   * Upload product image (admin only)
   */
  async uploadImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const buffer = req.file?.buffer;
      if (!buffer) {
        res.status(400).json({ error: { code: "INVALID_REQUEST", message: "No image provided." } });
        return;
      }
      const product = await this.productService.uploadImage(publicId, buffer);
      res.status(200).json({ data: product, message: "Image uploaded successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /admin/products/:publicId/activate
   * Activate a product (admin only)
   */
  async activate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const product = await this.productService.activate(publicId);
      res.status(200).json({ data: product, message: "Product activated" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /admin/products/:publicId/deactivate
   * Deactivate a product (admin only)
   */
  async deactivate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const product = await this.productService.deactivate(publicId);
      res.status(200).json({ data: product, message: "Product deactivated" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/products/:publicId/stock
   * Get product stock (admin only)
   */
  async getStock(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const stock = await this.productService.getStock(publicId);
      res.status(200).json({ data: stock });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /admin/products/:publicId/stock
   * Update product stock (admin only)
   */
  async updateStock(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const stock = await this.productService.updateStock(publicId, req.body);
      res.status(200).json({ data: stock, message: "Stock updated" });
    } catch (error) {
      next(error);
    }
  }
}
