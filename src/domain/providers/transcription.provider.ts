export interface TranscriptionProvider {
    transcribeAudio(filePath: string): Promise<string>;
}