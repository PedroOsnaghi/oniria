import { envs } from "../../config/envs";
import { IDreamNodeFilters } from "../../domain/interfaces/dream-node-filters.interface";
import { DreamContext } from "../../domain/interfaces/interpretation-dream.interface";
import {
  IPaginationOptions,
  IPaginatedResult,
} from "../../domain/interfaces/pagination.interface";
import { IDreamNode, Emotion } from "../../domain/models/dream-node.model";
import { DreamType, DreamTypeName } from "../../domain/models/dream_type.model";
import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { SaveDreamNodeRequestDto } from "../../infrastructure/dtos/dream-node";

export class DreamNodeService {
  constructor(private dreamNodeRepository: IDreamNodeRepository) {
    this.dreamNodeRepository = dreamNodeRepository;
  }
   async saveDreamNode(
    userId: string,
    dream: SaveDreamNodeRequestDto,
    dreamContext: DreamContext
  ): Promise<void> {
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
      privacy: "Privado",
      state: "Activo",
      emotion: emotion as Emotion,
      type: dream.dreamType as DreamTypeName,
      typeReason: dream.dreamTypeDescription,
    };

    const dreamType = new DreamType(dream.dreamType as DreamTypeName, dream.dreamTypeDescription);

    const { data, error } = await this.dreamNodeRepository.save(
      dreamNode,
      userId,
      dreamType,
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.id) {
    throw new Error("No se pudo crear el nodo de sueño");
  }
    await this.dreamNodeRepository.addDreamContext(
      data.id,
      userId,
      dreamContext
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
