import { Request, Response } from "express";
import { UserService } from "../../application/services/user.service";
import { RegisterUserDTO } from "../dtos/user/register-user.dto";
import { LoginDTO } from "../dtos/user/login.dto";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async register(req: Request, res: Response) {
    try {
      const user = await this.userService.register(req.body as RegisterUserDTO);
      res.json(user);
    } catch (error: any) {
      console.error("Error en UserController register:", error);
      res.status(500).json({
        errors: "Error al registrar el usuario",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const user = await this.userService.login(req.body as LoginDTO);
      res.json(user);
    } catch (error: any) {
      console.error("Error en UserController login:", error);
      res.status(500).json({
        errors: "Error al iniciar sesión",
      });
    }
  }
}
