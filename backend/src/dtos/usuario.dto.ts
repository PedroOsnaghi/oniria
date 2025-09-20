// metodo interface (sin validacion)
export interface UsuarioDTO {
    email: string;
    password: string;
}

// metodo clase (con validacion de class-validator)
export class UsuarioDTO {
    // @IsEmail({ message: 'El email no es valido' })
    // @IsNotEmpty({ message: 'El email no puede estar vacio' } )
    email!: string;
    // @IsNotEmpty({ message: 'La password no puede estar vacia' })
    // @MinLength(6, { message: 'La password debe tener al menos 6 caracteres' })
    password!: string;
}

