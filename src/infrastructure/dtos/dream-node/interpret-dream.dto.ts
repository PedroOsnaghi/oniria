import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class InterpreteDreamRequestDto {
  @IsString({ message: 'La descripción debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres.' })
  @MaxLength(2000, { message: 'La descripción debe tener máximo 2000 caracteres.' })
  description!: string;
}