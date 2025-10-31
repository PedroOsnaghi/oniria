import { InterpretationDreamService } from '../../../../src/application/services/interpretation-dream.service';
import { InterpretationProvider } from '../../../../src/domain/providers/interpretation.provider';
import { Interpretation, DreamContext as IDreamContext } from '../../../../src/domain/interfaces/interpretation-dream.interface';
import { DreamTypeName } from '../../../../src/domain/models/dream_type.model';

describe('InterpretationDreamService', () => {
  let service: InterpretationDreamService;
  let mockInterpretationProvider: jest.Mocked<InterpretationProvider>;

  beforeEach(() => {
    // Create mock provider
    mockInterpretationProvider = {
      interpretDream: jest.fn(),
      reinterpretDream: jest.fn(),
    };

    // Initialize service with mock provider
    service = new InterpretationDreamService(mockInterpretationProvider);
  });

  describe('interpretDream', () => {
    it('should successfully interpret a dream', async () => {
      // Arrange
      const dreamDescription = 'I dreamed about flying over mountains';
      const dreamContext: IDreamContext = {
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      };
      const expectedResult: Interpretation = {
        title: 'Freedom and Liberation',
        interpretation: 'Flying in dreams often represents a desire for freedom and the ability to rise above challenges...',
        emotion: 'positive',
        dreamType: 'Estandar',
        dreamTypeReason: '',
        context: dreamContext
      };

      mockInterpretationProvider.interpretDream.mockResolvedValue(expectedResult);

      // Act
      const result = await service.interpretDream(dreamDescription, dreamContext);

      // Assert
      expect(mockInterpretationProvider.interpretDream).toHaveBeenCalledWith(dreamDescription, dreamContext);
      expect(mockInterpretationProvider.interpretDream).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when interpretation fails', async () => {
      // Arrange
      const dreamDescription = 'I dreamed about flying over mountains';
      const dreamContext: IDreamContext = {
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      };
      const error = new Error('OpenAI API error');

      mockInterpretationProvider.interpretDream.mockRejectedValue(error);

      // Act & Assert
      await expect(service.interpretDream(dreamDescription, dreamContext)).rejects.toThrow('Error interpretando el sueño: OpenAI API error');
      expect(mockInterpretationProvider.interpretDream).toHaveBeenCalledWith(dreamDescription, dreamContext);
    });

    it('should handle empty dream description', async () => {
      // Arrange
      const dreamDescription = '';
      const dreamContext: IDreamContext = {
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      };
      const expectedResult: Interpretation = {
        title: 'Descripción vacía',
        interpretation: 'No se puede interpretar un sueño sin descripción',
        emotion: 'neutral',
        context: dreamContext,
        dreamType: 'Estandar',
        dreamTypeReason: ''
      };

      mockInterpretationProvider.interpretDream.mockResolvedValue(expectedResult);

      // Act
      const result = await service.interpretDream(dreamDescription, dreamContext);

      // Assert
      expect(mockInterpretationProvider.interpretDream).toHaveBeenCalledWith(dreamDescription, dreamContext);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('reinterpretDream', () => {
    it('should successfully reinterpret a dream with previous interpretation', async () => {
      // Arrange
      const dreamDescription = 'I dreamed about falling from a cliff';
      const previousInterpretation = 'This dream represents fear of losing control in your life';
      const dreamContext: IDreamContext = {
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      };
      const expectedResult: Interpretation = {
        title: 'Transformation and Change',
        interpretation: 'Falling dreams can also symbolize letting go and embracing change, representing a transition to new opportunities...',
        emotion: 'neutral',
        context: dreamContext,
        dreamType: 'Estandar',
        dreamTypeReason: ''
      };

      mockInterpretationProvider.reinterpretDream.mockResolvedValue(expectedResult);

      // Act
      const result = await service.reinterpretDream(dreamDescription, previousInterpretation, dreamContext);

      // Assert
      expect(mockInterpretationProvider.reinterpretDream).toHaveBeenCalledWith(
        dreamDescription,
        previousInterpretation,
        dreamContext
      );
      expect(mockInterpretationProvider.reinterpretDream).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when reinterpretation fails', async () => {
      // Arrange
      const dreamDescription = 'I dreamed about water';
      const previousInterpretation = 'Water represents emotions';
      const error = new Error('Provider unavailable');

      const dreamContext: IDreamContext = {
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      };
      mockInterpretationProvider.reinterpretDream.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.reinterpretDream(dreamDescription, previousInterpretation, dreamContext)
      ).rejects.toThrow('Error reinterpretando el sueño: Provider unavailable');

      expect(mockInterpretationProvider.reinterpretDream).toHaveBeenCalledWith(
        dreamDescription,
        previousInterpretation,
        dreamContext
      );
    });

    it('should handle empty previous interpretation', async () => {
      // Arrange
      const dreamDescription = 'I dreamed about a storm';
      const previousInterpretation = '';
      const dreamContext: IDreamContext = {
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      };
      const expectedResult: Interpretation = {
        title: 'Desafío y Turbulencia',
        interpretation: 'Las tormentas en los sueños a menudo representan períodos de desafío o cambio emocional...',
        emotion: 'negative',
        context: dreamContext,
        dreamType: 'Estandar',
        dreamTypeReason: ''
      };

      mockInterpretationProvider.reinterpretDream.mockResolvedValue(expectedResult);

      // Act
      const result = await service.reinterpretDream(dreamDescription, previousInterpretation, dreamContext);

      // Assert
      expect(mockInterpretationProvider.reinterpretDream).toHaveBeenCalledWith(
        dreamDescription,
        previousInterpretation,
        dreamContext
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle both empty description and previous interpretation', async () => {
      // Arrange
      const dreamDescription = '';
      const previousInterpretation = '';
      const dreamContext: IDreamContext = {
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      };
      const expectedResult: Interpretation = {
        title: 'Información insuficiente',
        interpretation: 'No se puede reinterpretar sin información suficiente sobre el sueño',
        emotion: 'neutral',
        context: dreamContext,
        dreamType: 'Estandar',
        dreamTypeReason: ''
      };

      mockInterpretationProvider.reinterpretDream.mockResolvedValue(expectedResult);

      // Act
      const result = await service.reinterpretDream(dreamDescription, previousInterpretation, dreamContext);

      // Assert
      expect(mockInterpretationProvider.reinterpretDream).toHaveBeenCalledWith('', '', dreamContext);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('dream types', () => {
    const dreamContext: IDreamContext = {
      themes: [],
      people: [],
      locations: [],
      emotions_context: []
    };

    interface DreamExample {
      description: string;
      type: DreamTypeName;
      reason: string;
      validReasons?: string[];
    }

    const dreamExamples: DreamExample[] = [
      {
        description: 'Soñé que volaba sobre un bosque verde mientras el sol salía en el horizonte.',
        type: 'Estandar',
        reason: 'Sueño típico sin características especiales'
      },
      {
        description: 'Soñé que estaba dentro de un sueño y podía controlar todo, desde el clima hasta mis movimientos.',
        type: 'Lucido',
        reason: 'El soñador es consciente de que está soñando y puede controlar el sueño'
      },
      {
        description: 'Soñé otra vez que corría por un pasillo infinito sin poder encontrar la salida.',
        type: 'Recurrente',
        reason: 'Sueño que se repite con poca o ninguna variación'
      },
      {
        description: 'Soñé con un accidente de auto, y al día siguiente escuché que realmente había ocurrido uno en el mismo lugar.',
        type: 'Premonitorio' as DreamTypeName,
        reason: 'alta',
        validReasons: ['alta', 'media', 'baja']
      },
      {
        description: 'Soñé que me perseguía una sombra oscura por una ciudad vacía y no podía escapar.',
        type: 'Pesadilla',
        reason: 'Sueño que causa miedo intenso o angustia'
      }
    ];

    dreamExamples.forEach(({ description, type, reason }) => {
      const dreamType = type as DreamTypeName; // Ensure type safety
      it(`should handle ${type} dream type correctly`, async () => {
        // Arrange
        const expectedResult: Interpretation = {
          title: `Título para sueño ${type}`,
          interpretation: `Interpretación del sueño ${type}`,
          emotion: type === 'Pesadilla' ? 'negative' : 'neutral',
          dreamType: dreamType,
          dreamTypeReason: reason,
          context: dreamContext
        };

        mockInterpretationProvider.interpretDream.mockResolvedValue(expectedResult);

        // Act
        const result = await service.interpretDream(description, dreamContext);

        // Assert
        expect(mockInterpretationProvider.interpretDream).toHaveBeenCalledWith(description, dreamContext);
        expect(result.dreamType).toBe(dreamType);
        // For Premonitorio type, check if the reason is one of the valid values
        if (type === 'Premonitorio') {
          expect(['alta', 'media', 'baja']).toContain(result.dreamTypeReason);
        } else {
          expect(result.dreamTypeReason).toBe(reason);
        }
        expect(result.emotion).toBe(dreamType === 'Pesadilla' ? 'negative' : 'neutral');
      });
    });
  });

  describe('service initialization', () => {
    it('should initialize with interpretation provider', () => {
      // Act
      const newService = new InterpretationDreamService(mockInterpretationProvider);

      // Assert
      expect(newService).toBeInstanceOf(InterpretationDreamService);
    });
  });
});
