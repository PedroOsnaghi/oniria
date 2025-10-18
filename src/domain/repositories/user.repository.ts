import { LoginDTO } from "../../infrastructure/dtos/user/login.dto";
import { IRepositoryUser, IUser, IUserContext } from "../interfaces/user.interface";

export interface IUserRepository {
    register(user: IUser) : Promise<IRepositoryUser>;
    login(userCredentials: LoginDTO) : Promise<IRepositoryUser>;
    getUserContext(userId: string) : Promise<IUserContext | null>;
}