import { TranscriptionProvider } from "../../domain/providers/transcription.provider";

export class TranscriptionService {
    constructor(private transcriptionProvider: TranscriptionProvider) {
        this.transcriptionProvider = transcriptionProvider;
    }

    async transcribeAudio(filePath: string): Promise<string> {
        try {
            return await this.transcriptionProvider.transcribeAudio(filePath);
        } catch (error) {
            throw new Error("Error transcribing audio: " + (error as Error).message);
        }   
    }
}
