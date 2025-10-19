import { Request, Response } from "express";
import { InterpretationDreamService } from "../../application/services/interpretation-dream.service";
import { DreamNodeService } from "../../application/services/dream-node.service";
import { IllustrationDreamService } from "../../application/services/illustration-dream.service";
import * as fs from "node:fs";

export class DreamNodeController {
  constructor(
    private readonly interpretationDreamService: InterpretationDreamService,
    private readonly dreamNodeService: DreamNodeService,
    private readonly illustrationService: IllustrationDreamService
  ) {}

  async interpret(req: Request, res: Response): Promise<void> {
    try {
      const { description } = req.body;
      const interpretedDream =
        await this.interpretationDreamService.interpretDream(description);
      const illustrationUrl =
        await this.illustrationService.generateIllustration(description);
      res.json({
        description,
        imageUrl: illustrationUrl,
        ...interpretedDream,
      });
    } catch (error: any) {
      console.error("Error en DreamNodeController:", error);
      res.status(500).json({
        errors: "Error al interpretar el sueño",
      });
    }
  }

  async save(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { title, description, interpretation, emotion } = req.body;
      await this.dreamNodeService.saveDreamNode(
        userId,
        title,
        description,
        interpretation,
        emotion
      );
      return res
        .status(201)
        .json({ message: "Nodo de sueño guardado exitosamente", errors: [] });
    } catch (error: any) {
      console.error("Error en DreamNodeController:", error);
      return res.status(500).json({
        message: "Error interno del servidor",
        errors: [error.message || "Error al guardar el nodo de sueño"],
      });
    }
  }

  async reinterpret(req: Request, res: Response) {
    try {
      const { description, previousInterpretation } = req.body;
      // moderation handled by middleware
      const reinterpretedDream =
        await this.interpretationDreamService.reinterpretDream(
          description,
          previousInterpretation
        );

      res.json({ description, ...reinterpretedDream });
    } catch (error: any) {
      console.error("Error en DreamNodeController reinterpret:", error);
      res.status(500).json({
        errors: "Error al reinterpretar el sueño",
      });
    }
  }

  async getUserNodes(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { state, privacy, emotion, search, page, limit, from, to } =
        (req as any).validatedQuery || {};
      const filters: any = {};
      if (state) filters.state = state;
      if (privacy) filters.privacy = privacy;
      if (emotion) filters.emotion = emotion;
      if (search) filters.search = search;
      if (from) filters.from = from;
      if (to) filters.to = to;

      const pagination: any = {};
      if (page) pagination.page = page;
      if (limit) pagination.limit = limit;

      if (!userId) {
        return res.status(400).json({
          errors: "El id del usuario es requerido",
        });
      } else {
        const paginatedResult = await this.dreamNodeService.getUserNodes(
          userId,
          filters,
          pagination
        );

        res.json(paginatedResult);
      }
    } catch (error: any) {
      console.error("Error en DreamNodeController getUserNodes:", error);
      res.status(500).json({
        errors: "Error al obtener los nodos de sueño del usuario",
      });
    }
  }

  async showUser(req: Request, res: Response) {
    try {
      const user = (req as any).userId;
      res.json(user);
    } catch (error: any) {
      console.error("Error en DreamNodeController showUser:", error);
      res.status(500).json({
        errors: "Error al obtener el usuario",
      });
    }
  }
}
