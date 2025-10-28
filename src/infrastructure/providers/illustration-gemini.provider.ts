import { GoogleGenAI } from "@google/genai";
import { IllustrationProvider } from "../../domain/providers/illustration.provider";
import { envs } from "../../config/envs";

export class IllustrationGeminiProvider implements IllustrationProvider {
  private ai = new GoogleGenAI({ apiKey: envs.GEMINI_API_KEY });
  constructor() {}
  async generateIllustration(dreamText: string): Promise<Buffer> {
     const prompt = `
    Dreamcore aesthetic with semi-realistic rendering, surreal and atmospheric visuals. 
    Soft lighting, misty and ethereal elements, slightly uncanny but beautiful. 
    Do NOT include any text, words, or letters in the image. 
    Interpret the following dream description abstractly and visually without using exact phrases or writing: "${dreamText}"
  `;

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        return Buffer.from(part.inlineData.data, "base64");
      }
    }

    throw new Error("No se obtuvo imagen desde Gemini");
  }
}
