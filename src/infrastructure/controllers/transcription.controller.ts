import { Request, Response } from "express";
import { Transcripcion } from "../../domain/models/transcription-audio";
import { TranscriptionService } from "../../application/services/transcription.service";


export class TranscripcionController {
  constructor(
    private readonly transcriptionAudio: TranscriptionService
  ) { }
  async transcribeAudio(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No se proporcionó ningún archivo" });
        return;
      }

      const texto = await this.transcriptionAudio.transcribeAudio(file.path);
      const transcripcion = new Transcripcion(texto);

      res.json({ texto: transcripcion.texto });
    } catch (error) {
      console.error("Error en controlador:", error);
      res.status(500).json({ error: "Error al transcribir el audio" });
    }
  }
}
