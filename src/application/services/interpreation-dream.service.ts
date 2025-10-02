import { Interpretation } from "../../domain/models/interpretation-dream.model";
import { InterpretationProvider } from "../../domain/providers/interpretation.provider";

export class InterpretationDreamService {
    constructor(private interpretationProvider: InterpretationProvider) {
        this.interpretationProvider = interpretationProvider;
    }
    async interpretDream(dreamText: string): Promise<Interpretation> {
        try {
            return await this.interpretationProvider.interpretDream(dreamText);
        } catch (error) {
            throw new Error("Error interpretando el sueño: " + (error as Error).message);
        }
    }
 
    async reinterpretDream(dreamText: string, previousInterpretation: string): Promise<Interpretation> {
        try {
            return await this.interpretationProvider.reinterpretDream(dreamText, previousInterpretation);
        } catch (error) {
            throw new Error("Error reinterpretando el sueño: " + (error as Error).message);
        }
    }
}