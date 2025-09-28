import { DreamNode, Emotion } from "../../domain/models/dream-node.model";
import { InterpretationProvider } from "../../domain/providers/interpretation.provider";

export class InterpretationDreamService {
    constructor(private interpretationProvider: InterpretationProvider) {
        this.interpretationProvider = interpretationProvider;
    }
    async interpretDream(dreamText: string): Promise<DreamNode> {
        try {
            const interpretation = await this.interpretationProvider.interpreteDream(dreamText);

            return new DreamNode(
                crypto.randomUUID(),
                new Date(),
                "",
                dreamText,
                interpretation.interpretation,
                "Publico",
                "Activo",
                interpretation.emotion as Emotion
            );

        } catch (error) {
            throw new Error("Error interpretando el sueño: " + error);
        }
    } 
}