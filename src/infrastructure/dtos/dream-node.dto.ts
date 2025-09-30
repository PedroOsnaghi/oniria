import { IsString, IsNotEmpty, MinLength, MaxLength} from 'class-validator';

export class InterpreteDreamRequestDto {
  @IsString({ message: 'La descripción debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres.' })
  @MaxLength(2000, { message: 'La descripción debe tener máximo 2000 caracteres.' })
  description!: string;
}

export class ReinterpreteDreamRequestDto {
  @IsString({ message: 'La descripción debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres.' })
  @MaxLength(2000, { message: 'La descripción debe tener máximo 2000 caracteres.' })
  description!: string;

  @IsString({ message: 'La interpretación anterior debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La interpretación anterior no puede estar vacía.' })
  @MinLength(5, { message: 'La interpretación anterior debe tener al menos 5 caracteres.' })
  previousInterpretation!: string;
}

export class SaveDreamNodeRequestDto {
  @IsString({ message: 'El userId debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'El userId no puede estar vacío.' })
  userId!: string;
  @IsString({ message: 'El título debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El título debe tener máximo 100 caracteres.' })
  title!: string;
  @IsString({ message: 'La descripción debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres.' })
  @MaxLength(2000, { message: 'La descripción debe tener máximo 2000 caracteres.' })
  description!: string;
  @IsString({ message: 'La interpretación debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La interpretación no puede estar vacía.' })
  @MinLength(10, { message: 'La interpretación debe tener al menos 10 caracteres.' })
  @MaxLength(5000, { message: 'La interpretación debe tener máximo 5000 caracteres.' })
  interpretation!: string;
  @IsString({ message: 'La emoción debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La emoción no puede estar vacía.' })
  emotion!: string;
}