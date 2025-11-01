import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateDreamNodeRequestDto {
    @IsString()
    @IsNotEmpty()
    id!: string;
    @IsOptional()
    @IsIn(['Activo', 'Archivado'], { message: 'El estado debe ser "Activo" o "Archivado".' })
    state?: string;
    @IsOptional()
    @IsIn(['Publico', 'Privado', 'Anonimo'], { message: 'La privacidad debe ser "Publico", "Privado" o "Anonimo".' })
    privacy?: string;
}