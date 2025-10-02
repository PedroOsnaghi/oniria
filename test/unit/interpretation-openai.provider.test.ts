import { InterpretationOpenAIProvider } from '../../src/infrastructure/providers/interpretation-openAI.provider';
import { OpenAI } from 'openai';
import { envs } from '../../src/config/envs';

// Mock OpenAI
jest.mock('openai');
jest.mock('../../src/config/envs', () => ({
  envs: {
    OPENAI_API_KEY: 'test-api-key'
  }
}));

describe('InterpretationOpenAIProvider', () => {
  let provider: InterpretationOpenAIProvider;
  let mockOpenAI: jest.Mocked<OpenAI>;
  let mockCreate: jest.MockedFunction<any>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock for OpenAI chat.completions.create
    mockCreate = jest.fn();
    mockOpenAI = {
      chat: {
        completions: {
          create: mockCreate
        }
      }
    } as any;

    // Mock OpenAI constructor
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAI);

    // Create provider instance
    provider = new InterpretationOpenAIProvider();
  });

  describe('constructor', () => {
    it('should initialize with OpenAI API key from environment', () => {
      // Assert
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key'
      });
    });
  });

  describe('interpretDream', () => {
    it('should successfully interpret a dream with valid JSON response', async () => {
      // Arrange
      const dreamText = 'Soñé que volaba sobre montañas';
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Vuelo de Libertad',
              interpretation: 'Este sueño representa tu deseo de libertad y superación.',
              emotion: 'felicidad'
            })
          }
        }]
      };

      mockCreate.mockResolvedValue(mockOpenAIResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: 'Vuelo de Libertad',
        interpretation: 'Este sueño representa tu deseo de libertad y superación.',
        emotion: 'Felicidad' // Note: should be capitalized
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('Eres un psicólogo especialista en interpretación de sueños')
          },
          {
            role: 'user',
            content: expect.stringContaining(dreamText)
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      });
    });

    it('should handle invalid JSON response from OpenAI gracefully', async () => {
      // Arrange
      const dreamText = 'Soñé que caía al vacío';
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: 'This is not valid JSON response from OpenAI'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockOpenAIResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: 'Interpretación de Sueño',
        interpretation: 'This is not valid JSON response from OpenAI',
        emotion: 'Tristeza'
      });
    });

    it('should handle empty response from OpenAI', async () => {
      // Arrange
      const dreamText = 'Sueño vacío';
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: ''
          }
        }]
      };

      mockCreate.mockResolvedValue(mockOpenAIResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: 'Interpretación de Sueño',
        interpretation: 'No se pudo interpretar el sueño.',
        emotion: 'Tristeza'
      });
    });

    it('should handle missing choices in OpenAI response', async () => {
      // Arrange
      const dreamText = 'Soñé con algo extraño';
      const mockOpenAIResponse = {
        choices: []
      };

      mockCreate.mockResolvedValue(mockOpenAIResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: 'Interpretación de Sueño',
        interpretation: 'No se pudo interpretar el sueño.',
        emotion: 'Tristeza'
      });
    });

    it('should handle partial JSON response with missing fields', async () => {
      // Arrange
      const dreamText = 'Soñé que nadaba';
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Agua y Emociones'
              // missing interpretation and emotion
            })
          }
        }]
      };

      mockCreate.mockResolvedValue(mockOpenAIResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: 'Agua y Emociones',
        interpretation: 'No se pudo interpretar el sueño.',
        emotion: 'Tristeza'
      });
    });

    it('should capitalize emotion correctly', async () => {
      // Arrange
      const dreamText = 'Sueño feliz';
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Sueño Positivo',
              interpretation: 'Un sueño lleno de alegría.',
              emotion: 'felicidad'
            })
          }
        }]
      };

      mockCreate.mockResolvedValue(mockOpenAIResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result.emotion).toBe('Felicidad');
    });

    it('should throw error when OpenAI API fails', async () => {
      // Arrange
      const dreamText = 'Soñé algo';
      const apiError = new Error('OpenAI API rate limit exceeded');

      mockCreate.mockRejectedValue(apiError);

      // Act & Assert
      await expect(provider.interpretDream(dreamText)).rejects.toThrow('OpenAI API rate limit exceeded');
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should throw generic error when OpenAI fails without message', async () => {
      // Arrange
      const dreamText = 'Soñé algo raro';
      const apiError = new Error();

      mockCreate.mockRejectedValue(apiError);

      // Act & Assert
      await expect(provider.interpretDream(dreamText)).rejects.toThrow('Error al interpretar el sueño.');
    });
  });

  describe('reinterpretDream', () => {
    it('should successfully reinterpret a dream with valid JSON response', async () => {
      // Arrange
      const dreamText = 'Soñé que volaba';
      const previousInterpretation = 'Representa libertad y superación';
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Escape de la Realidad',
              interpretation: 'Este sueño puede indicar una tendencia a evitar responsabilidades.',
              emotion: 'miedo'
            })
          }
        }]
      };

      mockCreate.mockResolvedValue(mockOpenAIResponse);

      // Act
      const result = await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      expect(result).toEqual({
        title: 'Escape de la Realidad',
        interpretation: 'Este sueño puede indicar una tendencia a evitar responsabilidades.',
        emotion: 'Miedo'
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('interpretaciones RADICALMENTE OPUESTAS')
          },
          {
            role: 'user',
            content: expect.stringContaining(dreamText) && 
                     expect.stringContaining(previousInterpretation)
          }
        ],
        max_tokens: 200,
        temperature: 1.1
      });
    });

    it('should use higher temperature for more creative opposite interpretations', async () => {
      // Arrange
      const dreamText = 'Soñé con agua';
      const previousInterpretation = 'El agua representa purificación';
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Turbulencia Emocional',
              interpretation: 'El agua en este contexto sugiere emociones reprimidas.',
              emotion: 'tristeza'
            })
          }
        }]
      };

      mockCreate.mockResolvedValue(mockOpenAIResponse);

      // Act
      await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 1.1
        })
      );
    });

    it('should handle invalid JSON response in reinterpretation', async () => {
      // Arrange
      const dreamText = 'Soñé con fuego';
      const previousInterpretation = 'El fuego representa pasión';
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response about fire being destructive'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockOpenAIResponse);

      // Act
      const result = await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      expect(result).toEqual({
        title: 'Nueva Perspectiva',
        interpretation: 'Invalid JSON response about fire being destructive',
        emotion: 'Tristeza'
      });
    });

    it('should handle empty dream text and previous interpretation', async () => {
      // Arrange
      const dreamText = '';
      const previousInterpretation = '';
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Vacío Interpretativo',
              interpretation: 'Sin información suficiente para interpretar.',
              emotion: 'tristeza'
            })
          }
        }]
      };

      mockCreate.mockResolvedValue(mockOpenAIResponse);

      // Act
      const result = await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      expect(result).toEqual({
        title: 'Vacío Interpretativo',
        interpretation: 'Sin información suficiente para interpretar.',
        emotion: 'Tristeza'
      });
    });

    it('should throw error when reinterpretation API fails', async () => {
      // Arrange
      const dreamText = 'Soñé con montañas';
      const previousInterpretation = 'Las montañas representan desafíos';
      const apiError = new Error('OpenAI service temporarily unavailable');

      mockCreate.mockRejectedValue(apiError);

      // Act & Assert
      await expect(
        provider.reinterpretDream(dreamText, previousInterpretation)
      ).rejects.toThrow('OpenAI service temporarily unavailable');
    });

    it('should include contradiction instructions in the prompt', async () => {
      // Arrange
      const dreamText = 'Soñé que corría';
      const previousInterpretation = 'Correr indica progreso y avance';
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Huida y Evasión',
              interpretation: 'Correr puede indicar que estás huyendo de algo.',
              emotion: 'miedo'
            })
          }
        }]
      };

      mockCreate.mockResolvedValue(mockOpenAIResponse);

      // Act
      await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      const callArgs = mockCreate.mock.calls[0][0];
      const userMessage = callArgs.messages[1].content;
      
      expect(userMessage).toContain('IGNORA COMPLETAMENTE la interpretación anterior');
      expect(userMessage).toContain('perspectiva RADICALMENTE OPUESTA');
      expect(userMessage).toContain(previousInterpretation);
    });
  });

  describe('error handling', () => {
    it('should log errors to console when interpretation fails', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const dreamText = 'Test dream';
      const error = new Error('Network error');

      mockCreate.mockRejectedValue(error);

      // Act & Assert
      await expect(provider.interpretDream(dreamText)).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Error en InterpretationOpenIAProvider:', error);

      consoleSpy.mockRestore();
    });

    it('should log JSON parsing errors to console', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const dreamText = 'Test dream';
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: '{ invalid json syntax'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockOpenAIResponse);

      // Act
      await provider.interpretDream(dreamText);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Error parseando JSON de OpenAI:', expect.any(SyntaxError));

      consoleSpy.mockRestore();
    });
  });
});