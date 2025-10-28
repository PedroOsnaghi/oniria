export interface IllustrationProvider {
    generateIllustration(dreamText: string): Promise<Buffer>;
}