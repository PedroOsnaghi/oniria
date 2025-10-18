import { InterpretationDreamService } from '../../../../src/application/services/interpretation-dream.service';
import { InterpretationProvider } from '../../../../src/domain/providers/interpretation.provider';
import { Interpretation } from '../../../../src/domain/interfaces/interpretation-dream.interface';

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
      const expectedResult: Interpretation = {
        title: 'Freedom and Liberation',
        interpretation: 'Flying in dreams often represents a desire for freedom and the ability to rise above challenges...',
        emotion: 'positive'
      };

      mockInterpretationProvider.interpretDream.mockResolvedValue(expectedResult);

      // Act
      const result = await service.interpretDream(dreamDescription);

      // Assert
      expect(mockInterpretationProvider.interpretDream).toHaveBeenCalledWith(dreamDescription);
      expect(mockInterpretationProvider.interpretDream).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when interpretation fails', async () => {
      // Arrange
      const dreamDescription = 'I dreamed about flying over mountains';
      const error = new Error('OpenAI API error');

      mockInterpretationProvider.interpretDream.mockRejectedValue(error);

      // Act & Assert
      await expect(service.interpretDream(dreamDescription)).rejects.toThrow('Error interpretando el sueño: OpenAI API error');
      expect(mockInterpretationProvider.interpretDream).toHaveBeenCalledWith(dreamDescription);
    });

    it('should handle empty dream description', async () => {
      // Arrange
      const dreamDescription = '';
      const expectedResult: Interpretation = {
        title: 'Descripción vacía',
        interpretation: 'No se puede interpretar un sueño sin descripción',
        emotion: 'neutral'
      };

      mockInterpretationProvider.interpretDream.mockResolvedValue(expectedResult);

      // Act
      const result = await service.interpretDream(dreamDescription);

      // Assert
      expect(mockInterpretationProvider.interpretDream).toHaveBeenCalledWith(dreamDescription);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('reinterpretDream', () => {
    it('should successfully reinterpret a dream with previous interpretation', async () => {
      // Arrange
      const dreamDescription = 'I dreamed about falling from a cliff';
      const previousInterpretation = 'This dream represents fear of losing control in your life';
      const expectedResult: Interpretation = {
        title: 'Transformation and Change',
        interpretation: 'Falling dreams can also symbolize letting go and embracing change, representing a transition to new opportunities...',
        emotion: 'neutral'
      };

      mockInterpretationProvider.reinterpretDream.mockResolvedValue(expectedResult);

      // Act
      const result = await service.reinterpretDream(dreamDescription, previousInterpretation);

      // Assert
      expect(mockInterpretationProvider.reinterpretDream).toHaveBeenCalledWith(
        dreamDescription,
        previousInterpretation
      );
      expect(mockInterpretationProvider.reinterpretDream).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when reinterpretation fails', async () => {
      // Arrange
      const dreamDescription = 'I dreamed about water';
      const previousInterpretation = 'Water represents emotions';
      const error = new Error('Provider unavailable');

      mockInterpretationProvider.reinterpretDream.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.reinterpretDream(dreamDescription, previousInterpretation)
      ).rejects.toThrow('Error reinterpretando el sueño: Provider unavailable');

      expect(mockInterpretationProvider.reinterpretDream).toHaveBeenCalledWith(
        dreamDescription,
        previousInterpretation
      );
    });

    it('should handle empty previous interpretation', async () => {
      // Arrange
      const dreamDescription = 'I dreamed about a storm';
      const previousInterpretation = '';
      const expectedResult: Interpretation = {
        title: 'Desafío y Turbulencia',
        interpretation: 'Las tormentas en los sueños a menudo representan períodos de desafío o cambio emocional...',
        emotion: 'negative'
      };

      mockInterpretationProvider.reinterpretDream.mockResolvedValue(expectedResult);

      // Act
      const result = await service.reinterpretDream(dreamDescription, previousInterpretation);

      // Assert
      expect(mockInterpretationProvider.reinterpretDream).toHaveBeenCalledWith(
        dreamDescription,
        previousInterpretation
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle both empty description and previous interpretation', async () => {
      // Arrange
      const dreamDescription = '';
      const previousInterpretation = '';
      const expectedResult: Interpretation = {
        title: 'Información insuficiente',
        interpretation: 'No se puede reinterpretar sin información suficiente sobre el sueño',
        emotion: 'neutral'
      };

      mockInterpretationProvider.reinterpretDream.mockResolvedValue(expectedResult);

      // Act
      const result = await service.reinterpretDream(dreamDescription, previousInterpretation);

      // Assert
      expect(mockInterpretationProvider.reinterpretDream).toHaveBeenCalledWith('', '');
      expect(result).toEqual(expectedResult);
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
