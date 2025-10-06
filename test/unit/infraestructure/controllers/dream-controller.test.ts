import 'reflect-metadata';
import { DreamNodeController } from '../../../../src/infrastructure/controllers/dream-node.controller';
import { InterpretationDreamService } from '../../../../src/application/services/interpretation-dream.service';
import { DreamNodeService } from '../../../../src/application/services/dream-node.service';
import { Interpretation } from '../../../../src/domain/models/interpretation-dream.model';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123')
}));
import { Request, Response } from 'express';

describe('DreamNodeController Integration Tests', () => {
  let controller: DreamNodeController;
  let mockInterpretationService: jest.Mocked<InterpretationDreamService>;
  let mockDreamNodeService: jest.Mocked<DreamNodeService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Mock de los servicios
    mockInterpretationService = {
      interpretDream: jest.fn(),
      reinterpretDream: jest.fn(),
    } as any;

    mockDreamNodeService = {
      saveDreamNode: jest.fn(),
    } as any;

    // Mock de Express Request y Response
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Inicializar controller con ambos servicios mock
    controller = new DreamNodeController(mockInterpretationService, mockDreamNodeService);
  });

  describe('reinterpret method', () => {
    it('should successfully reinterpret a dream', async () => {
      // Arrange
      const requestBody = {
        description: 'Soñé que caía de un acantilado muy alto',
        previousInterpretation: 'Representa tus miedos y inseguridades'
      };

      const expectedResult: Interpretation = {
        title: 'Transformación y Liberación',
        interpretation: 'Caer en sueños también puede simbolizar el proceso de soltar control y confiar en el flujo natural de la vida...',
        emotion: 'Miedo'
      };

      mockRequest.body = requestBody;
      mockInterpretationService.reinterpretDream.mockResolvedValue(expectedResult);

      // Act
      await controller.reinterpret(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockInterpretationService.reinterpretDream).toHaveBeenCalledWith(
        requestBody.description,
        requestBody.previousInterpretation
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        description: requestBody.description,
        ...expectedResult
      });
    });

    it('should handle service error and return 500 status', async () => {
      // Arrange
      const requestBody = {
        description: 'Soñé con agua turbia',
        previousInterpretation: 'Representa emociones confusas'
      };

      const serviceError = new Error('OpenAI API error');
      mockRequest.body = requestBody;
      mockInterpretationService.reinterpretDream.mockRejectedValue(serviceError);

      // Act
      await controller.reinterpret(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockInterpretationService.reinterpretDream).toHaveBeenCalledWith(
        requestBody.description,
        requestBody.previousInterpretation
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: 'Error al reinterpretar el sueño'
      });
    });
  });

  describe('Integration with Service Layer', () => {
    it('should pass correct parameters from DTO to service', async () => {
      // Arrange
      const requestBody = {
        description: 'Soñé con un laberinto sin salida',
        previousInterpretation: 'Representa sensación de estar atrapado en la vida'
      };

      const expectedResult: Interpretation = {
        title: 'Nuevos Caminos',
        interpretation: 'Un laberinto también puede representar el viaje interior de autodescubrimiento...',
        emotion: 'hopeful'
      };

      mockRequest.body = requestBody;
      mockInterpretationService.reinterpretDream.mockResolvedValue(expectedResult);

      // Act
      await controller.reinterpret(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockInterpretationService.reinterpretDream).toHaveBeenCalledTimes(1);
      expect(mockInterpretationService.reinterpretDream).toHaveBeenCalledWith(
        requestBody.description,
        requestBody.previousInterpretation
      );
    });

    it('should handle different types of interpretations', async () => {
      // Arrange
      const testCases = [
        {
          dto: { description: 'Sueño positivo', previousInterpretation: 'Interpretación positiva' },
          response: { title: 'Título Positivo', interpretation: 'Nueva interpretación positiva', emotion: 'joy' }
        },
        {
          dto: { description: 'Sueño neutro', previousInterpretation: 'Interpretación neutra' },
          response: { title: 'Título Neutro', interpretation: 'Nueva interpretación neutra', emotion: 'calm' }
        },
        {
          dto: { description: 'Sueño desafiante', previousInterpretation: 'Interpretación desafiante' },
          response: { title: 'Título Transformativo', interpretation: 'Nueva perspectiva transformativa', emotion: 'growth' }
        }
      ];

      for (const testCase of testCases) {
        // Arrange
        mockRequest.body = testCase.dto;
        mockInterpretationService.reinterpretDream.mockResolvedValue(testCase.response);

        // Act
        await controller.reinterpret(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
          description: testCase.dto.description,
          ...testCase.response
        });
        expect(mockInterpretationService.reinterpretDream).toHaveBeenCalledWith(
          testCase.dto.description,
          testCase.dto.previousInterpretation
        );

        // Reset mocks for next iteration
        mockInterpretationService.reinterpretDream.mockReset();
        (mockResponse.json as jest.Mock).mockClear();
      }
    });
  });
});