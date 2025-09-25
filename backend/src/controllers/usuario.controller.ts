import { Request, Response } from "express";
import { UsuarioService } from "../services/usuario.service";
import { UsuarioDTO } from "../dtos/usuario.dto";

export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  async obtenerUsuarios(req: Request, res: Response) {
    const saludo = await this.usuarioService.obtenerUsuarios();
    res.send(saludo);
  }

  async registrarUsuario(req: Request, res: Response) {
    const { nombre_usuario, contrasena, email } = req.body as UsuarioDTO;
    const response = await this.usuarioService.registrarUsuario({
      nombre_usuario,
      contrasena,
      email,
    });
    res.json(response);
  }
}
