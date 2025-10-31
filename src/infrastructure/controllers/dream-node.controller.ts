import { Request, Response } from "express";
import { InterpretationDreamService } from "../../application/services/interpretation-dream.service";
import { DreamNodeService } from "../../application/services/dream-node.service";
import { IllustrationDreamService } from "../../application/services/illustration-dream.service";
import { SaveDreamNodeRequestDto } from "../dtos/dream-node";
import { DreamContextService } from "../../application/services/dream-context.service";

export class DreamNodeController {
  constructor(
    private readonly interpretationDreamService: InterpretationDreamService,
    private readonly dreamNodeService: DreamNodeService,
    private readonly illustrationService: IllustrationDreamService,
    private readonly contextService: DreamContextService
  ) {}

  async interpret(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { description } = req.body;
      const userDreamContext = await this.contextService.getUserDreamContext(
        userId
      );
      const interpretation = await this.interpretationDreamService.interpretDream(
      description,
      userDreamContext
    );

    if (interpretation.context && req.session) {
      try {
          (req.session as any).dreamContext = JSON.parse(JSON.stringify(interpretation.context));

        await new Promise<void>((resolve, reject) => {
          req.session?.save((err: Error | null) => {
            if (err) {
              console.error('Error saving session:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      } catch (error) {
        console.error('Error handling session:', error);
      }
    }
      const illustrationUrl =
        await this.illustrationService.generateIllustration(description);
      res.json({
        description,
        imageUrl: illustrationUrl,
        interpretation: interpretation.interpretation,
        emotion: interpretation.emotion,
        title: interpretation.title,
        dreamType: interpretation.dreamType,
        dreamTypeReason: interpretation.dreamTypeReason
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
      const dreamNode: SaveDreamNodeRequestDto = req.body;
      const session = req.session as any;
      const dreamContext = session.dreamContext ?
        JSON.parse(JSON.stringify(session.dreamContext)) : {
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      };

      if (session.dreamContext) {
        session.dreamContext = null;
        await new Promise<void>((resolve) => {
          req.session?.save(() => resolve());
        });
      }

      await this.dreamNodeService.saveDreamNode(
        userId,
        dreamNode,
        dreamContext
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
      const userId = (req as any).userId;
      const dreamContext = await this.contextService.getUserDreamContext(userId);

      const reinterpretedDream =
        await this.interpretationDreamService.reinterpretDream(
          description,
          previousInterpretation,
          dreamContext
        );

      const illustrationUrl =
        await this.illustrationService.generateIllustration(description);

      res.json({
        description,
        imageUrl: illustrationUrl,
        ...reinterpretedDream,
      });
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
