import type { NextFunction, Request, Response } from "express";
import { CartService } from "../services/cart.service.js";
import type { AddCartItemInput, UpdateCartItemInput } from "../dtos/cart.dto.js";

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");
      const cart = await CartService.getCart(publicId);
      res.status(200).json({ data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");
      const cart = await CartService.addItem(publicId, req.body as AddCartItemInput);
      res.status(200).json({ data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");
      const productId = Number(req.params.productId);
      const cart = await CartService.updateItem(
        publicId,
        productId,
        req.body as UpdateCartItemInput,
      );
      res.status(200).json({ data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");
      const productId = Number(req.params.productId);
      const cart = await CartService.removeItem(publicId, productId);
      res.status(200).json({ data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");
      const cart = await CartService.clearCart(publicId);
      res.status(200).json({ data: cart });
    } catch (error) {
      next(error);
    }
  }
}
