import { IUser } from "../interfaces/user.interface";

export interface IUserRepository {
    findById(id: string): Promise<IUser | null>;
  upgradeMembership(userId: string, newTier: string): Promise<void>;
  addCoins(userId: string, amount: number): Promise<void>;
  update(user: IUser): Promise<void>;
}