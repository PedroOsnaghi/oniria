import { TranscriptionService } from "../../../../src/application/services/transcription.service";
import { TranscriptionProvider } from "../../../../src/domain/providers/transcription.provider";

describe("TranscriptionService", () => {
  let transcriptionService: TranscriptionService;
  let mockProvider: jest.Mocked<TranscriptionProvider>;

  beforeEach(() => {
    mockProvider = {
      transcribeAudio: jest.fn(),
    } as unknown as jest.Mocked<TranscriptionProvider>;

    transcriptionService = new TranscriptionService(mockProvider);
  });

  it("debe retornar el texto transcrito correctamente", async () => {
    const fakeFilePath = "ruta/falsa/audio.webm";
    const fakeText = "Texto transcrito";
    mockProvider.transcribeAudio.mockResolvedValue(fakeText);

    const result = await transcriptionService.transcribeAudio(fakeFilePath);

    expect(mockProvider.transcribeAudio).toHaveBeenCalledWith(fakeFilePath);
    expect(result).toBe(fakeText);
  });

  it("debe lanzar un error con mensaje personalizado si el proveedor falla", async () => {
    const fakeFilePath = "ruta/falsa/audio.webm";
    mockProvider.transcribeAudio.mockRejectedValue(
      new Error("Fallo del proveedor")
    );

    await expect(
      transcriptionService.transcribeAudio(fakeFilePath)
    ).rejects.toThrow("Error transcribing audio: Fallo del proveedor");
  });
});
