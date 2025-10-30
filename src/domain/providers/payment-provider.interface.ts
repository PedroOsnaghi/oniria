import { PaymentRequest, PaymentResponse } from "../models/payment.model";

export interface PaymentProvider {
    createPayment(paymentData: PaymentRequest): Promise<PaymentResponse>;
}