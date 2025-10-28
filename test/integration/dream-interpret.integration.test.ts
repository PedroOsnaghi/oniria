import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import { Interpretation } from '../../src/domain/interfaces/interpretation-dream.interface';
import { DreamNodeController } from '../../src/infrastructure/controllers/dream-node.controller';
import { InterpretationDreamService } from '../../src/application/services/interpretation-dream.service';
import { DreamNodeService } from '../../src/application/services/dream-node.service';
import { IllustrationDreamService } from '../../src/application/services/illustration-dream.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123')
}));

describe('Dream API Integration Tests', () => {
  let app: express.Application;
  let mockInterpretationService: jest.Mocked<InterpretationDreamService>;
  let mockDreamNodeService: jest.Mocked<DreamNodeService>;
  let mockIllustrationService: jest.Mocked<IllustrationDreamService>;

  beforeAll(async () => {
    mockInterpretationService = {
      interpretDream: jest.fn(),
      reinterpretDream: jest.fn(),
    } as any;

    mockDreamNodeService = {
      saveDreamNode: jest.fn(),
    } as any;

    mockIllustrationService = {
      generateIllustration: jest.fn(),
    } as any;

    app = express();
    app.use(express.json());

    const controller = new DreamNodeController(
      mockInterpretationService,
      mockDreamNodeService,
      mockIllustrationService
    );

    app.post('/api/dreams/interpret', (req, res) => controller.interpret(req, res));
    app.post('/api/dreams/reinterpret', (req, res) => controller.reinterpret(req, res));
    app.post('/api/dreams/save', (req, res) => controller.save(req, res));
  });

  afterAll(async () => {
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/dreams/reinterpret', () => {
    it('should successfully reinterpret a dream', async () => {
      const requestBody = {
        description: 'Soñé que volaba sobre montañas',
        previousInterpretation: 'Representa tu deseo de libertad'
      };

      const expectedResponse: Interpretation = {
        title: 'Nueva Perspectiva: Desafío y Superación',
        interpretation: 'Volar sobre montañas también puede representar tu capacidad para superar obstáculos grandes...',
        emotion: 'Felicidad'
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(expectedResponse);

      const response = await request(app)
        .post('/api/dreams/reinterpret')
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        ...expectedResponse
      });
      expect(mockInterpretationService.reinterpretDream).toHaveBeenCalledWith(
        requestBody.description,
        requestBody.previousInterpretation
      );
    });

    it('should return 500 when interpretation provider fails', async () => {
      const requestBody = {
        description: 'Soñé que volaba sobre montañas',
        previousInterpretation: 'Representa tu deseo de libertad'
      };

      mockInterpretationService.reinterpretDream.mockRejectedValue(
        new Error('OpenAI API unavailable')
      );

      const response = await request(app)
        .post('/api/dreams/reinterpret')
        .send(requestBody)
        .expect(500);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Error al reinterpretar el sueño');
    });

    it('should handle large description inputs', async () => {
      const largeDescription = 'Soñé que '.repeat(200) + 'volaba sobre montañas';
      const requestBody = {
        description: largeDescription,
        previousInterpretation: 'Representa tu deseo de libertad'
      };

      const expectedResponse: Interpretation = {
        title: 'Interpretación de Sueño Complejo',
        interpretation: 'Tu sueño detallado sugiere...',
        emotion: 'Felicidad'
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(expectedResponse);

      const response = await request(app)
        .post('/api/dreams/reinterpret')
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        ...expectedResponse
      });
    });

    it('should handle special characters in description', async () => {
      const requestBody = {
        description: 'Soñé con símbolos extraños: ñáéíóú, emojis 🌟🌙, y caracteres especiales @#$%',
        previousInterpretation: 'Representa confusión en tu vida'
      };

      const expectedResponse: Interpretation = {
        title: 'Símbolos y Significados',
        interpretation: 'Los símbolos en los sueños representan aspectos del subconsciente...',
        emotion: 'Miedo'
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(expectedResponse);

      const response = await request(app)
        .post('/api/dreams/reinterpret')
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        ...expectedResponse
      });
    });
  });

  describe('POST /api/dreams/interpret', () => {
    it('should successfully interpret a dream', async () => {
      const requestBody = {
        description: 'Soñé que volaba sobre montañas'
      };

      const expectedResponse: Interpretation = {
        title: 'Libertad y Trascendencia',
        interpretation: 'Volar en los sueños generalmente representa el deseo de libertad...',
        emotion: 'Felicidad'
      };

      const mockImageUrl = 'https://example.com/dream-illustration.png';

      mockInterpretationService.interpretDream.mockResolvedValue(expectedResponse);
      mockIllustrationService.generateIllustration.mockResolvedValue(mockImageUrl);

      const response = await request(app)
        .post('/api/dreams/interpret')
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        imageUrl: mockImageUrl,
        ...expectedResponse
      });
      expect(mockInterpretationService.interpretDream).toHaveBeenCalledWith(
        requestBody.description
      );
      expect(mockIllustrationService.generateIllustration).toHaveBeenCalledWith(
        requestBody.description
      );
    });

    it('should return 500 when interpretation service fails', async () => {
      const requestBody = {
        description: 'Soñé que volaba sobre montañas'
      };

      mockInterpretationService.interpretDream.mockRejectedValue(
        new Error('OpenAI API unavailable')
      );

      const response = await request(app)
        .post('/api/dreams/interpret')
        .send(requestBody)
        .expect(500);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Error al interpretar el sueño');
    });

    it('should return 500 when illustration service fails', async () => {
      const requestBody = {
        description: 'Soñé que volaba sobre montañas'
      };

      const expectedResponse: Interpretation = {
        title: 'Libertad y Trascendencia',
        interpretation: 'Volar en los sueños generalmente representa el deseo de libertad...',
        emotion: 'Felicidad'
      };

      mockInterpretationService.interpretDream.mockResolvedValue(expectedResponse);
      mockIllustrationService.generateIllustration.mockRejectedValue(
        new Error('Image generation API unavailable')
      );

      const response = await request(app)
        .post('/api/dreams/interpret')
        .send(requestBody)
        .expect(500);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Error al interpretar el sueño');
    });

    it('should handle large description inputs', async () => {
      const largeDescription = 'Soñé que '.repeat(200) + 'caminaba por un bosque encantado';
      const requestBody = {
        description: largeDescription
      };

      const expectedResponse: Interpretation = {
        title: 'Viaje Interior Profundo',
        interpretation: 'Tu sueño extenso indica una exploración compleja del subconsciente...',
        emotion: 'Tristeza'
      };

      const mockImageUrl = 'https://example.com/forest-dream.png';

      mockInterpretationService.interpretDream.mockResolvedValue(expectedResponse);
      mockIllustrationService.generateIllustration.mockResolvedValue(mockImageUrl);

      const response = await request(app)
        .post('/api/dreams/interpret')
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        imageUrl: mockImageUrl,
        ...expectedResponse
      });
    });

    it('should handle special characters in description', async () => {
      const requestBody = {
        description: 'Soñé con criaturas místicas: dragones 🐉, unicornios 🦄, y runas mágicas ∞∆◊'
      };

      const expectedResponse: Interpretation = {
        title: 'Mundo Fantástico Interior',
        interpretation: 'Las criaturas místicas en sueños representan aspectos arquetípicos de tu psique...',
        emotion: 'Felicidad'
      };

      const mockImageUrl = 'https://example.com/mystical-dream.png';

      mockInterpretationService.interpretDream.mockResolvedValue(expectedResponse);
      mockIllustrationService.generateIllustration.mockResolvedValue(mockImageUrl);

      const response = await request(app)
        .post('/api/dreams/interpret')
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        imageUrl: mockImageUrl,
        ...expectedResponse
      });
    });

    it('should handle different types of dream emotions', async () => {
      const testCases = [
        {
          description: 'Soñé que ganaba un premio importante',
          expectedEmotion: 'Felicidad',
          title: 'Reconocimiento y Logro'
        },
        {
          description: 'Soñé que estaba perdido en una ciudad desconocida',
          expectedEmotion: 'Miedo',
          title: 'Búsqueda de Dirección'
        },
        {
          description: 'Soñé que hablaba con un ser querido fallecido',
          expectedEmotion: 'Tristeza',
          title: 'Conexión Trascendental'
        }
      ];

      for (const testCase of testCases) {
        const requestBody = { description: testCase.description };
        const expectedResponse: Interpretation = {
          title: testCase.title,
          interpretation: `Interpretación detallada del sueño: ${testCase.description}`,
          emotion: testCase.expectedEmotion
        };

        const mockImageUrl = 'https://example.com/emotion-dream.png';

        mockInterpretationService.interpretDream.mockResolvedValue(expectedResponse);
        mockIllustrationService.generateIllustration.mockResolvedValue(mockImageUrl);

        const response = await request(app)
          .post('/api/dreams/interpret')
          .send(requestBody)
          .expect(200);

        expect(response.body).toEqual({
          description: requestBody.description,
          imageUrl: mockImageUrl,
          ...expectedResponse
        });
        expect(response.body.emotion).toBe(testCase.expectedEmotion);

        mockInterpretationService.interpretDream.mockReset();
        mockIllustrationService.generateIllustration.mockReset();
      }
    });
  });

  describe('Error handling and edge cases', () => {
    describe('Timeout scenarios', () => {
      it('should handle timeout in reinterpret endpoint', async () => {
        const requestBody = {
          description: 'Soñé que volaba sobre montañas',
          previousInterpretation: 'Representa tu deseo de libertad'
        };

        mockInterpretationService.reinterpretDream.mockImplementation(
          () => new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
        );

        const response = await request(app)
          .post('/api/dreams/reinterpret')
          .send(requestBody)
          .timeout(5000)
          .expect(500);

        expect(response.body.errors).toContain('Error al reinterpretar el sueño');
      });

      it('should handle timeout in interpret endpoint', async () => {
        const requestBody = {
          description: 'Soñé que nadaba en el océano'
        };

        mockInterpretationService.interpretDream.mockImplementation(
          () => new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
        );

        const response = await request(app)
          .post('/api/dreams/interpret')
          .send(requestBody)
          .timeout(5000)
          .expect(500);

        expect(response.body.errors).toContain('Error al interpretar el sueño');
      });
    });

    describe('Rate limiting and performance', () => {
      it('should handle multiple concurrent requests to reinterpret', async () => {
        const requestBody = {
          description: 'Sueño de prueba para concurrencia',
          previousInterpretation: 'Interpretación previa'
        };

        const expectedResponse: Interpretation = {
          title: 'Respuesta Concurrente',
          interpretation: 'Manejo de múltiples requests...',
          emotion: 'Felicidad'
        };

        mockInterpretationService.reinterpretDream.mockResolvedValue(expectedResponse);

        const promises = Array(3).fill(null).map(() =>
          request(app)
            .post('/api/dreams/reinterpret')
            .send(requestBody)
            .expect(200)
        );

        const responses = await Promise.all(promises);

        responses.forEach(response => {
          expect(response.body).toEqual({
            description: requestBody.description,
            ...expectedResponse
          });
        });
      });

      it('should handle multiple concurrent requests to interpret', async () => {
        const requestBody = {
          description: 'Otro sueño de prueba para concurrencia'
        };

        const expectedResponse: Interpretation = {
          title: 'Interpretación Concurrente',
          interpretation: 'Procesamiento simultáneo de sueños...',
          emotion: 'Felicidad'
        };

        const mockImageUrl = 'https://example.com/concurrent-dream.png';

        mockInterpretationService.interpretDream.mockResolvedValue(expectedResponse);
        mockIllustrationService.generateIllustration.mockResolvedValue(mockImageUrl);

        const promises = Array(3).fill(null).map(() =>
          request(app)
            .post('/api/dreams/interpret')
            .send(requestBody)
            .expect(200)
        );

        const responses = await Promise.all(promises);

        responses.forEach(response => {
          expect(response.body).toEqual({
            description: requestBody.description,
            imageUrl: mockImageUrl,
            ...expectedResponse
          });
        });
      });
    });
  });
});