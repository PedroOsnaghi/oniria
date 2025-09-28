import { InterpretationProvider } from "../../domain/providers/interpretation.provider";
import { OpenAI } from "openai";
import { envs } from "../../config/envs";
import { Interpretation } from "../../domain/models/interpretation-dream.model";

export class InterpretationOpenAIProvider implements InterpretationProvider {
    private openai : OpenAI
    constructor() {
        this.openai = new OpenAI({
            apiKey: envs.OPENAI_API_KEY,
        });
    }

    async interpreteDream(dreamText: string): Promise<Interpretation> {
        try {
            const prompt = `Analiza este sueño y proporciona:
1. Una interpretación psicológica clara en 2-3 oraciones
2. La emoción dominante que transmite el sueño

Sueño: ${dreamText}

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
                temperature: 0.7,
            });

            const responseContent = response.choices[0]?.message?.content || "{}";

            let interpretation = "No se pudo interpretar el sueño.";
            let emotion = "Tristeza";

            try {
                const aiResult = JSON.parse(responseContent);
                interpretation = aiResult.interpretation || interpretation;
                emotion = aiResult.emotion || emotion;
                emotion = emotion.charAt(0).toUpperCase() + emotion.slice(1)
            } catch (parseError) {
                console.error("Error parseando JSON de OpenAI:", parseError);
                interpretation = responseContent.trim() || interpretation;
            }

            return new Interpretation(interpretation, emotion);
        } catch (error: any) {
            console.error("Error en InterpretationOpenIAProvider:", error);
            throw new Error(error.message || "Error al interpretar el sueño.");
        }
    }
}