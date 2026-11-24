import type { NextFunction, Request, Response } from "express";
import { ProductService } from "../services/product.service.js";
import type {
  CreateProductInput,
  UpdateProductInput,
  UpdateProductStockInput,
} from "../dtos/product.dto.js";

export class ProductController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hasFilters = Boolean(
        req.query.category || req.query.search || req.query.minPrice || req.query.maxPrice,
      );

      if (hasFilters) {
        const products = await ProductService.filter({
          category: typeof req.query.category === "string" ? req.query.category : undefined,
          search: typeof req.query.search === "string" ? req.query.search : undefined,
          minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
          maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        });
        res.status(200).json({ products, total: products.length, page: 1, limit: products.length || 50 });
        return;
      }

      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const result = await ProductService.paginate(page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async listCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await ProductService.getCategories();
      res.status(200).json({ data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async getByPublicId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getByPublicId(String(req.params.publicId));
      res.status(200).json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  static async getStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stock = await ProductService.getStock(String(req.params.publicId));
      res.status(200).json({ data: stock });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.create(req.body as CreateProductInput);
      res.status(201).json({ data: product, message: "Produto criado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.update(
        String(req.params.publicId),
        req.body as UpdateProductInput,
      );
      res.status(200).json({ data: product, message: "Produto atualizado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProductService.deleteOrDeactivate(String(req.params.publicId));
      if (result.softDeleted) {
        res.status(200).json({
          data: result.product,
          message: "Produto possui histórico de pedidos e foi desativado.",
        });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buffer = req.file?.buffer;
      if (!buffer) {
        res.status(400).json({
          error: { code: "INVALID_REQUEST", message: "Nenhuma imagem enviada." },
        });
        return;
      }
      const product = await ProductService.uploadImage(String(req.params.publicId), buffer);
      res.status(200).json({ data: product, message: "Imagem atualizada com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.activate(String(req.params.publicId));
      res.status(200).json({ data: product, message: "Produto ativado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.deactivate(String(req.params.publicId));
      res.status(200).json({ data: product, message: "Produto desativado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stock = await ProductService.updateStock(
        String(req.params.publicId),
        req.body as UpdateProductStockInput,
      );
      res.status(200).json({ data: stock, message: "Estoque atualizado com sucesso." });
    } catch (error) {
      next(error);
    }
  }
}
