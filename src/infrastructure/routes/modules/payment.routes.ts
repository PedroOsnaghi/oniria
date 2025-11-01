import { Router } from "express";
import { UserRepository } from "../../repositories/user.repository.supabase";
import { UserService } from "../../../application/services/user.service";
import { PaymentMercadoPagoProvider } from "../../providers/payment-mercadopago.provider";
import { PaymentService } from "../../../application/services/payment.service";
import { CreatePaymentRequestDto } from "../../dtos/payment/create-payment-request.dto";
import { validateBody } from "../../middlewares/validate-class.middleware";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { PaymentController } from "../../controllers/payment.controller";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const paymentProvider = new PaymentMercadoPagoProvider();
const paymentService = new PaymentService(paymentProvider);
const paymentController = new PaymentController(paymentService, userService);

export const paymentRouter = Router();
paymentRouter.post(
  "/create",
  authenticateToken,
  validateBody(CreatePaymentRequestDto),
  (req, res) => paymentController.createPayment(req, res)
);