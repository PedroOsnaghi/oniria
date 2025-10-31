/* eslint-disable @typescript-eslint/no-require-imports */
import { InterpretationOpenAIProvider } from "../../../../src/infrastructure/providers/interpretation-openAI.provider";
import { OpenAI } from "openai";

// Mock de OpenAI
jest.mock("openai");
const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

// Mock de envs
jest.mock("../../../../src/config/envs", () => ({
  envs: {
    OPENAI_API_KEY: "test-api-key",
  },
}));

describe("InterpretationOpenAIProvider", () => {
  let provider: InterpretationOpenAIProvider;
  let mockOpenAI: jest.Mocked<OpenAI>;
  let mockChatCompletions: jest.Mock;

  beforeEach(() => {
    // Reset todos los mocks
    jest.clearAllMocks();

    // Mock del método chat.completions.create
    mockChatCompletions = jest.fn();

    // Mock de la instancia de OpenAI
    mockOpenAI = {
      chat: {
        completions: {
          create: mockChatCompletions,
        },
      },
    } as any;

    // Mock del constructor de OpenAI
    MockedOpenAI.mockImplementation(() => mockOpenAI);

    provider = new InterpretationOpenAIProvider();
  });

  describe("constructor", () => {
    it("should initialize OpenAI with correct API key", () => {
      expect(MockedOpenAI).toHaveBeenCalledWith({
        apiKey: "test-api-key",
      });
    });
  });

  describe("interpretDream", () => {
    const dreamText = "Soñé que volaba sobre montañas";

    it("should interpret dream successfully with valid JSON response", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Vuelo sobre montañas",
                interpretation:
                  "Este sueño representa tu deseo de libertad y superación personal.",
                emotion: "felicidad",
                context: {
                  emotions_context: [],
                  people: [],
                  locations: [],
                  themes: [],
                },
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: "Vuelo sobre montañas",
        interpretation:
          "Este sueño representa tu deseo de libertad y superación personal.",
        emotion: "Felicidad",
        dreamType: "Estandar",
        dreamTypeReason: "",
        context: {
          emotions_context: [],
          people: [],
          locations: [],
          themes: [],
        },
      });

      expect(mockChatCompletions).toHaveBeenCalledWith({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: expect.stringContaining(
              "Eres un psicólogo especialista en interpretación de sueños"
            ),
          },
          {
            role: "user",
            content: expect.stringContaining(dreamText),
          },
        ],
        max_tokens: 350,
        temperature: 0.8,
        response_format: { type: "json_object" },
      });
    });

    it("should handle invalid JSON response gracefully", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Interpretación de Sueño",
                interpretation: "Invalid JSON response from OpenAI",
                emotion: "Tristeza",
                context: {
                  emotions_context: [],
                  people: [],
                  locations: [],
                  themes: [],
                },
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: "Interpretación de Sueño",
        interpretation: "Invalid JSON response from OpenAI",
        emotion: "Tristeza",
        dreamType: "Estandar",
        dreamTypeReason: "",
        context: {
          emotions_context: [],
          people: [],
          locations: [],
          themes: [],
        }
      });
    });

    it("should handle empty response gracefully", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: "",
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: "Interpretación de Sueño",
        interpretation: "No se pudo interpretar el sueño.",
        emotion: "Tristeza",
        dreamType: "Estandar",
        dreamTypeReason: "",
        context: {
          emotions_context: [],
          people: [],
          locations: [],
          themes: [],
        },
      });
    });

    it("should handle missing choices in response", async () => {
      // Arrange
      const mockResponse = { choices: [] };
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: "Interpretación de Sueño",
        interpretation: "No se pudo interpretar el sueño.",
        context: {
          emotions_context: [],
          people: [],
          locations: [],
          themes: [],
        },
        emotion: "Tristeza",
        dreamType: "Estandar",
        dreamTypeReason: "",
      });
    });

    it("should capitalize emotion correctly", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Test Title",
                interpretation: "Test interpretation",
                emotion: "miedo",
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result.emotion).toBe("Miedo");
    });

    it("should handle partial JSON response", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Partial Response",
                // Missing interpretation and emotion
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: "Partial Response",
        interpretation: "No se pudo interpretar el sueño.",
        emotion: "Tristeza",
        dreamType: "Estandar",
        dreamTypeReason: "",
        context: {
          emotions_context: [],
          people: [],
          locations: [],
          themes: [],
        },
      });
    });

    it("should throw error when OpenAI API fails", async () => {
      // Arrange
      const apiError = new Error("OpenAI API Error");
      mockChatCompletions.mockRejectedValue(apiError);

      // Act & Assert
      await expect(provider.interpretDream(dreamText)).rejects.toThrow(
        "OpenAI API Error"
      );
    });

    it("should handle OpenAI API error without message", async () => {
      // Arrange
      mockChatCompletions.mockRejectedValue(new Error());

      // Act & Assert
      await expect(provider.interpretDream(dreamText)).rejects.toThrow(
        "Error al interpretar el sueño."
      );
    });
  });

  describe("reinterpretDream", () => {
    const dreamText = "Soñé que volaba sobre montañas";
    const previousInterpretation = "Este sueño representa libertad y éxito.";

    it("should reinterpret dream successfully with valid JSON response", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Miedo a las alturas",
                interpretation:
                  "Este sueño puede reflejar ansiedad y miedo al fracaso.",
                emotion: "miedo",
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.reinterpretDream(
        dreamText,
        previousInterpretation
      );

      // Assert
      expect(result).toEqual({
        title: "Miedo a las alturas",
        interpretation:
          "Este sueño puede reflejar ansiedad y miedo al fracaso.",
        context: {
          emotions_context: [],
          people: [],
          locations: [],
          themes: [],
        },
        emotion: "Miedo",
        dreamType: "Estandar",
        dreamTypeReason: "",
      });

      expect(mockChatCompletions).toHaveBeenCalledWith({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: expect.stringContaining("RADICALMENTE OPUESTAS"),
          },
          {
            role: "user",
            content: expect.stringContaining(
              "IGNORA COMPLETAMENTE la interpretación anterior"
            ),
          },
        ],
        max_tokens: 350,
        temperature: 0.9,
        response_format: { type: "json_object" },
      });
    });

    it("should include previous interpretation in prompt", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "New Title",
                interpretation: "New interpretation",
                emotion: "tristeza",
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      const callArgs = mockChatCompletions.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === "user");

      expect(userMessage.content).toContain(dreamText);
      expect(userMessage.content).toContain(previousInterpretation);
    });

    it("should use high temperature for creative reinterpretation", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Creative Title",
                interpretation: "Creative interpretation",
                emotion: "enojo",
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      expect(mockChatCompletions).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.9,
        })
      );
    });

    it("should handle invalid JSON in reinterpretation", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Invalid JSON for reinterpretation",
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.reinterpretDream(
        dreamText,
        previousInterpretation
      );

      // Assert
      expect(result).toEqual({
        title: "Nueva Perspectiva",
        interpretation: "Invalid JSON for reinterpretation",
        emotion: "Tristeza",
        dreamType: "Estandar",
        dreamTypeReason: "",
        context: {
          emotions_context: [],
          people: [],
          locations: [],
          themes: [],
        },
      });
    });

    it("should throw error when reinterpretation API fails", async () => {
      // Arrange
      const apiError = new Error("Reinterpretation API Error");
      mockChatCompletions.mockRejectedValue(apiError);

      // Act & Assert
      await expect(
        provider.reinterpretDream(dreamText, previousInterpretation)
      ).rejects.toThrow("Reinterpretation API Error");
    });

    it("should handle reinterpretation error without message", async () => {
      // Arrange
      mockChatCompletions.mockRejectedValue({});

      // Act & Assert
      await expect(
        provider.reinterpretDream(dreamText, previousInterpretation)
      ).rejects.toThrow("Error al reinterpretar el sueño.");
    });

    it("should capitalize emotion in reinterpretation", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Test Title",
                interpretation: "Test interpretation",
                emotion: "enojo",
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.reinterpretDream(
        dreamText,
        previousInterpretation
      );

      // Assert
      expect(result.emotion).toBe("Enojo");
    });
  });

  describe("edge cases", () => {
    it("should handle null response content", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream("test dream");

      // Assert
      expect(result).toEqual({
        title: "Interpretación de Sueño",
        interpretation: "No se pudo interpretar el sueño.",
        emotion: "Tristeza",
        dreamType: "Estandar",
        dreamTypeReason: "",
        context: {
          emotions_context: [],
          people: [],
          locations: [],
          themes: [],
        },
      });
    });

    it("should handle undefined response content", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {},
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream("test dream");

      // Assert
      expect(result).toEqual({
        title: "Interpretación de Sueño",
        interpretation: "No se pudo interpretar el sueño.",
        emotion: "Tristeza",
        dreamType: "Estandar",
        dreamTypeReason: "",
        context: {
          emotions_context: [],
          people: [],
          locations: [],
          themes: [],
        },
      });
    });
  });

  describe("fine-tuning model support", () => {
    const dreamText = "Soñé que volaba sobre el mar";
    const previousInterpretation = "Representa libertad";

    it("should use fine-tuned model when OPENAI_FINE_TUNED_MODEL is set in constructor", async () => {
      // Arrange
      const fineTunedModel = "ft:gpt-3.5-turbo-0125:personal::ABC123";

      // Mock envs con modelo fine-tuned
      const originalEnvs = require("../../../../src/config/envs").envs;
      Object.defineProperty(require("../../../../src/config/envs"), "envs", {
        get: () => ({
          ...originalEnvs,
          OPENAI_FINE_TUNED_MODEL: fineTunedModel,
        }),
        configurable: true,
      });

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Vuelo sobre el Mar",
                interpretation:
                  "Este sueño simboliza tu búsqueda de libertad emocional.",
                emotion: "felicidad",
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      await provider.interpretDream(dreamText);

      // Assert
      expect(mockChatCompletions).toHaveBeenCalledWith(
        expect.objectContaining({
          model: fineTunedModel,
        })
      );

      // Restore
      Object.defineProperty(require("../../../../src/config/envs"), "envs", {
        get: () => originalEnvs,
        configurable: true,
      });
    });

    it("should fall back to OPENAI_MODEL when OPENAI_FINE_TUNED_MODEL is not set", async () => {
      // Arrange
      const baseModel = "gpt-4";

      const originalEnvs = require("../../../../src/config/envs").envs;
      Object.defineProperty(require("../../../../src/config/envs"), "envs", {
        get: () => ({
          ...originalEnvs,
          OPENAI_MODEL: baseModel,
          OPENAI_FINE_TUNED_MODEL: undefined,
        }),
        configurable: true,
      });

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Test Title",
                interpretation: "Test interpretation",
                emotion: "felicidad",
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      await provider.interpretDream(dreamText);

      // Assert
      expect(mockChatCompletions).toHaveBeenCalledWith(
        expect.objectContaining({
          model: baseModel,
        })
      );

      // Restore
      Object.defineProperty(require("../../../../src/config/envs"), "envs", {
        get: () => originalEnvs,
        configurable: true,
      });
    });

    it("should use default model when no env vars are set", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Test Title",
                interpretation: "Test interpretation",
                emotion: "felicidad",
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      await provider.interpretDream(dreamText);

      // Assert - Should use gpt-3.5-turbo by default
      expect(mockChatCompletions).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-3.5-turbo",
        })
      );
    });

    it("should use fine-tuned model for reinterpretation when set", async () => {
      // Arrange
      const fineTunedModel = "ft:gpt-3.5-turbo-0125:personal::ABC123";

      const originalEnvs = require("../../../../src/config/envs").envs;
      Object.defineProperty(require("../../../../src/config/envs"), "envs", {
        get: () => ({
          ...originalEnvs,
          OPENAI_FINE_TUNED_MODEL: fineTunedModel,
        }),
        configurable: true,
      });

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Perspectiva Opuesta",
                interpretation:
                  "Desde otro ángulo, este sueño refleja temores.",
                emotion: "miedo",
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      expect(mockChatCompletions).toHaveBeenCalledWith(
        expect.objectContaining({
          model: fineTunedModel,
        })
      );

      // Restore
      Object.defineProperty(require("../../../../src/config/envs"), "envs", {
        get: () => originalEnvs,
        configurable: true,
      });
    });

    it("should log the model being used for interpretation", async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Test",
                interpretation: "Test",
                emotion: "felicidad",
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      await provider.interpretDream(dreamText);

      // Assert - Should log the model (default gpt-3.5-turbo in this case)
      expect(consoleSpy).toHaveBeenCalledWith(
        "[InterpretationOpenAIProvider] Modelo usado para interpretación:",
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it("should log the model being used for reinterpretation", async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Test",
                interpretation: "Test",
                emotion: "miedo",
              }),
            },
          },
        ],
      };

      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert - Should log the model
      expect(consoleSpy).toHaveBeenCalledWith(
        "[InterpretationOpenAIProvider] Modelo usado para reinterpretación:",
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

  });
});
