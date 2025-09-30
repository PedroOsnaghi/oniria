import { Interpretation } from '../models/interpretation-dream.model';

export interface InterpretationProvider {
    interpretDream(dreamText: string): Promise<Interpretation>;
    reinterpretDream(dreamText: string, previousInterpretation: string): Promise<Interpretation>;
}
