import { LoginDTO } from "../../infrastructure/dtos/user/login.dto";
import { IRepositoryUser, IUser } from "../interfaces/user.interface";

export interface IUserRepository {
    register(user: IUser) : Promise<IRepositoryUser>;
    login(userCredentials: LoginDTO) : Promise<IRepositoryUser>;
}

export interface IUserRepository {
    findById(id: string): Promise<IUser | null>;
  upgradeMembership(userId: string, newTier: string): Promise<void>;
  addCoins(userId: string, amount: number): Promise<void>;
  update(user: IUser): Promise<void>;
}