import { IUser } from "../../domain/interfaces/user.interface";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { LoginDTO } from "../../infrastructure/dtos/user/login.dto";
import { RegisterUserDTO } from "../../infrastructure/dtos/user/register-user.dto";

export class UserService {
  constructor(private userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }
  async register(userInfo: RegisterUserDTO) {
    const user: IUser = {
      coin_amount: 0,
      ...userInfo,
    };

    return await this.userRepository.register(user);
  }

  async login(userCredentials: LoginDTO) {
    return await this.userRepository.login(userCredentials);
  }
}
