import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { DreamNodeService } from "../services/dream-node.service";
import { CreateDreamNodeDto } from "../dtos/dream-node.dto";

export class DreamNodeController {
    constructor(private readonly dreamNodeService: DreamNodeService) {}

    async interpret(req: Request, res: Response) {
        try {
            console.log("=== SOLICITUD DE INTERPRETACIÓN ===");
            console.log("Body:", req.body);
            
            const createDreamNodeDto = plainToInstance(CreateDreamNodeDto, req.body);
            const errors = await validate(createDreamNodeDto);

            if (errors.length > 0) {
                return res.status(400).json({
                    mensaje: 'Errores de validación',
                    errores: errors.map(err => ({
                        campo: err.property,
                        mensajes: Object.values(err.constraints || {})
                    }))
                });
            }

            const dreamNode = await this.dreamNodeService.interpretDream(createDreamNodeDto);
            res.json(dreamNode);

        } catch (error: any) {
            console.error("Error en DreamNodeController:", error);
            res.status(500).json({ 
                mensaje: "Error interno del servidor",
                error: error.message || "Error al interpretar el sueño" 
            });
        }
    }
}