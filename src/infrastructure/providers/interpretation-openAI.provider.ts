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

    private sanitizeText(text: string): string {
        if (!text) return text;

        const noHtml = text.replace(/<[^>]*>/g, ' ');
        return noHtml.replace(/\s+/g, ' ').trim();
    }

    private limitSentences(text: string, max: number): string {
        const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
        if (parts.length <= max) return text.trim();
        return parts.slice(0, max).join(' ').trim();
    }

    async interpretDream(dreamText: string): Promise<Interpretation> {
        try {
            const prompt = `Analiza este sueño y proporciona:
1. Un título creativo y descriptivo (3-6 palabras)
2. Una interpretación psicológica concisa pero profunda que incluya:
   - Significado simbólico de los elementos principales
   - Posibles emociones o conflictos internos
   - Reflexión sobre el estado emocional del soñante
   (3-4 oraciones completas y sustanciales)
3. La emoción dominante que transmite el sueño

Sueño: ${dreamText}

IMPORTANTE: Sé conciso pero profundo. Evita repeticiones innecesarias.

Responde EXACTAMENTE en este formato JSON:
{
  "title": "Título Creativo del Sueño",
  "interpretation": "tu interpretación clara y profunda (3-4 oraciones)",
  "emotion": "felicidad|tristeza|miedo|enojo"
}`;

            const modelUsed = envs.OPENAI_FINE_TUNED_MODEL || envs.OPENAI_MODEL || "gpt-3.5-turbo";
            console.log("[InterpretationOpenAIProvider] Modelo usado para interpretación:", modelUsed);
            const response = await this.openai.chat.completions.create({
                model: modelUsed,
                messages: [
                    {
                        role: "system",
                        content: "Eres un psicólogo especialista en interpretación de sueños con amplia experiencia. Debes responder SIEMPRE en formato JSON válido con 'title', 'interpretation' y 'emotion', sin envoltorios, sin markdown y sin etiquetas HTML. Los títulos deben ser creativos y descriptivos. Las emociones válidas son: felicidad, tristeza, miedo, enojo. CRÍTICO: Las interpretaciones deben ser concisas pero profundas (3-4 oraciones completas), explorando el simbolismo y las emociones subyacentes. Sé directo y evita relleno innecesario."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 350,
                temperature: 0.8,
                response_format: { type: 'json_object' } as any,
            });

            const responseContent = response.choices[0]?.message?.content || "{}";
            let title = "Interpretación de Sueño";
            let interpretation = "No se pudo interpretar el sueño.";
            let emotion = "Tristeza";

            try {
                const aiResult = JSON.parse(responseContent);
                title = this.sanitizeText(aiResult.title || title);
                interpretation = this.sanitizeText(aiResult.interpretation || interpretation);
                interpretation = this.limitSentences(interpretation, 4);
                emotion = (aiResult.emotion || emotion || '').toString().toLowerCase();
                const allowed = new Set(['felicidad','tristeza','miedo','enojo']);
                if (!allowed.has(emotion)) emotion = 'tristeza';
                emotion = emotion.charAt(0).toUpperCase() + emotion.slice(1)

            } catch (parseError) {
                console.error("Error parseando JSON de OpenAI:", parseError);
                const cleaned = this.sanitizeText(responseContent.trim());
                interpretation = this.limitSentences(cleaned || interpretation, 4);
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
- Sé conciso pero profundo (3-4 oraciones sustanciales)

Responde EXACTAMENTE en este formato JSON:
{
  "title": "Nuevo Título Que Refleje la Perspectiva Opuesta",
  "interpretation": "interpretación COMPLETAMENTE OPUESTA (3-4 oraciones)",
  "emotion": "felicidad|tristeza|miedo|enojo"
}`;

            const modelUsed = envs.OPENAI_FINE_TUNED_MODEL || envs.OPENAI_MODEL || "gpt-3.5-turbo";
            console.log("[InterpretationOpenAIProvider] Modelo usado para reinterpretación:", modelUsed);
            const response = await this.openai.chat.completions.create({
                model: modelUsed,
                messages: [
                    {
                        role: "system",
                        content: "Eres un psicólogo especialista que debe dar interpretaciones RADICALMENTE OPUESTAS a las anteriores. Tu trabajo es CONTRADECIR y ofrecer el PUNTO DE VISTA CONTRARIO. Si la interpretación anterior fue positiva, sé más crítico. Si fue sobre libertad, habla de limitaciones. NUNCA coincidas con la interpretación previa. Responde SIEMPRE en formato JSON válido con 'title', 'interpretation' y 'emotion', sin markdown y sin etiquetas HTML. Crea títulos que reflejen la nueva perspectiva. Las emociones válidas son: felicidad, tristeza, miedo, enojo. Las interpretaciones deben ser concisas pero profundas (3-4 oraciones), explorando la perspectiva opuesta."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 350,
                temperature: 0.9,
                response_format: { type: 'json_object' } as any,
            });

            const responseContent = response.choices[0]?.message?.content || "{}";
            let title = "Nueva Perspectiva";
            let interpretation = "No se pudo reinterpretar el sueño.";
            let emotion = "Tristeza";

            try {
                const aiResult = JSON.parse(responseContent);
                title = this.sanitizeText(aiResult.title || title);
                interpretation = this.sanitizeText(aiResult.interpretation || interpretation);
                interpretation = this.limitSentences(interpretation, 4);
                emotion = (aiResult.emotion || emotion || '').toString().toLowerCase();
                const allowed = new Set(['felicidad','tristeza','miedo','enojo']);
                if (!allowed.has(emotion)) emotion = 'tristeza';
                emotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);

            } catch (parseError) {
                console.error("Error parseando JSON de OpenAI en reinterpretación:", parseError);
                const cleaned = this.sanitizeText(responseContent.trim());
                interpretation = this.limitSentences(cleaned || interpretation, 4);
            }

            return { title, interpretation, emotion };
        } catch (error: any) {
            console.error("Error en reinterpretación OpenAI:", error);
            throw new Error(error.message || "Error al reinterpretar el sueño.");
        }
    }
}