export class UsuarioService {
  constructor() { }

  async saludar() {
    return "hola"; // acá llama a la base de datos através del cliente (prisma o supabase)
  }
}
