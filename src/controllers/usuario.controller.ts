import { Request, Response } from "express";
import { UsuarioService } from "../services/usuario.service";

export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) {}

    async saludar(req: Request, res: Response){
        const saludo = await this.usuarioService.saludar();
        res.send(saludo);
    }

}