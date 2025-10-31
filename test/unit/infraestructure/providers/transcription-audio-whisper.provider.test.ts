import fs from "fs";
import OpenAI from "openai";
import { TranscriptionWhisperProvider } from "../../../../src/infrastructure/providers/transcription-whisper.provider";

jest.mock("fs");
jest.mock("openai");

describe("TranscriptionWhisperProvider", () => {
  let provider: TranscriptionWhisperProvider;
  let mockOpenAIInstance: any;

  beforeEach(() => {
    mockOpenAIInstance = {
      audio: {
        transcriptions: {
          create: jest.fn(),
        },
      },
    };
    (OpenAI as unknown as jest.Mock).mockImplementation(() => mockOpenAIInstance);
    provider = new TranscriptionWhisperProvider();
  });

  it("debe transcribir el audio correctamente", async () => {
    const fakePath = "ruta/falsa/audio.webm";
    const fakeText = "Texto transcrito de ejemplo";

    (fs.createReadStream as jest.Mock).mockReturnValue("stream simulado");
    mockOpenAIInstance.audio.transcriptions.create.mockResolvedValue({
      text: fakeText,
    });

    const result = await provider.transcribeAudio(fakePath);

    expect(fs.createReadStream).toHaveBeenCalledWith(fakePath);
    expect(mockOpenAIInstance.audio.transcriptions.create).toHaveBeenCalledWith({
      file: "stream simulado",
      model: "whisper-1",
      language: "es",
    });
    expect(fs.unlinkSync).toHaveBeenCalledWith(fakePath);
    expect(result).toBe(fakeText);
  });

  it("debe lanzar un error si ocurre una excepción", async () => {
    const fakePath = "ruta/falsa/audio.webm";

    (fs.createReadStream as jest.Mock).mockImplementation(() => {
      throw new Error("Error de lectura");
    });

    await expect(provider.transcribeAudio(fakePath)).rejects.toThrow(
      "Error al transcribir el audio"
    );
  });
});
