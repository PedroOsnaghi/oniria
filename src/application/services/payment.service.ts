import { PaymentProvider } from "../../domain/providers/payment-provider.interface";

export class PaymentService {
    private paymentProvider: PaymentProvider;

  constructor(paymentProvider: PaymentProvider) {
    this.paymentProvider = paymentProvider;
  }
}