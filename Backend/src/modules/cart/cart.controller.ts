import { Request, Response, NextFunction } from "express";
import CartService from "./cart.service";

export default class CartController {
  private cartService: CartService;

  constructor(cartService: CartService) {
    this.cartService = cartService;
  }

  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientPublicId = req.user?.publicId;
      if (!clientPublicId) throw new Error("UNAUTHORIZED");

      const response = await this.cartService.getCart(clientPublicId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientPublicId = req.user?.publicId;
      if (!clientPublicId) throw new Error("UNAUTHORIZED");

      const response = await this.cartService.addItem(clientPublicId, req.body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientPublicId = req.user?.publicId;
      if (!clientPublicId) throw new Error("UNAUTHORIZED");

      const productId = Number(req.params.productId);
      const response = await this.cartService.updateItem(
        clientPublicId,
        productId,
        req.body,
      );
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientPublicId = req.user?.publicId;
      if (!clientPublicId) throw new Error("UNAUTHORIZED");

      const productId = Number(req.params.productId);
      const response = await this.cartService.removeItem(clientPublicId, productId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientPublicId = req.user?.publicId;
      if (!clientPublicId) throw new Error("UNAUTHORIZED");

      const response = await this.cartService.clearCart(clientPublicId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
