import { LoginDTO } from "../../infrastructure/dtos/user/login.dto";
import { IMembership } from "../interfaces/membership.interface";
import { IRepositoryUser, IUser } from "../interfaces/user.interface";

export interface IUserRepository {
  register(user: IUser): Promise<IRepositoryUser>;
  login(userCredentials: LoginDTO): Promise<IRepositoryUser>;
  updateMembership(userId: string, membership: IMembership): Promise<void>;
  addCoins(userId: string, amount: number): Promise<void>;
  findById(id: string): Promise<IUser | null>;
}
