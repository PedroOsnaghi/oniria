import { IMembership } from "../../domain/interfaces/membership.interface";
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
      membership: "free",
      ...userInfo,
    };

    return await this.userRepository.register(user);
  }

  async login(userCredentials: LoginDTO) {
    return await this.userRepository.login(userCredentials);
  }

  async updateMembership(userId: string, newTier: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();
    const currentEnd = user.membership_end_date
      ? new Date(user.membership_end_date)
      : null;

    let startDate = now;
    let endDate = new Date(now);

    endDate.setMonth(endDate.getMonth() + 1);
    if (currentEnd && currentEnd > now && user.membership === newTier) {
      startDate = new Date(user.membership_start_date!);
      endDate = new Date(currentEnd);
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const newMembership: IMembership = {
      membership: newTier,
      membership_start_date: startDate.toISOString(),
      membership_end_date: endDate.toISOString(),
    };
    await this.userRepository.updateMembership(userId, newMembership);
  }

  async checkMembershipStatus(userId: string): Promise<"active" | "expired"> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const now = new Date();
    return user.membership_end_date && new Date(user.membership_end_date) > now
      ? "active"
      : "expired";
  }

  async addCoins(userId: string, amount: number) {
    return await this.userRepository.addCoins(userId, amount);
  }
}
