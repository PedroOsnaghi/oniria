import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDTO {
    @IsEmail({}, { message: "El correo debe ser una dirección de correo electrónico valido." })
    @IsNotEmpty({ message: "El correo no puede estar vacío." })
    email!: string;
    @IsString({ message: "La contraseña debe ser una cadena válida." })
    @IsNotEmpty({ message: "La contraseña no puede estar vacía." })
    password!: string;
}