import { LoginDTO } from "../../infrastructure/dtos/user/login.dto";
import { IRepositoryUser, IUser } from "../interfaces/user.interface";

export interface IUserRepository {
    register(user: IUser) : Promise<IRepositoryUser>;
    login(userCredentials: LoginDTO) : Promise<IRepositoryUser>;
}