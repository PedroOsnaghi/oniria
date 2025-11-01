export interface IUser {
    id?: string;
    email: string;
    name: string;
    password: string;
    date_of_birth: Date;
    coin_amount: number;
    membership: "free" | "pro";
    membership_start_date?: string;
    membership_end_date?: string;
}

export interface IUserContext {
    id: string;
    email: string;
    name: string;
    date_of_birth: Date;
    coin_amount: number;
}

export interface IRepositoryUser extends IUserContext {
    token: string | null;
}
