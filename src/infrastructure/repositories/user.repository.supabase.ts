import { supabase } from "../../config/supabase";
import {
  IRepositoryUser,
  IUser,
  IUserContext,
} from "../../domain/interfaces/user.interface";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { LoginDTO } from "../dtos/user/login.dto";

export class UserRepository implements IUserRepository {
  async register(user: IUser): Promise<IRepositoryUser> {
    const { email, password, date_of_birth: dateOfBirth } = user;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          date_of_birth: dateOfBirth.toISOString().split("T")[0],
        },
      },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "No se pudo crear usuario");
    }

    return {
      id: authData.user.id,
      email: user.email,
      name: user.name,
      date_of_birth: user.date_of_birth,
      token: authData.session?.access_token || null,
      coin_amount: 0,
    };
  }

  async login(userCredentials: LoginDTO): Promise<IRepositoryUser> {
    const { email, password } = userCredentials;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      throw new Error(error?.message || "No se pudo iniciar sesión");
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profile")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Error al obtener perfil: ${profileError.message}`);
    }

    if (!profileData) {
      throw new Error("No se encontró el perfil del usuario");
    }

    return {
      id: data.user.id,
      email: email,
      name: data.user.user_metadata?.name ?? null,
      date_of_birth: profileData.date_of_birth,
      coin_amount: profileData.coin_amount,
      token: data.session.access_token,
    };
  }

  async getUserContext(userId: string): Promise<IUserContext | null> {
    const { data, error } = await supabase.rpc("get_user_context", {
      params: { user_id: userId },
    });

    if (error) {
      console.error("Error getting user context:", error);
      return null;
    }

    return data as IUserContext;
  }
}
