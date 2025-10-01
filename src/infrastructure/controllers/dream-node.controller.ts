import { Request, Response } from "express";
import { validate } from "class-validator";
import { InterpretationDreamService } from "../../application/services/interpreation-dream.service";
import { InterpreteDreamRequestDto, SaveDreamNodeRequestDto, ReinterpreteDreamRequestDto } from "../dtos/dream-node";
import { GetUserNodesParamsDto, GetUserNodesQueryDto } from "../dtos/dream-node/get-user-nodes.dto";
import { plainToInstance } from "class-transformer";
import { DreamNodeService } from "../../application/services/dream-node.service";

export class DreamNodeController {
    constructor(private readonly interpretationDreamService: InterpretationDreamService, private readonly dreamNodeService: DreamNodeService) { }

    async interpret(req: Request, res: Response): Promise<void> {
        try {
            console.log("=== SOLICITUD DE INTERPRETACIÓN ===");
            console.log("Body:", req.body);

            if (!req.body || typeof req.body !== 'object') {
                res.status(400).json({
                    message: 'Errores de validación',
                    errors: [{
                        field: 'body',
                        messages: ['El cuerpo de la solicitud debe ser un JSON válido']
                    }]
                });
                return;
            }

            const interpreteDreamDto = plainToInstance(InterpreteDreamRequestDto, req.body);
            const errors = await validate(interpreteDreamDto);

            if (errors.length > 0) {
                res.status(400).json({
                    message: 'Errores de validación',
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
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({
                    message: 'Errores de validación',
                    errors: [{
                        field: 'body',
                        messages: ['El cuerpo de la solicitud debe ser un JSON válido']
                    }]
                });
            }

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

    async reinterpret(req: Request, res: Response) {
        try {
            console.log("=== SOLICITUD DE REINTERPRETACIÓN ===");
            console.log("Body:", req.body);

            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({
                    message: 'Errores de validación',
                    errors: [{
                        field: 'body',
                        messages: ['El cuerpo de la solicitud debe ser un JSON válido']
                    }]
                });
            }

            const reinterpreteDreamDto = plainToInstance(ReinterpreteDreamRequestDto, req.body);
            const errors = await validate(reinterpreteDreamDto);

            if (errors.length > 0) {
                return res.status(400).json({
                    message: 'Errores de validación',
                    errors: errors.map(err => ({
                        field: err.property,
                        messages: Object.values(err.constraints || {})
                    }))
                });
            }

            const { description, previousInterpretation } = reinterpreteDreamDto;
            const reinterpretedDream = await this.interpretationDreamService.reinterpretDream(description, previousInterpretation);

            res.json({ description, ...reinterpretedDream });

        } catch (error: any) {
            console.error("Error en DreamNodeController reinterpret:", error);
            res.status(500).json({
                errors: "Error al reinterpretar el sueño"
            });
        }
    }

    async getUserNodes(req: Request, res: Response) {
        try {
            const paramsDto = plainToInstance(GetUserNodesParamsDto, req.params);
            const paramsErrors = await validate(paramsDto);

            const queryDto = plainToInstance(GetUserNodesQueryDto, req.query);
            const queryErrors = await validate(queryDto);

            const allErrors = [...paramsErrors, ...queryErrors];
            if (allErrors.length > 0) {
                return res.status(400).json({
                    message: 'Errores de validación en los parámetros de la solicitud',
                    errors: allErrors.map(err => ({
                        field: err.property,
                        messages: Object.values(err.constraints || {})
                    }))
                });
            }

            const { state, privacy, emotion, search, page, limit, from, to } = queryDto;

            const filters: any = {};
            if (state) filters.state = state;
            if (privacy) filters.privacy = privacy;
            if (emotion) filters.emotion = emotion;
            if (search) filters.search = search;
            if (from) filters.from = from;
            if (to) filters.to = to;

            const { userId } = paramsDto;
            const pagination: any = {};
            if (page) pagination.page = page;
            if (limit) pagination.limit = limit;

            const paginatedResult = await this.dreamNodeService.getUserNodes(userId, filters, pagination);

            res.json(paginatedResult);
        } catch (error: any) {
            console.error("Error en DreamNodeController getUserNodes:", error);
            res.status(500).json({
                errors: "Error al obtener los nodos de sueño del usuario"
            });
        }
    }
}