import OpenAI from "openai";
import { envs } from "../config/envs";

export class SuenoService {
    private openai: OpenAI;

    constructor() {
        if (!envs.OPENAI_API_KEY) {
            throw new Error("No se encontró la API Key de OpenAI en envs.ts");
        }

        this.openai = new OpenAI({ apiKey: envs.OPENAI_API_KEY });
    }

    async interpretar(descripcion: string): Promise<string> {
        try {
            //Prompt para la IA 
            const prompt = `Interpreta este sueño dando el significado psicológico y qué puede representar en la vida del soñador.

Sueño: ${descripcion}

Interpretación:`;

            console.log("=== DEBUG SERVICIO ===");
            console.log("Prompt enviado:", prompt);
            console.log("Max tokens:", 80);
            console.log("Temperature:", 0.3);
            console.log("====================");

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system", 
                        content: "Eres un psicólogo especialista en interpretación de sueños. Proporciona interpretaciones claras y útiles en 2-3 oraciones. Explica qué simboliza el sueño y qué puede estar reflejando de la vida emocional o psicológica del soñador. NO narres el sueño, NO inventes detalles. Solo interpreta el significado."
                    },
                    {
                        role: "user", 
                        content: prompt
                    }
                ],
                max_tokens: 80, // Espacio para 2-3 oraciones completas
                temperature: 0.3, // Variacion para respuestas naturales
                stop: ["\n\n", "En resumen", "Finalmente"], // No da textos largos
            });

            console.log("=== DEBUG RESPUESTA ===");
            console.log("Respuesta completa de OpenAI:", JSON.stringify(response, null, 2));
            console.log("=======================");

            let interpretacion = response.choices[0]?.message?.content || "No se pudo interpretar el sueño.";
            
            console.log("Interpretación extraída:", interpretacion);
            console.log("Longitud:", interpretacion.length);
            
            // Limpiar saltos de línea
            interpretacion = interpretacion.replace(/\s+/g, " ").trim();

            return interpretacion;

        } catch (error: any) {
            console.error("Error en SuenoService:", error);
            throw new Error(error.message || "Fallo interpretando el sueño.");
        }
    }
}

export default SuenoService;
