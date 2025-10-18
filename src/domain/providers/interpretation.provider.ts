import { Interpretation } from "../interfaces/interpretation-dream.interface";
import { IUserContext } from "../interfaces/user.interface";

export interface InterpretationProvider {
  interpretDream(
    dreamText: string,
    userContext?: IUserContext | null
  ): Promise<Interpretation>;
  reinterpretDream(
    dreamText: string,
    previousInterpretation: string
  ): Promise<Interpretation>;
}
