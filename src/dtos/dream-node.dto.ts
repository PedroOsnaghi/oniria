import { IsString, IsNotEmpty, Length, IsOptional, IsUUID } from 'class-validator';

export class CreateDreamNodeDto {
  @IsString({ message: 'La descripción debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @Length(10, 2000, { message: 'La descripción debe tener entre 10 y 2000 caracteres.' })
  description!: string;

  @IsString({ message: 'El título debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @Length(5, 200, { message: 'El título debe tener entre 5 y 200 caracteres.' })
  title!: string;

  @IsOptional()
  @IsUUID(4, { message: 'El ID de usuario debe ser un UUID válido.' })
  userId?: string;
}

export interface DreamNodeResponseDto {
  id: string;
  title: string;
  description: string;
  interpretation: string;
  emotion: string;
  creationDate: Date;
}