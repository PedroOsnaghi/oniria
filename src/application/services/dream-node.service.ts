import { IDreamNodeFilters } from "../../domain/interfaces/dream-node-filters.interface";
import { IPaginationOptions, IPaginatedResult } from "../../domain/interfaces/pagination.interface";
import { IDreamNode, Emotion } from "../../domain/models/dream-node.model";
import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { v4 as uuidv4 } from 'uuid';

export class DreamNodeService {
    constructor(private dreamNodeRepository: IDreamNodeRepository) {
        this.dreamNodeRepository = dreamNodeRepository;
    }
    async saveDreamNode(userId: string, title: string, description: string, interpretation: string, emotion: string): Promise<void> {
        try {
            const dreamNode: IDreamNode = {
                id : uuidv4(),
                creationDate: new Date(),
                title,
                description,
                interpretation,
                privacy: "Privado",
                state: "Activo",
                emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1) as Emotion
            }
            await this.dreamNodeRepository.save(dreamNode, userId);
        } catch (error: unknown) {
            throw new Error("Error guardando el nodo de sueño: " + (error as Error).message);
        }
    }

    async getUserNodes(userId: string, filters: IDreamNodeFilters, pagination?: IPaginationOptions): Promise<IPaginatedResult<IDreamNode>> {
        try {
            const page = pagination?.page || 1;
            const limit = pagination?.limit || 10;
            const offset = (page - 1) * limit;

            const paginationData: IPaginationOptions = {
                page,
                limit,
                offset
            };

            const [nodes, total] = await Promise.all([
                this.dreamNodeRepository.getUserNodes(userId, filters, paginationData),
                this.dreamNodeRepository.countUserNodes(userId, filters)
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
                    hasPrev: hasPrev
                }
            };
        } catch (error) {
            throw new Error("Error obteniendo los nodos de sueño del usuario: " + error);
        }
    }

}