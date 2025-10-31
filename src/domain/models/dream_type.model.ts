export type DreamTypeName = "Lucido" | "Pesadilla" | "Recurrente" | "Premonitorio" | "Estandar" ;

export class DreamType {
    name: DreamTypeName;
    dreamTypeDescription: string;
    constructor(name: DreamTypeName, dreamTypeDescription: string) {
        this.name = name;
        this.dreamTypeDescription = dreamTypeDescription;
    }
}