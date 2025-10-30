import { IUserRepository } from "../../domain/repositories/user.repository";

export class UserService {
  constructor(private userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }
}