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

    async interpretDream(dreamText: string): Promise<Interpretation> {
        try {
            const prompt = `Analiza este sueño en profundidad y proporciona:
1. Un título creativo y descriptivo (3-6 palabras)
2. Una interpretación psicológica EXTENSA y DETALLADA que incluya:
   - Significado simbólico de los elementos principales
   - Posibles emociones o conflictos internos
   - Reflexión sobre el estado emocional del soñante
   - Sugerencias o insights psicológicos
   (MÍNIMO 5-6 oraciones completas y bien desarrolladas)
3. La emoción dominante que transmite el sueño

Sueño: ${dreamText}

IMPORTANTE: La interpretación debe ser SUSTANCIAL y PROFUNDA, no un resumen breve.

Responde EXACTAMENTE en este formato JSON:
{
  "title": "Título Creativo del Sueño",
  "interpretation": "tu interpretación EXTENSA y DETALLADA aquí (5-6 oraciones mínimo)",
  "emotion": "felicidad|tristeza|miedo|enojo"
}`;

            const modelUsed = envs.OPENAI_FINE_TUNED_MODEL || envs.OPENAI_MODEL || "gpt-3.5-turbo";
            console.log("[InterpretationOpenAIProvider] Modelo usado para interpretación:", modelUsed);
            const response = await this.openai.chat.completions.create({
                model: modelUsed,
                messages: [
                    {
                        role: "system",
                        content: "Eres un psicólogo especialista en interpretación de sueños con amplia experiencia. Debes responder SIEMPRE en formato JSON válido con 'title', 'interpretation' y 'emotion'. Los títulos deben ser creativos y descriptivos. Las emociones válidas son: felicidad, tristeza, miedo, enojo. CRÍTICO: Las interpretaciones deben ser EXTENSAS, PROFUNDAS y SUSTANCIALES (mínimo 5-6 oraciones completas), explorando el simbolismo, emociones subyacentes y significado psicológico en detalle. NO des respuestas breves o superficiales."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.8,
            });

            const responseContent = response.choices[0]?.message?.content || "{}";
            let title = "Interpretación de Sueño";
            let interpretation = "No se pudo interpretar el sueño.";
            let emotion = "Tristeza";

            try {
                const aiResult = JSON.parse(responseContent);
                title = aiResult.title || title;
                interpretation = aiResult.interpretation || interpretation;
                emotion = aiResult.emotion || emotion;
                emotion = emotion.charAt(0).toUpperCase() + emotion.slice(1)

            } catch (parseError) {
                console.error("Error parseando JSON de OpenAI:", parseError);
                interpretation = responseContent.trim() || interpretation;
            }

            return { title, interpretation, emotion  };
        } catch (error: any) {
            console.error("Error en InterpretationOpenIAProvider:", error);
            throw new Error(error.message || "Error al interpretar el sueño.");
        }
    }

    async reinterpretDream(dreamText: string, previousInterpretation: string): Promise<Interpretation> {
        try {
            const prompt = `IGNORA COMPLETAMENTE la interpretación anterior. Debes dar una perspectiva RADICALMENTE OPUESTA y diferente.

Sueño: ${dreamText}

INTERPRETACIÓN ANTERIOR (que debes CONTRADECIR): ${previousInterpretation}

INSTRUCCIONES ESTRICTAS:
- Si la anterior habló de aspectos POSITIVOS, enfócate en aspectos NEGATIVOS/preocupantes
- Si la anterior habló de LIBERTAD, habla de LIMITACIONES/prisiones mentales
- Si la anterior fue sobre SUPERACIÓN, habla de INSEGURIDADES/miedos
- Si la anterior fue OPTIMISTA, sé más REALISTA/pesimista
- Usa una escuela psicológica DIFERENTE (Freud vs Jung vs Gestalt vs Cognitivo)
- La emoción debe ser OPUESTA a lo que podría sugerir la anterior

Responde EXACTAMENTE en este formato JSON:
{
  "title": "Nuevo Título Que Refleje la Perspectiva Opuesta",
  "interpretation": "interpretación COMPLETAMENTE OPUESTA (2-3 oraciones)",
  "emotion": "felicidad|tristeza|miedo|enojo"
}`;

            const response = await this.openai.chat.completions.create({
                model: envs.OPENAI_FINE_TUNED_MODEL || envs.OPENAI_MODEL || "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Eres un psicólogo especialista que debe dar interpretaciones RADICALMENTE OPUESTAS a las anteriores. Tu trabajo es CONTRADECIR y ofrecer el PUNTO DE VISTA CONTRARIO. Si la interpretación anterior fue positiva, sé más crítico. Si fue sobre libertad, habla de limitaciones. NUNCA coincidas con la interpretación previa. Responde SIEMPRE en formato JSON válido con 'title', 'interpretation' y 'emotion'. Crea títulos que reflejen la nueva perspectiva. Las emociones válidas son: felicidad, tristeza, miedo, enojo."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 200,
                temperature: 1.1, // Máxima creatividad para interpretación opuesta
            });

            const responseContent = response.choices[0]?.message?.content || "{}";
            let title = "Nueva Perspectiva";
            let interpretation = "No se pudo reinterpretar el sueño.";
            let emotion = "Tristeza";

            try {
                const aiResult = JSON.parse(responseContent);
                title = aiResult.title || title;
                interpretation = aiResult.interpretation || interpretation;
                emotion = aiResult.emotion || emotion;
                emotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);

            } catch (parseError) {
                console.error("Error parseando JSON de OpenAI en reinterpretación:", parseError);
                interpretation = responseContent.trim() || interpretation;
            }

            return { title, interpretation, emotion };
        } catch (error: any) {
            console.error("Error en reinterpretación OpenAI:", error);
            throw new Error(error.message || "Error al reinterpretar el sueño.");
        }
    }
}