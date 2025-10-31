export type DreamTypeName = "Lucido" | "Pesadilla" | "Recurrente" | "Premonitorio" | "Estandar" ;

export class DreamType {
    name: DreamTypeName;
    dreamTypeReason: string;
    constructor(name: DreamTypeName, dreamTypeReason: string) {
        this.name = name;
        this.dreamTypeReason = dreamTypeReason;
    }
}