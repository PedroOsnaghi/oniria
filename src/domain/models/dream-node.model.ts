export type DreamPrivacy = "Publico" | "Privado" | "Anonimo";
export type DreamState = "Activo" | "Archivado";
export type Emotion = "Felicidad" | "Tristeza" | "Miedo" | "Enojo";

export interface IDreamNode {
    id: string;
    creationDate: Date;
    title: string;
    description: string;
    interpretation: string;
    privacy : DreamPrivacy;
    state : DreamState;
    emotion : Emotion;
}

