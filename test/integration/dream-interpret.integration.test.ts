import "reflect-metadata";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import { Interpretation } from "../../src/domain/interfaces/interpretation-dream.interface";
import { DreamNodeController } from "../../src/infrastructure/controllers/dream-node.controller";
import { InterpretationDreamService } from "../../src/application/services/interpretation-dream.service";
import { DreamNodeService } from "../../src/application/services/dream-node.service";
import { IllustrationDreamService } from "../../src/application/services/illustration-dream.service";
import { DreamContextService } from "../../src/application/services/dream-context.service";
import { IDreamContext } from "../../src/domain/interfaces/dream-context.interface";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid-123"),
}));

describe("Dream API Integration Tests", () => {
  let app: express.Application;
  let mockInterpretationService: jest.Mocked<InterpretationDreamService>;
  let mockDreamNodeService: jest.Mocked<DreamNodeService>;
  let mockIllustrationService: jest.Mocked<IllustrationDreamService>;
  let mockDreamContextService: jest.Mocked<DreamContextService>;

  beforeAll(async () => {
    mockInterpretationService = {
      interpretDream: jest.fn(),
      reinterpretDream: jest.fn(),
    } as any;

    mockDreamNodeService = {
      saveDreamNode: jest.fn(),
      onDreamReinterpreted: jest.fn().mockResolvedValue([]),
    } as any;

    mockIllustrationService = {
      generateIllustration: jest.fn(),
    } as any;

    mockDreamContextService = {
      register: jest.fn(),
      login: jest.fn(),
      getUserDreamContext: jest.fn().mockResolvedValue({
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      }),
    } as any;

    app = express();
    app.use(express.json());

    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as any).userId = "mockUserId";
      next();
    });

    const controller = new DreamNodeController(
      mockInterpretationService,
      mockDreamNodeService,
      mockIllustrationService,
      mockDreamContextService
    );

    app.post("/api/dreams/interpret", (req, res) =>
      controller.interpret(req, res)
    );

    app.post("/api/dreams/reinterpret", (req, res) =>
      controller.reinterpret(req, res)
    );

    app.post("/api/dreams/save", (req, res) => controller.save(req, res));
  });

  afterAll(async () => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/dreams/reinterpret", () => {
    it("should successfully reinterpret a dream", async () => {
      const requestBody = {
        description: "Soñé que volaba sobre montañas",
        previousInterpretation: "Representa tu deseo de libertad",
      };

      const expectedResponse: Interpretation = {
        title: "Nueva Perspectiva: Desafío y Superación",
        interpretation:
          "Volar sobre montañas también puede representar tu capacidad para superar obstáculos grandes...",
        emotion: "Felicidad",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        }
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(
        expectedResponse
      );

      const response = await request(app)
        .post("/api/dreams/reinterpret")
        .send(requestBody)
        .expect(200);

      expect(response.body).toMatchObject({
        description: requestBody.description,
        ...expectedResponse,
      });
      expect(response.body).toHaveProperty('unlockedBadges');
      expect(mockInterpretationService.reinterpretDream).toHaveBeenCalledWith(
        requestBody.description,
        requestBody.previousInterpretation,
        expect.any(Object) // context object
      );
    });

    it("should return 500 when interpretation provider fails", async () => {
      const requestBody = {
        description: "Soñé que volaba sobre montañas",
        previousInterpretation: "Representa tu deseo de libertad",
      };

      mockInterpretationService.reinterpretDream.mockRejectedValue(
        new Error("OpenAI API unavailable")
      );

      const response = await request(app)
        .post("/api/dreams/reinterpret")
        .send(requestBody)
        .expect(500);

      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toContain("Error al reinterpretar el sueño");
    });

    it("should handle large description inputs", async () => {
      const largeDescription =
        "Soñé que ".repeat(200) + "volaba sobre montañas";
      const requestBody = {
        description: largeDescription,
        previousInterpretation: "Representa tu deseo de libertad",
      };

      const expectedResponse: Interpretation = {
        title: "Interpretación de Sueño Complejo",
        interpretation: "Tu sueño detallado sugiere...",
        emotion: "Felicidad",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        }
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(
        expectedResponse
      );

      const response = await request(app)
        .post("/api/dreams/reinterpret")
        .send(requestBody)
        .expect(200);

      expect(response.body).toMatchObject({
        description: requestBody.description,
        ...expectedResponse,
      });
      expect(response.body).toHaveProperty('unlockedBadges');
    });

    it("should handle special characters in description", async () => {
      const requestBody = {
        description:
          "Soñé con símbolos extraños: ñáéíóú, emojis 🌟🌙, y caracteres especiales @#$%",
        previousInterpretation: "Representa confusión en tu vida",
      };

      const expectedResponse: Interpretation = {
        title: "Símbolos y Significados",
        interpretation:
          "Los símbolos en los sueños representan aspectos del subconsciente...",
        emotion: "Miedo",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        }
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(
        expectedResponse
      );

      const response = await request(app)
        .post("/api/dreams/reinterpret")
        .send(requestBody)
        .expect(200);

      expect(response.body).toMatchObject({
        description: requestBody.description,
        ...expectedResponse,
      });
      expect(response.body).toHaveProperty('unlockedBadges');
    });
  });

  describe("POST /api/dreams/interpret", () => {
    it("should successfully interpret a dream", async () => {
      const requestBody = {
        description: "Soñé que volaba sobre montañas",
      };

      const expectedResponseService = {
        title: "Libertad y Trascendencia",
        interpretation:
          "Volar en los sueños generalmente representa el deseo de libertad...",
        emotion: "Felicidad",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        }
      };

        const expectedResponse = {
        title: "Libertad y Trascendencia",
        interpretation:
          "Volar en los sueños generalmente representa el deseo de libertad...",
        emotion: "Felicidad",
      };

      const mockImageUrl = "https://example.com/dream-illustration.png";

      mockInterpretationService.interpretDream.mockResolvedValue(
        expectedResponseService
      );
      mockIllustrationService.generateIllustration.mockResolvedValue(
        mockImageUrl
      );

      mockDreamContextService.getUserDreamContext.mockResolvedValue({themes: [],people: [], locations: [], emotions_context: []} as IDreamContext);

      const response = await request(app)
        .post("/api/dreams/interpret")
        .set("Authorization", "Bearer mock-jwt-token")
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        ...expectedResponse,
        imageUrl: mockImageUrl,
      });

      expect(mockInterpretationService.interpretDream).toHaveBeenCalledWith(
        requestBody.description,
        expect.objectContaining({
          themes: expect.any(Array),
          people: expect.any(Array),
          locations: expect.any(Array),
          emotions_context: expect.any(Array)
        })
      );

      expect(mockIllustrationService.generateIllustration).toHaveBeenCalledWith(
        requestBody.description
      );
    });

    it("should return 500 when illustration service fails", async () => {
      const requestBody = {
        description: "Soñé que volaba sobre montañas",
      };

      const expectedResponse: Interpretation = {
        title: "Libertad y Trascendencia",
        interpretation:
          "Volar en los sueños generalmente representa el deseo de libertad...",
        emotion: "Felicidad",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        }
      };

      mockInterpretationService.interpretDream.mockResolvedValue(
        expectedResponse
      );
      mockIllustrationService.generateIllustration.mockRejectedValue(
        new Error("Image generation API unavailable")
      );

      const response = await request(app)
        .post("/api/dreams/interpret")
        .send(requestBody)
        .expect(500);

      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toContain("Error al interpretar el sueño");
    });

    it("should handle large description inputs", async () => {
      const largeDescription =
        "Soñé que ".repeat(200) + "caminaba por un bosque encantado";
      const requestBody = {
        description: largeDescription,
      };

      const expectedResponse: Interpretation = {
        title: "Viaje Interior Profundo",
        interpretation:
          "Tu sueño extenso indica una exploración compleja del subconsciente...",
        emotion: "Tristeza",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        }
      };

      const mockImageUrl = "https://example.com/forest-dream.png";

      mockInterpretationService.interpretDream.mockResolvedValue(
        expectedResponse
      );
      mockIllustrationService.generateIllustration.mockResolvedValue(
        mockImageUrl
      );

      const response = await request(app)
        .post("/api/dreams/interpret")
        .send(requestBody)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        imageUrl: mockImageUrl,
        interpretation: expectedResponse.interpretation,
        emotion: expectedResponse.emotion,
        title: expectedResponse.title
      });
    });

    it("should handle special characters in description", async () => {
      const requestBody = {
        description:
          "Soñé con criaturas místicas: dragones 🐉, unicornios 🦄, y runas mágicas ∞∆◊",
      };

      const expectedResponse: Interpretation = {
        title: "Mundo Fantástico Interior",
        interpretation:
          "Las criaturas místicas en sueños representan aspectos arquetípicos de tu psique...",
        emotion: "Felicidad",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        }
      };

      const mockImageUrl = "https://example.com/mystical-dream.png";

      mockInterpretationService.interpretDream.mockResolvedValue(
        expectedResponse
      );
      mockIllustrationService.generateIllustration.mockResolvedValue(
        mockImageUrl
      );

      const response = await request(app)
        .post("/api/dreams/interpret")
        .send(requestBody)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        imageUrl: mockImageUrl,
        interpretation: expectedResponse.interpretation,
        emotion: expectedResponse.emotion,
        title: expectedResponse.title
      });
    });

    it("should handle different types of dream emotions", async () => {
      const testCases = [
        {
          description: "Soñé que ganaba un premio importante",
          expectedEmotion: "Felicidad",
          context: {
            themes: [],
            people: [],
            locations: [],
            emotions_context: []
          }
        },
        {
          description: "Soñé que hablaba con un ser querido fallecido",
          expectedEmotion: "Tristeza",
          context: {
            themes: [],
            people: [],
            locations: [],
            emotions_context: []
          }
        }
      ];

      for (const testCase of testCases) {
        const requestBody = {
          description: testCase.description,
        };

        const expectedResponse = {
          emotion: testCase.expectedEmotion,
          title: `Sueño de ${testCase.expectedEmotion}`,
          interpretation: `Este sueño refleja sentimientos de ${testCase.expectedEmotion.toLowerCase()}.`,
          context: testCase.context
        };

        mockInterpretationService.interpretDream.mockResolvedValueOnce(
          expectedResponse
        );
        mockIllustrationService.generateIllustration.mockResolvedValueOnce(
          "https://example.com/emotion-dream.png"
        );

        const response = await request(app)
          .post("/api/dreams/interpret")
          .send(requestBody)
          .expect(200);

        expect(response.body).toEqual({
          description: requestBody.description,
          imageUrl: "https://example.com/emotion-dream.png",
          interpretation: expectedResponse.interpretation,
          emotion: expectedResponse.emotion,
          title: expectedResponse.title
        });
      }
    });

    it("should handle multiple concurrent requests to reinterpret", async () => {
      const requestBody = {
        description: "Sueño de prueba para concurrencia",
        previousInterpretation: "Interpretación previa",
      };

      const expectedResponseService: Interpretation = {
        title: "Respuesta Concurrente",
        interpretation: "Manejo de múltiples requests...",
        emotion: "Felicidad",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        }
      };

       const expectedResponse = {
        title: "Respuesta Concurrente",
        interpretation: "Manejo de múltiples requests...",
        emotion: "Felicidad",
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(
        expectedResponseService
      );

      const promises = Array(3)
        .fill(null)
        .map(() =>
          request(app)
            .post("/api/dreams/reinterpret")
            .send(requestBody)
            .expect(200)
        );

      const responses = await Promise.all(promises);

    responses.forEach((response) => {
    expect(response.body).toMatchObject({
      description: requestBody.description,
      interpretation: expectedResponse.interpretation,
      emotion: expectedResponse.emotion,
      title: expectedResponse.title,
      context: expectedResponseService.context,
      imageUrl: "https://example.com/mystical-dream.png"
  });
      expect(response.body).toHaveProperty('unlockedBadges');
      });
    });

  describe("Error handling and edge cases", () => {
    describe("Timeout scenarios", () => {
      it("should handle timeout in reinterpret endpoint", async () => {
        const requestBody = {
          description: "Soñé que volaba sobre montañas",
          previousInterpretation: "Representa tu deseo de libertad",
        };

        mockInterpretationService.reinterpretDream.mockImplementation(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), 100)
            )
        );

        const response = await request(app)
          .post("/api/dreams/reinterpret")
          .send(requestBody)
          .timeout(5000)
          .expect(500);

        expect(response.body.errors).toContain(
          "Error al reinterpretar el sueño"
        );
      });

      it("should handle timeout in interpret endpoint", async () => {
        const requestBody = {
          description: "Soñé que nadaba en el océano",
        };

        mockInterpretationService.interpretDream.mockImplementation(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), 100)
            )
        );

        const response = await request(app)
          .post("/api/dreams/interpret")
          .send(requestBody)
          .timeout(5000)
          .expect(500);

        expect(response.body.errors).toContain("Error al interpretar el sueño");
      });
    });
  });
});
})
