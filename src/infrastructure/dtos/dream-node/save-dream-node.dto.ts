import { IsString, IsNotEmpty, Length, IsIn} from 'class-validator';

export class SaveDreamNodeRequestDto {
  @IsNotEmpty({ message: 'El userId no puede estar vacío.' })
  userId!: string;
  @IsString({ message: 'El título debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @Length(3, 100, { message: 'El título debe tener entre 3 y 100 caracteres.' })
  title!: string;
  @IsString({ message: 'La descripción debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @Length(10, 2000, { message: 'La descripción debe tener entre 10 y 2000 caracteres.' })
  description!: string;
  @IsString({ message: 'La interpretación debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La interpretación no puede estar vacía.' })
  @Length(10, 5000, { message: 'La interpretación debe tener entre 10 y 5000 caracteres.' })
  interpretation!: string;
  @IsString({ message: 'La emoción debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La emoción no puede estar vacía.' })
  @IsIn(['Felicidad', 'Tristeza', 'Miedo', 'Enojo'],
    { message: 'La emoción debe ser: Felicidad, Tristeza, Miedo, Enojo' })
  emotion!: string;
}