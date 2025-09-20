import { Router } from "express";
import { UsuarioController } from "../../controllers/usuario.controller";
import { UsuarioService } from "../../services/usuario.service";

export const usuarioRouter = Router();

const usuarioService = new UsuarioService();
const usuarioController = new UsuarioController(usuarioService);

usuarioRouter.get("/", usuarioController.saludar.bind(usuarioController));
