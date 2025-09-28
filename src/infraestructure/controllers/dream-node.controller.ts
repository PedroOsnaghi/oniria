import { Request, Response } from "express";
import { validate } from "class-validator";
import { InterpretationDreamService } from "../../application/services/interpreation-dream.service";
import { IDreamNodeResponseDto, InterpreteDreamDto } from "../dtos/dream-node.dto";
import { plainToInstance } from "class-transformer";

export class DreamNodeController {
    constructor(private readonly dreamNodeService: InterpretationDreamService) {}

    async interpret(req: Request, res: Response) {
        try {
            console.log("=== SOLICITUD DE INTERPRETACIÓN ===");
            console.log("Body:", req.body);

            const interpreteDreamDto = plainToInstance(InterpreteDreamDto, req.body);
            const errors = await validate(interpreteDreamDto);

            if (errors.length > 0) {
                return res.status(400).json({
                    message: 'Errores de validación',
                    errors: errors.map(err => ({
                        field: err.property,
                        messages: Object.values(err.constraints || {})
                    }))
                });
            }

            const description = interpreteDreamDto.description;

            const dreamNode = await this.dreamNodeService.interpretDream( description);
            const dreamNodeResponseDto: IDreamNodeResponseDto = {
                id: dreamNode.id,
                title: dreamNode.title,
                description: dreamNode.description,
                interpretation: dreamNode.interpretation,
                creationDate: dreamNode.creationDate,
                emotion: dreamNode.emotion
            }
            res.json(dreamNodeResponseDto);

        } catch (error: any) {
            console.error("Error en DreamNodeController:", error);
            res.status(500).json({
                message: "Error interno del servidor",
                error: error.message || "Error al interpretar el sueño"
            });
        }
    }
}