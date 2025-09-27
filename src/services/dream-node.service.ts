import { OpenAI } from "openai";
import { envs } from "../config/envs";
import { CreateDreamNodeDto, DreamNodeResponseDto } from "../dtos/dream-node.dto";

export class DreamNodeService {
    private readonly openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: envs.OPENAI_API_KEY,
        });
    }

    async interpretDream(dto: CreateDreamNodeDto): Promise<DreamNodeResponseDto> {
        const aiResponse = await this.getAIInterpretation(dto.description);
        
        return this.buildDreamNodeResponse(dto, aiResponse);
    }

    private async getAIInterpretation(description: string): Promise<any> {
        const prompt = this.buildPrompt(description);
        const response = await this.callOpenAI(prompt);
        
        return this.parseAIResponse(response);
    }

    private buildPrompt(description: string): string {
        return `Analiza este sueño y proporciona:
1. Un título creativo y descriptivo (máximo 8 palabras)
2. Una interpretación psicológica clara en 2-3 oraciones
3. La emoción dominante que transmite el sueño

Sueño: ${description}

Responde EXACTAMENTE en este formato JSON:
{
  "title": "título creativo aquí",
  "interpretation": "tu interpretación aquí",
  "emotion": "felicidad|tristeza|miedo|enojo"
}`;
    }

    private async callOpenAI(prompt: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system", 
                        content: "Eres un psicólogo especialista en interpretación de sueños. Debes responder SIEMPRE en formato JSON válido con 'title', 'interpretation' y 'emotion'. Las emociones válidas son: felicidad, tristeza, miedo, enojo. Proporciona interpretaciones claras y títulos creativos en español."
                    },
                    {
                        role: "user", 
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.3,
            });

            return response.choices[0]?.message?.content || "{}";
        } catch (error: any) {
            console.error("Error calling OpenAI:", error);
            throw new Error("Error al conectar con el servicio de interpretación");
        }
    }

    private parseAIResponse(responseContent: string): any {
        try {
            const aiResult = JSON.parse(responseContent);
            
            return {
                title: aiResult.title || "Sueño sin título",
                interpretation: aiResult.interpretation || "No se pudo interpretar el sueño.",
                emotion: this.validateEmotion(aiResult.emotion)
            };
            
        } catch (parseError) {
            console.error("Error parsing OpenAI JSON:", parseError);
            return this.getDefaultInterpretation(responseContent);
        }
    }

    private validateEmotion(emotion: string): string {
        const validEmotions = ['felicidad', 'tristeza', 'miedo', 'enojo'];
        return validEmotions.includes(emotion) ? emotion : 'tristeza';
    }

    private getDefaultInterpretation(rawContent: string): any {
        return {
            title: "Sueño misterioso",
            interpretation: rawContent.trim() || "No se pudo interpretar el sueño.",
            emotion: "tristeza"
        };
    }

    private buildDreamNodeResponse(dto: CreateDreamNodeDto, aiResult: any): DreamNodeResponseDto {
        return {
            id: crypto.randomUUID(),
            title: aiResult.title,
            description: dto.description,
            interpretation: aiResult.interpretation,
            emotion: aiResult.emotion,
            creationDate: new Date()
        };
    }
}