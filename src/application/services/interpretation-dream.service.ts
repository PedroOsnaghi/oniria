import { Interpretation } from "../../domain/interfaces/interpretation-dream.interface";
import { IUserContext } from "../../domain/interfaces/user.interface";
import { InterpretationProvider } from "../../domain/providers/interpretation.provider";

export class InterpretationDreamService {
    constructor(private interpretationProvider: InterpretationProvider, ) {
        this.interpretationProvider = interpretationProvider;
    }
    async interpretDream(dreamText: string,userDreamContext?: IUserContext | null): Promise<Interpretation> {
        try {
            return await this.interpretationProvider.interpretDream(dreamText, userDreamContext);
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