import { DreamNodeController } from '../../src/infrastructure/controllers/dream-node.controller';
import { InterpretationDreamService } from '../../src/application/services/interpreation-dream.service';
import { DreamNodeService } from '../../src/application/services/dream-node.service';
import { ReinterpreteDreamRequestDto, InterpreteDreamRequestDto } from '../../src/infrastructure/dtos/dream-node.dto';
import { Interpretation } from '../../src/domain/models/interpretation-dream.model';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';


//TESTS DIRECTAMENTE AL CONTROLADOR CON SERVICIOS MOCKEADOS


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

  describe('interpret method', () => {
    it('should successfully interpret a dream', async () => {
      // Arrange
      const requestBody = {
        description: 'Soñé que volaba sobre montañas muy altas'
      };

      const expectedResult: Interpretation = {
        title: 'Vuelo de Libertad',
        interpretation: 'Volar en los sueños generalmente representa el deseo de libertad y la capacidad de superar obstáculos...',
        emotion: 'Felicidad'
      };

      mockRequest.body = requestBody;
      mockInterpretationService.interpretDream.mockResolvedValue(expectedResult);

      // Act
      await controller.interpret(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockInterpretationService.interpretDream).toHaveBeenCalledWith(
        requestBody.description
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        description: requestBody.description,
        ...expectedResult
      });
    });

    it('should handle service error and return 500 status', async () => {
      // Arrange
      const requestBody = {
        description: 'Soñé que estaba perdido en un laberinto oscuro'
      };

      const serviceError = new Error('OpenAI API error');
      mockRequest.body = requestBody;
      mockInterpretationService.interpretDream.mockRejectedValue(serviceError);

      // Act
      await controller.interpret(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockInterpretationService.interpretDream).toHaveBeenCalledWith(
        requestBody.description
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: 'Error al interpretar el sueño'
      });
    });

    it('should handle different types of dream emotions', async () => {
      // Arrange
      const testCases = [
        {
          dto: { description: 'Soñé que ganaba un premio importante' },
          response: { title: 'Reconocimiento y Logro', interpretation: 'Ganar premios en sueños refleja tu deseo de reconocimiento...', emotion: 'Felicidad' }
        },
        {
          dto: { description: 'Soñé que estaba perdido en una ciudad desconocida' },
          response: { title: 'Búsqueda de Dirección', interpretation: 'Estar perdido en sueños indica confusión o búsqueda de propósito...', emotion: 'Miedo' }
        },
        {
          dto: { description: 'Soñé que hablaba con un ser querido fallecido' },
          response: { title: 'Conexión Trascendental', interpretation: 'Los sueños con fallecidos representan la necesidad de cierre...', emotion: 'Tristeza' }
        }
      ];

      for (const testCase of testCases) {
        // Arrange
        mockRequest.body = testCase.dto;
        mockInterpretationService.interpretDream.mockResolvedValue(testCase.response);

        // Act
        await controller.interpret(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
          description: testCase.dto.description,
          ...testCase.response
        });
        expect(mockInterpretationService.interpretDream).toHaveBeenCalledWith(
          testCase.dto.description
        );

        // Reset mocks for next iteration
        mockInterpretationService.interpretDream.mockReset();
        (mockResponse.json as jest.Mock).mockClear();
      }
    });
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

  describe('DTO Validation Integration', () => {
    describe('InterpretDreamRequestDto', () => {
      it('should validate InterpretDreamRequestDto successfully with valid data', async () => {
        // Arrange
        const plainObject = {
          description: 'Soñé que nadaba en un océano de estrellas brillantes'
        };

        const dto = plainToClass(InterpreteDreamRequestDto, plainObject);

        // Act
        const errors = await validate(dto);

        // Assert
        expect(errors).toHaveLength(0);
        expect(dto.description).toBe(plainObject.description);
      });

      it('should fail validation for missing description', async () => {
        // Arrange
        const plainObject = {};

        const dto = plainToClass(InterpreteDreamRequestDto, plainObject);

        // Act
        const errors = await validate(dto);

        // Assert
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]?.property).toBe('description');
        expect(errors[0]?.constraints).toHaveProperty('isNotEmpty');
      });

      it('should fail validation for description too short', async () => {
        // Arrange
        const plainObject = {
          description: 'abc' // Menos de 10 caracteres
        };

        const dto = plainToClass(InterpreteDreamRequestDto, plainObject);

        // Act
        const errors = await validate(dto);

        // Assert
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]?.property).toBe('description');
        expect(errors[0]?.constraints).toHaveProperty('minLength');
      });

      it('should pass validation for long descriptions', async () => {
        // Arrange
        const plainObject = {
          description: 'Este es un sueño muy detallado donde estaba caminando por un bosque encantado lleno de criaturas mágicas y luces brillantes que danzaban entre los árboles'
        };

        const dto = plainToClass(InterpreteDreamRequestDto, plainObject);

        // Act
        const errors = await validate(dto);

        // Assert
        expect(errors).toHaveLength(0);
      });
    });

    describe('ReinterpreteDreamRequestDto', () => {
      it('should validate ReinterpreteDreamRequestDto successfully with valid data', async () => {
      // Arrange
      const plainObject = {
        description: 'Soñé que volaba sobre una ciudad desconocida',
        previousInterpretation: 'Tu sueño refleja el deseo de explorar nuevos horizontes'
      };

      const dto = plainToClass(ReinterpreteDreamRequestDto, plainObject);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
      expect(dto.description).toBe(plainObject.description);
      expect(dto.previousInterpretation).toBe(plainObject.previousInterpretation);
    });

    it('should fail validation for missing description', async () => {
      // Arrange
      const plainObject = {
        previousInterpretation: 'Tu sueño refleja el deseo de explorar nuevos horizontes'
        // description missing
      };

      const dto = plainToClass(ReinterpreteDreamRequestDto, plainObject);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.property).toBe('description');
      expect(errors[0]?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation for missing previousInterpretation', async () => {
      // Arrange
      const plainObject = {
        description: 'Soñé que volaba sobre una ciudad desconocida'
        // previousInterpretation missing
      };

      const dto = plainToClass(ReinterpreteDreamRequestDto, plainObject);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.property).toBe('previousInterpretation');
      expect(errors[0]?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation for description too short', async () => {
      // Arrange
      const plainObject = {
        description: 'abc', // Menos de 10 caracteres
        previousInterpretation: 'Tu sueño refleja el deseo de explorar nuevos horizontes'
      };

      const dto = plainToClass(ReinterpreteDreamRequestDto, plainObject);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.property).toBe('description');
      expect(errors[0]?.constraints).toHaveProperty('minLength');
    });

    it('should fail validation for previousInterpretation too short', async () => {
      // Arrange
      const plainObject = {
        description: 'Soñé que volaba sobre una ciudad desconocida',
        previousInterpretation: 'ab' // Menos de 10 caracteres
      };

      const dto = plainToClass(ReinterpreteDreamRequestDto, plainObject);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.property).toBe('previousInterpretation');
      expect(errors[0]?.constraints).toHaveProperty('minLength');
    });

    it('should pass validation for long descriptions', async () => {
      // Arrange
      const plainObject = {
        description: 'Este es un sueño muy largo con muchos detalles sobre una experiencia onírica compleja que incluye varios elementos simbólicos y narrativos que requieren interpretación detallada',
        previousInterpretation: 'La interpretación anterior sugería que este sueño complejo representa múltiples aspectos de tu psique y experiencias de vida que se manifiestan de manera simbólica'
      };

      const dto = plainToClass(ReinterpreteDreamRequestDto, plainObject);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
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

  describe('Integration with Service Layer for interpret', () => {
    it('should pass correct parameters from DTO to interpret service', async () => {
      // Arrange
      const requestBody = {
        description: 'Soñé que construía una casa en la playa'
      };

      const expectedResult: Interpretation = {
        title: 'Construcción de Nuevos Cimientos',
        interpretation: 'Construir una casa representa el deseo de establecer bases sólidas...',
        emotion: 'esperanza'
      };

      mockRequest.body = requestBody;
      mockInterpretationService.interpretDream.mockResolvedValue(expectedResult);

      // Act
      await controller.interpret(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockInterpretationService.interpretDream).toHaveBeenCalledTimes(1);
      expect(mockInterpretationService.interpretDream).toHaveBeenCalledWith(
        requestBody.description
      );
    });

    it('should handle different types of interpretations for interpret method', async () => {
      // Arrange
      const testCases = [
        {
          dto: { description: 'Soñé que plantaba un jardín hermoso' },
          response: { title: 'Crecimiento Personal', interpretation: 'Plantar jardines simboliza el cuidado y crecimiento personal...', emotion: 'esperanza' }
        },
        {
          dto: { description: 'Soñé que navegaba en aguas tranquilas' },
          response: { title: 'Paz Interior', interpretation: 'Navegar en aguas calmas representa equilibrio emocional...', emotion: 'tranquilidad' }
        },
        {
          dto: { description: 'Soñé que escalaba una montaña desafiante' },
          response: { title: 'Superación de Obstáculos', interpretation: 'Escalar montañas refleja tu determinación para superar desafíos...', emotion: 'determinación' }
        }
      ];

      for (const testCase of testCases) {
        // Arrange
        mockRequest.body = testCase.dto;
        mockInterpretationService.interpretDream.mockResolvedValue(testCase.response);

        // Act
        await controller.interpret(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
          description: testCase.dto.description,
          ...testCase.response
        });
        expect(mockInterpretationService.interpretDream).toHaveBeenCalledWith(
          testCase.dto.description
        );

        // Reset mocks for next iteration
        mockInterpretationService.interpretDream.mockReset();
        (mockResponse.json as jest.Mock).mockClear();
      }
    });
  });
});