import { TranscriptionProvider } from "../../domain/providers/transcription.provider";
import fs from "fs";
import OpenAI from "openai";

export class TranscriptionWhisperProvider implements TranscriptionProvider {
    private openai: OpenAI;
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    async transcribeAudio(filePath: string): Promise<string> {
        try {
            const fileStream = fs.createReadStream(filePath);
            const response = await this.openai.audio.transcriptions.create({
                file: fileStream,
                model: "whisper-1",
                language: "es",
            });
            fs.unlinkSync(filePath);
            return response.text;
        } catch (error) {
            console.error("Error en TranscriptionWhisperProvicer:", error);
            throw new Error("Error al transcribir el audio");
        }
    }
}