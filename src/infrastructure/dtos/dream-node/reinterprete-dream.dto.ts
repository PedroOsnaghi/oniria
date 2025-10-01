import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ReinterpreteDreamRequestDto {
  @IsString({ message: 'La descripción debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres.' })
  @MaxLength(2000, { message: 'La descripción debe tener máximo 2000 caracteres.' })
  description!: string;

  @IsString({ message: 'La interpretación anterior debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La interpretación anterior no puede estar vacía.' })
  @MinLength(5, { message: 'La interpretación anterior debe tener al menos 5 caracteres.' })
  @MaxLength(5000, { message: 'La interpretación anterior debe tener máximo 5000 caracteres.' })
  previousInterpretation!: string;
}