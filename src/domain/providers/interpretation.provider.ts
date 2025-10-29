import { IDreamContext } from "../interfaces/dream-context.interface";
import { Interpretation } from "../interfaces/interpretation-dream.interface";

export interface InterpretationProvider {
  interpretDream(
    dreamText: string,
    dreamContext?: IDreamContext | null
  ): Promise<Interpretation>;
  reinterpretDream(
    dreamText: string,
    previousInterpretation: string,
    dreamContext?: IDreamContext | null
  ): Promise<Interpretation>;
}
