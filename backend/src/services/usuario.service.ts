import { UsuarioDTO } from "../dtos/usuario.dto";
import { UsuarioRepository } from "../repositories/usuario.repository";

export class UsuarioService {
  constructor(private readonly usuarioRepository: UsuarioRepository) { }

  async obtenerUsuarios() {
    return this.usuarioRepository.obtenerUsuarios();
  }

  async registrarUsuario(usuario: UsuarioDTO) {
    return this.usuarioRepository.registrarUsuario(usuario);
  }
}
