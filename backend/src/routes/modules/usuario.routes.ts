import { Router } from "express";
import { UsuarioController } from "../../controllers/usuario.controller";
import { UsuarioService } from "../../services/usuario.service";
import { UsuarioRepository } from "../../repositories/usuario.repository";
import { supabase } from "../../config/supabase";
import { authMiddleware } from "../../middlewares/auth.middleware";

export const usuarioRouter = Router();

const usuarioRepository = new UsuarioRepository(supabase);
const usuarioService = new UsuarioService(usuarioRepository);
const usuarioController = new UsuarioController(usuarioService);

usuarioRouter.get("/", authMiddleware, usuarioController.obtenerUsuarios.bind(usuarioController));
usuarioRouter.post("/", usuarioController.registrarUsuario.bind(usuarioController));

