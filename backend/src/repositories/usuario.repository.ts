import { SupabaseClient } from "@supabase/supabase-js";
import { UsuarioDTO } from "../dtos/usuario.dto";
export class UsuarioRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async registrarUsuario(usuario: UsuarioDTO) {
    const response = await this.supabase.from("usuarios").insert(usuario);
    return response;
  }

  async obtenerUsuarios() {
    const response = await this.supabase.from("usuarios").select("*");
    return response;
  }

}
