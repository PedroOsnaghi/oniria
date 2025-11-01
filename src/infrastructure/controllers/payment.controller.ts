import { Request, Response } from "express";
import { PaymentService } from "../../application/services/payment.service";
import { UserService } from "../../application/services/user.service";
import { CreatePaymentRequestDto } from "../dtos/payment/create-payment-request.dto";

export class PaymentController {
  private paymentService: PaymentService;
  private userService: UserService;
  constructor(paymentService: PaymentService, userService: UserService) {
    this.paymentService = paymentService;
    this.userService = userService;
  }

  async createPayment(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const dto = req.body as CreatePaymentRequestDto;

      const payment = await this.paymentService.createPayment(dto);

      switch (payment.status) {
        case "approved":
          await this.userService.updateMembership(userId, "pro");
          return res
            .status(200)
            .json({ message: "Pago aprobado y membresía actualizada" });

        case "in_process":
          return res
            .status(202)
            .json({ message: "Pago en proceso de aprobación" });

        default:
          return res.status(400).json({
            message: "Pago rechazado",
            detail: payment.status_detail,
          });
      }
    } catch (error: any) {
      console.error("Error al crear el pago:", error);
      return res.status(500).json({
        message: "Error al procesar el pago",
        error: error.message,
      });
    }
  }
}
