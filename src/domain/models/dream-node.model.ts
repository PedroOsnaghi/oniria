
import { DreamTypeName } from "./dream_type.model";
export type DreamPrivacy = "Publico" | "Privado" | "Anonimo";
export type DreamState = "Activo" | "Archivado";
export type Emotion = "Felicidad" | "Tristeza" | "Miedo" | "Enojo";

export interface IDreamNode {
  id?: string;
  creationDate: Date;
  title: string;
  dream_description: string;
  interpretation: string;
  imageUrl?: string | undefined;
  privacy: DreamPrivacy;
  state: DreamState;
  emotion: Emotion;
  type: DreamTypeName;
  typeReason: string;
}

export class DreamNode implements IDreamNode {
  creationDate: Date;
  title: string;
  dream_description: string;
  interpretation: string;
  imageUrl?: string;
  privacy: DreamPrivacy;
  state: DreamState;
  emotion: Emotion;
  type: DreamTypeName;
  typeReason: string;
  constructor(
    creationDate: Date,
    title: string,
    description: string,
    interpretation: string,
    privacy: DreamPrivacy,
    state: DreamState,
    emotion: Emotion,
    type: DreamTypeName,
    typeReason: string,
    imageUrl?: string,
  ) {
    this.creationDate = creationDate;
    this.title = title;
    this.dream_description = description;
    this.interpretation = interpretation;
    this.imageUrl = imageUrl ?? "";
    this.privacy = privacy;
    this.state = state;
    this.emotion = emotion;
    this.type = type;
    this.typeReason = typeReason;
  }
}
