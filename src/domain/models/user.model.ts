import { IUser } from "../interfaces/user.interface";

export class User implements IUser {
    id: string;
    email: string;
    name: string;
    password: string;
    date_of_birth: Date;
    coin_amount: number;

    constructor(id: string, email: string, name: string, password: string, date_of_birth: Date, coin_amount: number) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.password = password;
        this.date_of_birth = date_of_birth;
        this.coin_amount = coin_amount;
    }
}