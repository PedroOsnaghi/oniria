import { IDreamNodeFilters } from "../../domain/interfaces/dream-node-filters.interface";
import {
  IPaginationOptions,
  IPaginatedResult,
} from "../../domain/interfaces/pagination.interface";
import { IDreamNode, Emotion } from "../../domain/models/dream-node.model";
import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { SaveDreamNodeRequestDto } from "../../infrastructure/dtos/dream-node";
import { envs } from "../../config/envs";
import { MissionService } from "./mission.service";
export class DreamNodeService {
  constructor(private dreamNodeRepository: IDreamNodeRepository, private missionService?: MissionService) {
    this.dreamNodeRepository = dreamNodeRepository;
  }
  async saveDreamNode(
    userId: string,
    dreamNode: SaveDreamNodeRequestDto
  ): Promise<void> {
    const { description, title, interpretation, emotion } = dreamNode;
    let { imageUrl } = dreamNode;

    if (!imageUrl || !imageUrl.startsWith(envs.SUPABASE_URL)) {
      imageUrl = "";
    }

    try {
      const dreamNode: IDreamNode = {
        creationDate: new Date(),
        title,
        description,
        interpretation,
        privacy: "Privado",
        state: "Activo",
        emotion: (emotion.charAt(0).toUpperCase() +
          emotion.slice(1)) as Emotion,
        imageUrl,
      };
      await this.dreamNodeRepository.save(dreamNode, userId);
      // Fire-and-forget mission updates; do not block save on badges logic
      if (this.missionService) {
        this.missionService.onDreamSaved(userId).catch((e) => {
          console.error('MissionService onDreamSaved error:', e);
        });
      }
    } catch (error: unknown) {
      throw new Error(
        "Error guardando el nodo de sueño: " + (error as Error).message
      );
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
