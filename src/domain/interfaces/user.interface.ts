export interface IUser {
    id?: string;
    email: string;
    name: string;
    password: string;
    date_of_birth: Date;
    coin_amount: number;
}

export interface IRepositoryUser {
    id: string;
    email: string;
    name: string;
    date_of_birth: Date;
    coin_amount: number;
    token: string | null;
}


