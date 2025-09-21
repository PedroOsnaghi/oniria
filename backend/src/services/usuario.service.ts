export class UsuarioService {
  constructor() { }

  async saludar() {
    return "hola desde servicio"; // acá llama a la base de datos através del cliente (prisma o supabase)
  }
}
