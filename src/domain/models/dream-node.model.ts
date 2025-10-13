export type DreamPrivacy = "Publico" | "Privado" | "Anonimo";
export type DreamState = "Activo" | "Archivado";
export type Emotion = "Felicidad" | "Tristeza" | "Miedo" | "Enojo";

export interface IDreamNode {
    id?: string;
    creationDate: Date;
    title: string;
    description: string;
    interpretation: string;
    privacy : DreamPrivacy;
    state : DreamState;
    emotion : Emotion;
}

export class DreamNode implements IDreamNode {
    creationDate: Date;
    title: string;
    description: string;
    interpretation: string;
    privacy: DreamPrivacy;
    state: DreamState;
    emotion: Emotion;
    constructor(creationDate: Date, title: string, description: string, interpretation: string, privacy: DreamPrivacy, state: DreamState, emotion: Emotion) {
        this.creationDate = creationDate;
        this.title = title;
        this.description = description;
        this.interpretation = interpretation;
        this.privacy = privacy;
        this.state = state;
        this.emotion = emotion;
    }

}
