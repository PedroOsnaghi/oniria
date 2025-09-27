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
        try {
            const prompt = `Analiza este sueño y proporciona:
1. Una interpretación psicológica clara en 2-3 oraciones
2. La emoción dominante que transmite el sueño

Sueño: ${dto.description}

Responde EXACTAMENTE en este formato JSON:
{
  "interpretation": "tu interpretación aquí",
  "emotion": "felicidad|tristeza|miedo|enojo"
}`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Eres un psicólogo especialista en interpretación de sueños. Debes responder SIEMPRE en formato JSON válido con 'interpretation' y 'emotion'. Las emociones válidas son: felicidad, tristeza, miedo, enojo. Proporciona interpretaciones claras y útiles en español."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 200,
                temperature: 0.3,
            });

            const responseContent = response.choices[0]?.message?.content || "{}";

            try {
                const aiResult = JSON.parse(responseContent);

                return {
                    id: crypto.randomUUID(),
                    title: dto.title,
                    description: dto.description,
                    interpretation: aiResult.interpretation || "No se pudo interpretar el sueño.",
                    emotion: aiResult.emotion || "tristeza",
                    creationDate: new Date()
                };

            } catch (parseError) {
                console.error("Error parseando JSON de OpenAI:", parseError);
                return {
                    id: crypto.randomUUID(),
                    title: dto.title,
                    description: dto.description,
                    interpretation: responseContent.trim() || "No se pudo interpretar el sueño.",
                    emotion: "tristeza",
                    creationDate: new Date()
                };
            }

        } catch (error: any) {
            console.error("Error en DreamNodeService:", error);
            throw new Error(error.message || "Error al interpretar el sueño.");
        }
    }
}