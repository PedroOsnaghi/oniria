import { Request, Response } from "express";
import { SuenoService } from "../services/sueno.service";

export class SuenoController {
    constructor(private readonly suenoService: SuenoService) {}

    async interpretar(req: Request, res: Response) {
        try {
            const { descripcion } = req.body;

            if (!descripcion || descripcion.trim() === "") {
                return res.status(400).json({ error: "Debe enviar la descripción del sueño." });
            }

            const interpretacion = await this.suenoService.interpretar(descripcion);
            res.json({ interpretacion });

        } catch (error: any) {
            console.error("Error en SuenoController:", error);
            res.status(500).json({ error: error.message || "Error interpretando el sueño" });
        }
    }
}
