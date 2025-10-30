import { MercadoPagoConfig, Payment } from "mercadopago";
import { PaymentProvider } from "../../domain/providers/payment-provider.interface";
import { envs } from "../../config/envs";
import {
  PaymentRequest,
  PaymentResponse,
} from "../../domain/models/payment.model";

export class PaymentMercadoPagoProvider implements PaymentProvider {
  private paymentApi: Payment;

  constructor() {
    const client = new MercadoPagoConfig({
      accessToken: envs.MERCADO_PAGO_ACCESS_TOKEN,
      options: { timeout: 5000 },
    });

    this.paymentApi = new Payment(client);
  }

  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const body = {
        transaction_amount: Number(paymentData.transaction_amount.toFixed(2)),
        token: paymentData.token,
        description: paymentData.description,
        installments: paymentData.installments,
        payment_method_id: paymentData.payment_method_id,
        payer: {
          email: paymentData.payer.email,
          identification: {
            type: paymentData.payer.identification.type,
            number: paymentData.payer.identification.number,
          },
        },
        statement_descriptor: "Oniria",
      };

      const payment = await this.paymentApi.create({ body });

      return {
        id: payment.id?.toString() ?? "",
        status: payment.status ?? "unknown",
        status_details: payment.status_detail ?? "",
        transaction_amount: payment.transaction_amount ?? 0,
        description: payment.description ?? "",
      };
    } catch (error: any) {
      console.error("Error en PaymentMercadoPagoProvider:", error);
      throw new Error("Error al procesar el pago con Mercado Pago");
    }
  }
}
