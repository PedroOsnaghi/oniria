TranscripcionController
import { TranscriptionService } from "../../../../src/application/services/transcription.service";
import { TranscripcionController } from "../../../../src/infrastructure/controllers/transcription.controller";
import { Request, Response } from "express";

// Clase auxiliar para simular la entidad
class Transcripcion {
  constructor(public text: string) {}
}

describe("TranscripcionController", () => {
  let controller: TranscripcionController;
  let transcriptionService: jest.Mocked<TranscriptionService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Mock del servicio
    transcriptionService = {
      transcribeAudio: jest.fn(),
    } as unknown as jest.Mocked<TranscriptionService>;

    controller = new TranscripcionController(transcriptionService);

    // Mock de req y res
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("debe devolver 400 si no se proporciona archivo", async () => {
    delete mockReq.file;


    await controller.transcribeAudio(
      mockReq as Request,
      mockRes as Response
    );

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "No se proporcionó ningún archivo",
    });
  });

  it("debe devolver el texto transcrito correctamente", async () => {
    const fakeText = "Texto de prueba";
    mockReq.file = { path: "ruta/falsa/audio.webm" } as Express.Multer.File;

    transcriptionService.transcribeAudio.mockResolvedValue(fakeText);

    await controller.transcribeAudio(
      mockReq as Request,
      mockRes as Response
    );

    expect(transcriptionService.transcribeAudio).toHaveBeenCalledWith(
      "ruta/falsa/audio.webm"
    );
    expect(mockRes.json).toHaveBeenCalledWith({ text: fakeText });
  });

  it("debe manejar errores internos devolviendo 500", async () => {
    mockReq.file = { path: "ruta/falsa/audio.webm" } as Express.Multer.File;
    transcriptionService.transcribeAudio.mockRejectedValue(
      new Error("Falla en servicio")
    );

    await controller.transcribeAudio(
      mockReq as Request,
      mockRes as Response
    );

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Error al transcribir el audio",
    });
  });
});
