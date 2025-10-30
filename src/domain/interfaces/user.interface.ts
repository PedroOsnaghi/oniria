export interface IUser {
    id?: string;
    email: string;
    name: string;
    date_of_birth: Date;
    coin_amount: number;
    membership: "free" | "pro";
}