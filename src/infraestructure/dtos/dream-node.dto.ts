import { IsString, IsNotEmpty, Length} from 'class-validator';

export class InterpreteDreamDto {
  @IsString({ message: 'La descripción debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @Length(10, 2000, { message: 'La descripción debe tener entre 10 y 2000 caracteres.' })
  description!: string;
}

export interface IDreamNodeResponseDto {
  id: string;
  title: string;
  description: string;
  interpretation: string;
  emotion: string;
  creationDate: Date;
}