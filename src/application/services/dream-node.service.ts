import { DreamNode, Emotion } from "../../domain/models/dream-node.model";
import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { v4 as uuidv4 } from 'uuid';

export class DreamNodeService {
    constructor(private dreamNodeRepository: IDreamNodeRepository) {
        this.dreamNodeRepository = dreamNodeRepository;
    }
    async saveDreamNode(userId: string, title: string, description: string, interpretation: string, emotion: string): Promise<void> {
        try {
            const dreamNode: DreamNode = {
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
        } catch (error) {
            throw new Error("Error guardando el nodo de sueño: " + error);
        }
    }
}