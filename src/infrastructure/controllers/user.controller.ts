import { Request, Response } from "express";
import { UserService } from "../../application/services/user.service";
import { RegisterUserDTO } from "../dtos/user/register-user.dto";
import { LoginDTO } from "../dtos/user/login.dto";
import { SkinService } from "../../application/services/skin.service";

import { SkinRepositorySupabase } from "../repositories/skin.repository.supabase";
import { RoomService } from "../../application/services/room.service";
import { RoomRepositorySupabase } from "../repositories/room.repository.supabase";

export class UserController {
  private readonly skinService: SkinService;
  private readonly roomService: RoomService;

  constructor(
    private readonly userService: UserService,
    skinService?: SkinService,
    roomService?: RoomService
  ) {
    if (skinService && roomService) {
      this.skinService = skinService;
      this.roomService = roomService;
    } else {
      const skinRepository = new SkinRepositorySupabase();
      const roomRepository = new RoomRepositorySupabase();
      this.skinService = new SkinService(skinRepository);
      this.roomService = new RoomService(roomRepository);
    }
  }

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
        errors: "Error al iniciar sesión",
      });
    }
  }
  async getUserSkins(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      if (!userId || userId.trim() === '') {
        res.status(400).json({
          success: false,
          message: "ID de usuario no proporcionado"
        });
        return;
      }

      const response = await this.skinService.getUserSkins(userId);
      res.json(response);
    } catch (error) {
      console.error("Error en UserController getUserSkins:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener los skins del usuario",
        error: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  }
  async getUserRooms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      if (!userId || userId.trim() === '') {
        res.status(400).json({
          success: false,
          message: "ID de usuario no proporcionado"
        });
        return;
      }

      const response = await this.roomService.getUserRooms(userId);
      res.json(response);
    } catch (error) {
      console.error("Error en UserController getUserRooms:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener las habitaciones del usuario",
        error: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  }
}
