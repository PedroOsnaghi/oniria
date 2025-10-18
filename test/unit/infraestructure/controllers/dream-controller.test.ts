import 'reflect-metadata';
import { DreamNodeController } from '../../../../src/infrastructure/controllers/dream-node.controller';
import { InterpretationDreamService } from '../../../../src/application/services/interpretation-dream.service';
import { DreamNodeService } from '../../../../src/application/services/dream-node.service';
import { Interpretation } from '../../../../src/domain/interfaces/interpretation-dream.interface';
import { IDreamNode } from '../../../../src/domain/models/dream-node.model';
import { IPaginatedResult } from '../../../../src/domain/interfaces/pagination.interface';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123')
}));
import { Request, Response } from 'express';
import { mockSaveReq } from '../../mocks/mock-save-req';
import { mockSaveRes } from '../../mocks/mock-save-res';

describe('DreamNodeController Integration Tests', () => {
  let controller: DreamNodeController;
  let mockInterpretationService: jest.Mocked<InterpretationDreamService>;
  let mockDreamNodeService: jest.Mocked<DreamNodeService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockInterpretationService = {
      interpretDream: jest.fn(),
      reinterpretDream: jest.fn(),
    } as any;

    mockDreamNodeService = {
      saveDreamNode: jest.fn(),
    } as any;

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
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

//Savedreamnode

describe("DreamNodeController.save", () => {
  let controller: DreamNodeController;
  let mockDreamNodeService: jest.Mocked<DreamNodeService>;
  let mockInterpretationService: jest.Mocked<InterpretationDreamService>;

  beforeEach(() => {
      mockDreamNodeService = {
      saveDreamNode: jest.fn()
    } as unknown as jest.Mocked<DreamNodeService>;

     mockInterpretationService = {
      interpretDream: jest.fn(),
      reinterpretDream: jest.fn(),
    } as unknown as jest.Mocked<InterpretationDreamService>;

     controller = new DreamNodeController(mockInterpretationService, mockDreamNodeService);
  });

  it("should save a dream node and return 201", async () => {
  mockDreamNodeService.saveDreamNode.mockResolvedValue(undefined);

  await controller.save(mockSaveReq as Request, mockSaveRes as unknown as Response);

  expect(mockDreamNodeService.saveDreamNode).toHaveBeenCalledWith(
    (mockSaveReq as any).userId,
    mockSaveReq.body.title,
    mockSaveReq.body.description,
    mockSaveReq.body.interpretation,
    mockSaveReq.body.emotion
  );

  expect(mockSaveRes.status).toHaveBeenCalledWith(201);
  expect(mockSaveRes.json).toHaveBeenCalledWith({ message: "Nodo de sueño guardado exitosamente", errors: [] });
});

  it("should return 500 when service fails", async () => {
    mockDreamNodeService.saveDreamNode.mockRejectedValue(new Error("Error simulado"));

    await controller.save(mockSaveReq as Request, mockSaveRes as unknown as Response);

    expect(mockDreamNodeService.saveDreamNode).toHaveBeenCalledWith(
      (mockSaveReq as any).userId,
      mockSaveReq.body.title,
      mockSaveReq.body.description,
      mockSaveReq.body.interpretation,
      mockSaveReq.body.emotion
    );
    expect(mockSaveRes.status).toHaveBeenCalledWith(500);
    expect(mockSaveRes.json).toHaveBeenCalledWith({
      message: "Error interno del servidor",
      errors: ["Error simulado"]
    });
  });
});

describe('DreamNodeController.getUserNodes', () => {
  let controller: DreamNodeController;
  let mockInterpretationService: jest.Mocked<InterpretationDreamService>;
  let mockDreamNodeService: jest.Mocked<DreamNodeService>;
  let mockRequest: Partial<Request> & { validatedParams?: any; validatedQuery?: any };
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockInterpretationService = {
      interpretDream: jest.fn(),
      reinterpretDream: jest.fn(),
    } as any;

    mockDreamNodeService = {
      saveDreamNode: jest.fn(),
      getUserNodes: jest.fn(),
    } as any;

    mockRequest = { } as any;
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    controller = new DreamNodeController(mockInterpretationService, mockDreamNodeService);
  });

  it('should return paginated result with filters and pagination', async () => {
    // Arrange
    const userId = 'mocked-user-id';
    const filters = { state: 'Activo', privacy: 'Publico', emotion: 'Felicidad', search: 'test' };
    const pagination = { page: 1, limit: 10 };
    const mockDreamNode: IDreamNode = {
      id: 'dream-node-id',
      title: 'Test Dream',
      description: 'Test Description',
      interpretation: 'Test Interpretation',
      privacy: 'Publico',
      state: 'Activo',
      emotion: 'Felicidad',
      creationDate: new Date()
    };
    const expectedResult: IPaginatedResult<IDreamNode> = {
      data: [mockDreamNode],
      pagination: {
        currentPage: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };

    mockRequest.validatedQuery = { state: 'Activo', privacy: 'Publico', emotion: 'Felicidad', search: 'test', page: 1, limit: 10, from: undefined, to: undefined };
    (mockRequest as any).userId = userId;
    mockDreamNodeService.getUserNodes.mockResolvedValue(expectedResult);

    // Act
    await controller.getUserNodes(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockDreamNodeService.getUserNodes).toHaveBeenCalledWith(userId, filters, pagination);
    expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
  });

  it('should return 400 when userId is missing', async () => {
    // Arrange
    (mockRequest as any).userId = undefined; // No userId provided

    // Act
    await controller.getUserNodes(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ errors: 'El id del usuario es requerido' });
  });

  it('should return 500 when service throws an error', async () => {
    // Arrange
    const userId = 'mocked-user-id';
    const filters = { state: 'Activo', privacy: 'Publico', emotion: 'Felicidad', search: 'test' };
    const pagination = { page: 1, limit: 10 };

    (mockRequest as any).userId = userId;
    mockRequest.validatedQuery = { state: 'Activo', privacy: 'Publico', emotion: 'Felicidad', search: 'test', page: 1, limit: 10, from: undefined, to: undefined };
    const serviceError = new Error('Service error');
    mockDreamNodeService.getUserNodes.mockRejectedValue(serviceError);

    // Act
    await controller.getUserNodes(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockDreamNodeService.getUserNodes).toHaveBeenCalledWith(userId, filters, pagination);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ errors: 'Error al obtener los nodos de sueño del usuario' });
  });
});
