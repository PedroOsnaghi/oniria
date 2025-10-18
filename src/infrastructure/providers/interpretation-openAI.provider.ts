import { InterpretationProvider } from "../../domain/providers/interpretation.provider";
import { OpenAI } from "openai";
import { envs } from "../../config/envs";
import { Interpretation } from "../../domain/interfaces/interpretation-dream.interface";
import { IUserContext } from "../../domain/interfaces/user.interface";

export class InterpretationOpenAIProvider implements InterpretationProvider {
  private openai: OpenAI;
  constructor() {
    this.openai = new OpenAI({
      apiKey: envs.OPENAI_API_KEY,
    });
  }

  async interpretDream(
    dreamText: string,
    userContext?: IUserContext | null
  ): Promise<Interpretation> {
    try {
      const contextSection = this.buildContextSection(userContext);

      const prompt = `${contextSection}Analiza este sueño y proporciona:
1. Un título creativo y descriptivo (3-6 palabras)
2. Una interpretación psicológica clara en 2-3 oraciones
3. La emoción dominante que transmite el sueño
4. Temas principales mencionados (máximo 3)
5. Personas mencionadas (si las hay)
6. Ubicaciones mencionadas (si las hay)
7. Emociones contextuales presentes (máximo 3)

Sueño: ${dreamText}

Responde EXACTAMENTE en este formato JSON:
{
  "title": "Título Creativo del Sueño",
  "interpretation": "tu interpretación aquí",
  "emotion": "felicidad|tristeza|miedo|enojo",
  "themes": ["tema1", "tema2"],
  "people": ["persona1"],
  "locations": ["ubicación1"],
  "emotions_context": ["emoción1", "emoción2"]
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres un psicólogo especialista en interpretación de sueños. Debes responder SIEMPRE en formato JSON válido. Los títulos deben ser creativos y descriptivos. Las emociones válidas son: felicidad, tristeza, miedo, enojo. Proporciona interpretaciones claras y útiles en español.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const responseContent = response.choices[0]?.message?.content || "{}";

      const aiResult = JSON.parse(responseContent);

      return {
        title: aiResult.title || "Interpretación de Sueño",
        interpretation:
          aiResult.interpretation || "No se pudo interpretar el sueño.",
        emotion: this.normalizeEmotion(aiResult.emotion),
        themes: aiResult.themes || [],
        people: aiResult.people || [],
        locations: aiResult.locations || [],
        emotions_context: aiResult.emotions_context || [],
      };
    } catch (error: any) {
      console.error("Error en InterpretationOpenIAProvider:", error);
      throw new Error(error.message || "Error al interpretar el sueño.");
    }
  }

  private buildContextSection(userContext?: IUserContext | null): string {
    if (!userContext) {
      return "";
    }

    const hasContext =
      userContext.themes.length > 0 ||
      userContext.people.length > 0 ||
      userContext.emotions.length > 0 ||
      userContext.locations.length > 0;

    if (!hasContext) {
      return "";
    }

    let contextText = "CONTEXTO DEL USUARIO (de sueños anteriores):\n";

    if (userContext.themes.length > 0) {
      const themesList = userContext.themes
        .map((t) => `"${t.label}" (${t.count} veces)`)
        .join(", ");
      contextText += `- Temas recurrentes: ${themesList}\n`;
    }

    if (userContext.people.length > 0) {
      const peopleList = userContext.people
        .map((p) => `"${p.label}" (${p.count} veces)`)
        .join(", ");
      contextText += `- Personas importantes: ${peopleList}\n`;
    }

    if (userContext.emotions.length > 0) {
      const emotionsList = userContext.emotions
        .map((e) => `"${e.label}" (${e.count} veces)`)
        .join(", ");
      contextText += `- Emociones frecuentes: ${emotionsList}\n`;
    }

    if (userContext.locations.length > 0) {
      const locationsList = userContext.locations
        .map((l) => `"${l.label}" (${l.count} veces)`)
        .join(", ");
      contextText += `- Lugares significativos: ${locationsList}\n`;
    }

    contextText +=
      "\nConsidera estos patrones al interpretar el nuevo sueño.\n\n";
    return contextText;
  }

  private normalizeEmotion(emotion: string): string {
    const normalized = emotion?.toLowerCase() || "tristeza";

    const emotionMap: Record<string, string> = {
      felicidad: "Felicidad",
      alegría: "Felicidad",
      joy: "Felicidad",
      happiness: "Felicidad",
      contento: "Felicidad",

      tristeza: "Tristeza",
      sadness: "Tristeza",
      melancolía: "Tristeza",
      pena: "Tristeza",

      miedo: "Miedo",
      fear: "Miedo",
      terror: "Miedo",
      ansiedad: "Miedo",
      pánico: "Miedo",

      enojo: "Enojo",
      ira: "Enojo",
      anger: "Enojo",
      rabia: "Enojo",
      furia: "Enojo",
    };

    return emotionMap[normalized] || "Tristeza";
  }

  async reinterpretDream(
    dreamText: string,
    previousInterpretation: string
  ): Promise<Interpretation> {
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
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres un psicólogo especialista que debe dar interpretaciones RADICALMENTE OPUESTAS a las anteriores. Tu trabajo es CONTRADECIR y ofrecer el PUNTO DE VISTA CONTRARIO. Si la interpretación anterior fue positiva, sé más crítico. Si fue sobre libertad, habla de limitaciones. NUNCA coincidas con la interpretación previa. Responde SIEMPRE en formato JSON válido con 'title', 'interpretation' y 'emotion'. Crea títulos que reflejen la nueva perspectiva. Las emociones válidas son: felicidad, tristeza, miedo, enojo.",
          },
          {
            role: "user",
            content: prompt,
          },
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
        console.error(
          "Error parseando JSON de OpenAI en reinterpretación:",
          parseError
        );
        interpretation = responseContent.trim() || interpretation;
      }

      return { title, interpretation, emotion };
    } catch (error: any) {
      console.error("Error en reinterpretación OpenAI:", error);
      throw new Error(error.message || "Error al reinterpretar el sueño.");
    }
  }
}
