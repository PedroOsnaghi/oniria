import { Router } from "express";
import { UserController } from "../../controllers/user.controller";
import { UserRepository } from './../../repositories/user.repository.supabase';
import { UserService } from "../../../application/services/user.service";
import { validateBody } from "../../middlewares/validate-class.middleware";
import { RegisterUserDTO } from "../../dtos/user/register-user.dto";
import { LoginDTO } from "../../dtos/user/login.dto";
import { authenticateToken } from "../../middlewares/auth.middleware";

export const userRouter = Router();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.post("/register", validateBody(RegisterUserDTO),(req, res) => userController.register(req, res));
userRouter.post("/login", validateBody(LoginDTO), (req, res) => userController.login(req, res));
userRouter.get("/skins", authenticateToken, (req, res) => userController.getUserSkins(req, res));
userRouter.get("/rooms", authenticateToken, (req, res) => userController.getUserRooms(req, res));
