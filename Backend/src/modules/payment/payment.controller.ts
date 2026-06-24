import { Request, Response, NextFunction } from "express";
import PaymentService from "./payment.service";

export default class PaymentController {
  private paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  async simulateCheckout(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const clientPublicId = req.user?.publicId;
      if (!clientPublicId) throw new Error("UNAUTHORIZED");

      const response = await this.paymentService.simulateCheckout(
        clientPublicId,
        req.body,
      );

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}
