import { IDreamContext } from "../../domain/interfaces/dream-context.interface";
import { IDreamNodeFilters } from "../../domain/interfaces/dream-node-filters.interface";
import {
  IPaginationOptions,
  IPaginatedResult,
} from "../../domain/interfaces/pagination.interface";
import { IDreamNode, Emotion } from "../../domain/models/dream-node.model";
import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { SaveDreamNodeRequestDto } from "../../infrastructure/dtos/dream-node";

export class DreamNodeService {
  constructor(private dreamNodeRepository: IDreamNodeRepository) {
    this.dreamNodeRepository = dreamNodeRepository;
  }
  async saveDreamNode(
    userId: string,
    dream: SaveDreamNodeRequestDto
  ): Promise<void> {
    const {
      title,
      description,
      emotion,
      interpretation,
      themes,
      people,
      locations,
      emotions_context,
    } = dream;

    const dreamNode: IDreamNode = {
      creationDate: new Date(),
      title,
      dream_description: description,
      interpretation,
      dream_privacy: "Privado",
      dream_state: "Activo",
      dream_emotion: (emotion.charAt(0).toUpperCase() + emotion.slice(1)) as Emotion,
    };

    const dreamNodeCreated = await this.dreamNodeRepository.save(
      dreamNode,
      userId
    );
    if (!dreamNodeCreated?.id)
      throw new Error("No se pudo crear el nodo de sueño");

    await this.dreamNodeRepository.addDreamContext(
      dreamNodeCreated.id,
      userId,
      { themes, people, locations, emotions_context }
    );
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
