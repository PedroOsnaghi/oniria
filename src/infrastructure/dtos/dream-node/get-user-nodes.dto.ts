import { IsOptional, IsIn, IsString, Length, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUserNodesRequestDto {
  @IsOptional()
  @IsIn(['Activo', 'Archivado'], { message: 'El estado debe ser "Activo" o "Archivado".' })
  state?: string;

  @IsOptional()
  @IsIn(['Publico', 'Privado', 'Anonimo'], { message: 'La privacidad debe ser "Publico", "Privado" o "Anonimo".' })
  privacy?: string;

  @IsOptional()
  @IsIn(['Felicidad', 'Tristeza', 'Miedo', 'Enojo'], { message: 'La emoción debe ser "Felicidad", "Tristeza", "Miedo" o "Enojo".' })
  emotion?: string;

  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser una cadena válida.' })
  @Length(2, 100, { message: 'La búsqueda debe tener entre 2 y 100 caracteres.' })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La página debe ser un número válido.' })
  @Min(1, { message: 'La página debe ser mayor a 0.' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El límite debe ser un número válido.' })
  @Min(1, { message: 'El límite debe ser mayor a 0.' })
  @Max(100, { message: 'El límite no puede ser mayor a 100.' })
  limit?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener un formato válido. Ejemplo: 2024-01-15' })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener un formato válido. Ejemplo: 2024-12-31' })
  to?: string;
}