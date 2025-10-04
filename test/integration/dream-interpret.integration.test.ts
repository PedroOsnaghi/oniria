import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import { Interpretation } from '../../src/domain/models/interpretation-dream.model';
import { DreamNodeController } from '../../src/infrastructure/controllers/dream-node.controller';
import { InterpretationDreamService } from '../../src/application/services/interpreation-dream.service';
import { DreamNodeService } from '../../src/application/services/dream-node.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123')
}));

describe('Dream API Integration Tests', () => {
  let app: express.Application;
  let mockInterpretationService: jest.Mocked<InterpretationDreamService>;
  let mockDreamNodeService: jest.Mocked<DreamNodeService>;

  beforeAll(async () => {
    // Mock de los servicios
    mockInterpretationService = {
      interpretDream: jest.fn(),
      reinterpretDream: jest.fn(),
    } as any;

    mockDreamNodeService = {
      saveDreamNode: jest.fn(),
    } as any;

    // Crear Express app para testing
    app = express();
    app.use(express.json());

    // Crear controller con mocks
    const controller = new DreamNodeController(mockInterpretationService, mockDreamNodeService);

    // Configurar rutas manualmente para testing
    app.post('/api/dreams/interpret', (req, res) => controller.interpret(req, res));
    app.post('/api/dreams/reinterpret', (req, res) => controller.reinterpret(req, res));
    app.post('/api/dreams/save', (req, res) => controller.save(req, res));
  });

  afterAll(async () => {
    // Cleanup de la app si es necesario
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/dreams/reinterpret', () => {
    it('should successfully reinterpret a dream', async () => {
      // Arrange
      const requestBody = {
        description: 'Soñé que volaba sobre montañas',
        previousInterpretation: 'Representa tu deseo de libertad'
      };

      const expectedResponse: Interpretation = {
        title: 'Nueva Perspectiva: Desafío y Superación',
        interpretation: 'Volar sobre montañas también puede representar tu capacidad para superar obstáculos grandes...',
        emotion: 'positive'
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(expectedResponse);

      // Act & Assert
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
      // Arrange
      const requestBody = {
        description: 'Soñé que volaba sobre montañas',
        previousInterpretation: 'Representa tu deseo de libertad'
      };

      mockInterpretationService.reinterpretDream.mockRejectedValue(
        new Error('OpenAI API unavailable')
      );

      // Act & Assert
      const response = await request(app)
        .post('/api/dreams/reinterpret')
        .send(requestBody)
        .expect(500);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Error al reinterpretar el sueño');
    });

    it('should handle large description inputs', async () => {
      // Arrange
      const largeDescription = 'Soñé que '.repeat(200) + 'volaba sobre montañas';
      const requestBody = {
        description: largeDescription,
        previousInterpretation: 'Representa tu deseo de libertad'
      };

      const expectedResponse: Interpretation = {
        title: 'Interpretación de Sueño Complejo',
        interpretation: 'Tu sueño detallado sugiere...',
        emotion: 'neutral'
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(expectedResponse);

      // Act & Assert
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
      // Arrange
      const requestBody = {
        description: 'Soñé con símbolos extraños: ñáéíóú, emojis 🌟🌙, y caracteres especiales @#$%',
        previousInterpretation: 'Representa confusión en tu vida'
      };

      const expectedResponse: Interpretation = {
        title: 'Símbolos y Significados',
        interpretation: 'Los símbolos en los sueños representan aspectos del subconsciente...',
        emotion: 'curious'
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(expectedResponse);

      // Act & Assert
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
      // Arrange
      const requestBody = {
        description: 'Soñé que volaba sobre montañas'
      };

      const expectedResponse: Interpretation = {
        title: 'Libertad y Trascendencia',
        interpretation: 'Volar en los sueños generalmente representa el deseo de libertad...',
        emotion: 'positive'
      };

      mockInterpretationService.interpretDream.mockResolvedValue(expectedResponse);

      // Act & Assert
      const response = await request(app)
        .post('/api/dreams/interpret')
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        ...expectedResponse
      });
      expect(mockInterpretationService.interpretDream).toHaveBeenCalledWith(
        requestBody.description
      );
    });

    it('should return 500 when interpretation service fails', async () => {
      // Arrange
      const requestBody = {
        description: 'Soñé que volaba sobre montañas'
      };

      mockInterpretationService.interpretDream.mockRejectedValue(
        new Error('OpenAI API unavailable')
      );

      // Act & Assert
      const response = await request(app)
        .post('/api/dreams/interpret')
        .send(requestBody)
        .expect(500);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Error al interpretar el sueño');
    });

    it('should handle large description inputs', async () => {
      // Arrange
      const largeDescription = 'Soñé que '.repeat(200) + 'caminaba por un bosque encantado';
      const requestBody = {
        description: largeDescription
      };

      const expectedResponse: Interpretation = {
        title: 'Viaje Interior Profundo',
        interpretation: 'Tu sueño extenso indica una exploración compleja del subconsciente...',
        emotion: 'mysterious'
      };

      mockInterpretationService.interpretDream.mockResolvedValue(expectedResponse);

      // Act & Assert
      const response = await request(app)
        .post('/api/dreams/interpret')
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        ...expectedResponse
      });
    });

    it('should handle special characters in description', async () => {
      // Arrange
      const requestBody = {
        description: 'Soñé con criaturas místicas: dragones 🐉, unicornios 🦄, y runas mágicas ∞∆◊'
      };

      const expectedResponse: Interpretation = {
        title: 'Mundo Fantástico Interior',
        interpretation: 'Las criaturas místicas en sueños representan aspectos arquetípicos de tu psique...',
        emotion: 'wonder'
      };

      mockInterpretationService.interpretDream.mockResolvedValue(expectedResponse);

      // Act & Assert
      const response = await request(app)
        .post('/api/dreams/interpret')
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        ...expectedResponse
      });
    });

    it('should handle different types of dream emotions', async () => {
      // Arrange
      const testCases = [
        {
          description: 'Soñé que ganaba un premio importante',
          expectedEmotion: 'joy',
          title: 'Reconocimiento y Logro'
        },
        {
          description: 'Soñé que estaba perdido en una ciudad desconocida',
          expectedEmotion: 'anxiety',
          title: 'Búsqueda de Dirección'
        },
        {
          description: 'Soñé que hablaba con un ser querido fallecido',
          expectedEmotion: 'melancholy',
          title: 'Conexión Trascendental'
        }
      ];

      for (const testCase of testCases) {
        // Arrange
        const requestBody = { description: testCase.description };
        const expectedResponse: Interpretation = {
          title: testCase.title,
          interpretation: `Interpretación detallada del sueño: ${testCase.description}`,
          emotion: testCase.expectedEmotion
        };

        mockInterpretationService.interpretDream.mockResolvedValue(expectedResponse);

        // Act & Assert
        const response = await request(app)
          .post('/api/dreams/interpret')
          .send(requestBody)
          .expect(200);

        expect(response.body).toEqual({
          description: requestBody.description,
          ...expectedResponse
        });
        expect(response.body.emotion).toBe(testCase.expectedEmotion);

        // Reset mock for next iteration
        mockInterpretationService.interpretDream.mockReset();
      }
    });
  });

  describe('Error handling and edge cases', () => {

    describe('Timeout scenarios', () => {
      it('should handle timeout in reinterpret endpoint', async () => {
        // Arrange
        const requestBody = {
          description: 'Soñé que volaba sobre montañas',
          previousInterpretation: 'Representa tu deseo de libertad'
        };

        // Simular timeout
        mockInterpretationService.reinterpretDream.mockImplementation(
          () => new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
        );

        // Act & Assert
        const response = await request(app)
          .post('/api/dreams/reinterpret')
          .send(requestBody)
          .timeout(5000)
          .expect(500);

        expect(response.body.errors).toContain('Error al reinterpretar el sueño');
      });

      it('should handle timeout in interpret endpoint', async () => {
        // Arrange
        const requestBody = {
          description: 'Soñé que nadaba en el océano'
        };

        // Simular timeout
        mockInterpretationService.interpretDream.mockImplementation(
          () => new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
        );

        // Act & Assert
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
        // Arrange
        const requestBody = {
          description: 'Sueño de prueba para concurrencia',
          previousInterpretation: 'Interpretación previa'
        };

        const expectedResponse: Interpretation = {
          title: 'Respuesta Concurrente',
          interpretation: 'Manejo de múltiples requests...',
          emotion: 'neutral'
        };

        mockInterpretationService.reinterpretDream.mockResolvedValue(expectedResponse);

        // Act - Hacer 3 requests simultáneas
        const promises = Array(3).fill(null).map(() =>
          request(app)
            .post('/api/dreams/reinterpret')
            .send(requestBody)
            .expect(200)
        );

        const responses = await Promise.all(promises);

        // Assert
        responses.forEach(response => {
          expect(response.body).toEqual({
            description: requestBody.description,
            ...expectedResponse
          });
        });
      });

      it('should handle multiple concurrent requests to interpret', async () => {
        // Arrange
        const requestBody = {
          description: 'Otro sueño de prueba para concurrencia'
        };

        const expectedResponse: Interpretation = {
          title: 'Interpretación Concurrente',
          interpretation: 'Procesamiento simultáneo de sueños...',
          emotion: 'calm'
        };

        mockInterpretationService.interpretDream.mockResolvedValue(expectedResponse);

        // Act - Hacer 3 requests simultáneas
        const promises = Array(3).fill(null).map(() =>
          request(app)
            .post('/api/dreams/interpret')
            .send(requestBody)
            .expect(200)
        );

        const responses = await Promise.all(promises);

        // Assert
        responses.forEach(response => {
          expect(response.body).toEqual({
            description: requestBody.description,
            ...expectedResponse
          });
        });
      });
    });
  });
});