import type { NextFunction, Request, Response } from "express";
import { PaymentService } from "../services/payment.service.js";
import type { SimulatePaymentInput } from "../dtos/payment.dto.js";

export class PaymentController {
  static async simulateCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");
      const response = await PaymentService.simulateCheckout(
        publicId,
        req.body as SimulatePaymentInput,
      );
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}
