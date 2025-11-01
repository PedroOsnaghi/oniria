import { PaymentProvider } from "../../domain/providers/payment-provider.interface";
import { CreatePaymentRequestDto } from "./../../infrastructure/dtos/payment/create-payment-request.dto";

export class PaymentService {
  private paymentProvider: PaymentProvider;
  constructor(paymentProvider: PaymentProvider) {
    this.paymentProvider = paymentProvider;
  }

  async createPayment(paymentData: CreatePaymentRequestDto): Promise<any> {
    return this.paymentProvider.createPayment(paymentData);
  }
}
