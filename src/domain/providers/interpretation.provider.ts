import { Interpretation } from '../models/interpretation-dream.model';

export interface InterpretationProvider {
    interpreteDream(dreamText: string): Promise<Interpretation>;
}
