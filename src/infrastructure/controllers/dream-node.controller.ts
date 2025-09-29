import { Request, Response } from "express";
import { validate } from "class-validator";
import { InterpretationDreamService } from "../../application/services/interpreation-dream.service";
import { InterpreteDreamRequestDto, SaveDreamNodeRequestDto } from "../dtos/dream-node.dto";
import { plainToInstance } from "class-transformer";
import { DreamNodeService } from "../../application/services/dream-node.service";

export class DreamNodeController {
    constructor(private readonly interpretationDreamService: InterpretationDreamService, private readonly dreamNodeService: DreamNodeService) { }

    async interpret(req: Request, res: Response): Promise<void> {
        try {
            console.log("=== SOLICITUD DE INTERPRETACIÓN ===");
            console.log("Body:", req.body);

            const interpreteDreamDto = plainToInstance(InterpreteDreamRequestDto, req.body);
            const errors = await validate(interpreteDreamDto);

            if (errors.length > 0) {
                res.status(400).json({
                    errors: errors.map(err => ({
                        field: err.property,
                        messages: Object.values(err.constraints || {})
                    }))
                });
                return
            }
            const { description } = interpreteDreamDto;
            const interpretedDream = await this.interpretationDreamService.interpretDream(description)
            res.json({ description, ...interpretedDream });

        } catch (error: any) {
            console.error("Error en DreamNodeController:", error);
            res.status(500).json({
                errors: "Error al interpretar el sueño"
            });
        }
    }

    async save(req: Request, res: Response) {
        try {
            const saveDreamNodeDto = plainToInstance(SaveDreamNodeRequestDto, req.body);
            const errors = await validate(saveDreamNodeDto);
            if (errors.length > 0) {
                return res.status(400).json({
                    message: 'Errores de validación',
                    errors: errors.map(err => ({
                        field: err.property,
                        messages: Object.values(err.constraints || {})
                    }))
                });
            }
            const { userId, title, description, interpretation, emotion } = saveDreamNodeDto;
            const dreamNode = await this.dreamNodeService.saveDreamNode(userId, title, description, interpretation, emotion);
            return res.status(201).json(dreamNode);
        } catch (error: any) {
            console.error("Error en DreamNodeController:", error);
            return res.status(500).json({
                message: "Error interno del servidor",
                errors: [error.message || "Error al guardar el nodo de sueño"]
            });
        }
    }
}