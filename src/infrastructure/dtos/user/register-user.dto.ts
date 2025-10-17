import { Type } from "class-transformer";
import {
    IsDate,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from "class-validator";

export class RegisterUserDTO {
  @IsString({ message: "El nombre debe ser una cadena válida." })
  @IsNotEmpty({ message: "El nombre no puede estar vacío." })
  @Length(2, 100, { message: "El nombre debe tener entre 2 y 100 caracteres." })
  name!: string;
  @IsEmail(
    {},
    {
      message: "El correo debe ser una dirección de correo electrónico valido.",
    }
  )
  @IsNotEmpty({ message: "El correo no puede estar vacío." })
  email!: string;
  @IsString({ message: "La contraseña debe ser una cadena válida." })
  @IsNotEmpty({ message: "La contraseña no puede estar vacía." })
  password!: string;
  @Type(() => Date)
  @IsDate({ message: "La fecha debe ser una fecha válida" })
  date_of_birth!: Date;
}
