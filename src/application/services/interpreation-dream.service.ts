import { Interpretation } from "../../domain/models/interpretation-dream.model";
import { InterpretationProvider } from "../../domain/providers/interpretation.provider";

export class InterpretationDreamService {
    constructor(private interpretationProvider: InterpretationProvider) {
        this.interpretationProvider = interpretationProvider;
    }
    async interpretDream(dreamText: string): Promise<Interpretation> {
        try {
            return this.interpretationProvider.interpreteDream(dreamText);
        } catch (error) {
            throw new Error("Error interpretando el sueño: " + error);
        }
    }
}