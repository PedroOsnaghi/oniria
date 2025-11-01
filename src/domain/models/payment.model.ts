export interface PaymentRequest {
    token: string,
    transaction_amount: number,
    description: string,
    installments: number;
    payment_method_id: string
    payer: {
        email: string
        identification: {
            type: string,
            number: string
        }
    }
}

export interface PaymentResponse {
    id: string,
    status: string,
    status_details: string,
    transaction_amount: number
    description: string
}