import { PaymentMethod } from "../../../core/enums/index.js";
import { SecurityUtils } from "../../../core/security/security.utils.js";
import { UserModel } from "../../user/models/user.model.js";
import { PaymentModel } from "../models/payment.model.js";
import type { SimulatePaymentInput, SimulatePaymentResponseDTO } from "../dtos/payment.dto.js";

export class PaymentService {
  static async simulateCheckout(
    clientPublicId: string,
    data: SimulatePaymentInput,
  ): Promise<SimulatePaymentResponseDTO> {
    if (!PaymentMethod.isValid(data.paymentMethod)) {
      throw new Error("INVALID_PAYMENT_METHOD");
    }

    const clientId = await UserModel.findInternalIdByPublicId(clientPublicId);
    if (!clientId) throw new Error("USER_NOT_FOUND");

    const { order, payment } = await PaymentModel.checkoutFromCart({
      clientId,
      publicId: SecurityUtils.generatePublicId(),
      code: SecurityUtils.generateOrderCode(),
      paymentMethod: data.paymentMethod,
      observation: data.observation ?? null,
    });

    return {
      data: { order, payment },
      message: "Pagamento simulado com sucesso.",
    };
  }
}
