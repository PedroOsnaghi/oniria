// metodo interface (sin validacion)
export interface UsuarioDTO {
    nombre_usuario: string;
    contrasena: string;
    email: string;
}

// metodo clase (con validacion de class-validator)
// export class UsuarioDTO {
//     @IsEmail({ message: 'El email no es valido' })
//     @IsNotEmpty({ message: 'El email no puede estar vacio' } )
//     email!: string;
//     @IsNotEmpty({ message: 'La password no puede estar vacia' })
//     @MinLength(6, { message: 'La password debe tener al menos 6 caracteres' })
//     password!: string;
// }
