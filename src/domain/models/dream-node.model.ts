export type DreamPrivacy = "Publico" | "Privado" | "Anonimo";
export type DreamState = "Activo" | "Archivado";
export type Emotion = "Felicidad" | "Tristeza" | "Miedo" | "Enojo";

export interface IDreamNode {
    id?: string;
    creationDate: Date;
    title: string;
    dream_description: string;
    interpretation: string;
    dream_privacy : DreamPrivacy;
    dream_state : DreamState;
    dream_emotion : Emotion;
}

export class DreamNode implements IDreamNode {
    creationDate: Date;
    title: string;
    dream_description: string;
    interpretation: string;
    dream_privacy: DreamPrivacy;
    dream_state: DreamState;
    dream_emotion: Emotion;
    constructor(creationDate: Date, title: string, description: string, interpretation: string, privacy: DreamPrivacy, state: DreamState, emotion: Emotion) {
        this.creationDate = creationDate;
        this.title = title;
        this.dream_description = description;
        this.interpretation = interpretation;
        this.dream_privacy = privacy;
        this.dream_state = state;
        this.dream_emotion = emotion;
    }

}
