import { Interpretation } from "../../domain/interfaces/interpretation-dream.interface";
import { InterpretationProvider } from "../../domain/providers/interpretation.provider";
import { IDreamContext } from "../../domain/interfaces/dream-context.interface";

export class InterpretationDreamService {
    constructor(private interpretationProvider: InterpretationProvider, ) {
        this.interpretationProvider = interpretationProvider;
    }
    async interpretDream(dreamText: string, userDreamContext?: IDreamContext | null): Promise<Interpretation> {
        try {
            const interpretation = await this.interpretationProvider.interpretDream(dreamText, userDreamContext);

            return interpretation;
        } catch (error) {
            throw new Error("Error interpretando el sueño: " + (error as Error).message);
        }
    }

  async reinterpretDream(
    dreamText: string,
    previousInterpretation: string,
    dreamContext?: IDreamContext | null
  ): Promise<Interpretation> {
    try {
      return await this.interpretationProvider.reinterpretDream(
        dreamText,
        previousInterpretation,
        dreamContext
      );
    } catch (error) {
      throw new Error(
        "Error reinterpretando el sueño: " + (error as Error).message
      );
    }
  }
}
