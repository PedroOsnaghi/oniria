import { envs } from "../../config/envs";
import { IDreamNodeFilters } from "../../domain/interfaces/dream-node-filters.interface";
import { DreamContext } from "../../domain/interfaces/interpretation-dream.interface";
import {
  IPaginationOptions,
  IPaginatedResult,
} from "../../domain/interfaces/pagination.interface";
import { IDreamNode, Emotion } from "../../domain/models/dream-node.model";
import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { SaveDreamNodeRequestDto } from "../../infrastructure/dtos/dream-node";
import { MissionService } from "./mission.service";
import { Badge } from "../../domain/models/badge.model";

export class DreamNodeService {
  constructor(private dreamNodeRepository: IDreamNodeRepository, private missionService?: MissionService) {
    this.dreamNodeRepository = dreamNodeRepository;
  }
  async saveDreamNode(
    userId: string,
    dream: SaveDreamNodeRequestDto,
    dreamContext: DreamContext
  ): Promise<Badge[]> {
    const {
      title,
      description,
      interpretation,
      emotion,
      imageUrl = "",
    } = dream;

    const finalImageUrl = imageUrl?.startsWith(envs.SUPABASE_URL) ? imageUrl : "";

    const dreamNode: IDreamNode = {
      creationDate: new Date(),
      title,
      dream_description: description,
      interpretation,
      imageUrl: finalImageUrl,
      dream_privacy: "Privado",
      dream_state: "Activo",
      dream_emotion: emotion as Emotion,
    };

    const dreamNodeCreated = await this.dreamNodeRepository.save(
      dreamNode,
      userId
    );

    if (!dreamNodeCreated?.id) {
      throw new Error("No se pudo crear el nodo de sueño");
    }

    await this.dreamNodeRepository.addDreamContext(
      dreamNodeCreated.id,
      userId,
      dreamContext
    );

    let unlockedBadges: Badge[] = [];
    if (this.missionService) {
      try {
        unlockedBadges = await this.missionService.onDreamSaved(userId);
      } catch (e) {
        console.error('MissionService onDreamSaved error:', e);
      }
    }

    return unlockedBadges;
  }

  async onDreamReinterpreted(userId: string): Promise<Badge[]> {
    if (!this.missionService) return [];
    try {
      const badges = await this.missionService.onDreamReinterpreted(userId);
      return badges || [];
    } catch (e) {
      console.error('MissionService onDreamReinterpreted error:', e);
      return [];
    }
  }

  async getUserNodes(
    userId: string,
    filters: IDreamNodeFilters,
    pagination?: IPaginationOptions
  ): Promise<IPaginatedResult<IDreamNode>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const paginationData: IPaginationOptions = {
        page,
        limit,
        offset,
      };

      const [nodes, total] = await Promise.all([
        this.dreamNodeRepository.getUserNodes(userId, filters, paginationData),
        this.dreamNodeRepository.countUserNodes(userId, filters),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        data: nodes,
        pagination: {
          currentPage: page,
          limit: limit,
          total: total,
          totalPages: totalPages,
          hasNext: hasNext,
          hasPrev: hasPrev,
        },
      };
    } catch (error) {
      throw new Error(
        "Error obteniendo los nodos de sueño del usuario: " + error
      );
    }
  }
}
