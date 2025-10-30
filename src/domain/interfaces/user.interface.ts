export interface IUser {
    id?: string;
    email: string;
    name: string;
    password: string;
    date_of_birth: Date;
    coin_amount: number;
    membership: "free" | "pro";
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
