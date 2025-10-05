import { InterpretationOpenAIProvider } from '../../../../src/infrastructure/providers/interpretation-openAI.provider';
import { OpenAI } from 'openai';

// Mock de OpenAI
jest.mock('openai');
const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

// Mock de envs
jest.mock('../../../../src/config/envs', () => ({
  envs: {
    OPENAI_API_KEY: 'test-api-key'
  }
}));

describe('InterpretationOpenAIProvider', () => {
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
          create: mockChatCompletions
        }
      }
    } as any;

    // Mock del constructor de OpenAI
    MockedOpenAI.mockImplementation(() => mockOpenAI);

    provider = new InterpretationOpenAIProvider();
  });

  describe('constructor', () => {
    it('should initialize OpenAI with correct API key', () => {
      expect(MockedOpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key'
      });
    });
  });

  describe('interpretDream', () => {
    const dreamText = 'Soñé que volaba sobre montañas';
    
    it('should interpret dream successfully with valid JSON response', async () => {
      // Arrange
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Vuelo sobre montañas',
              interpretation: 'Este sueño representa tu deseo de libertad y superación personal.',
              emotion: 'felicidad'
            })
          }
        }]
      };
      
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: 'Vuelo sobre montañas',
        interpretation: 'Este sueño representa tu deseo de libertad y superación personal.',
        emotion: 'Felicidad'
      });

      expect(mockChatCompletions).toHaveBeenCalledWith({
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

    it('should handle invalid JSON response gracefully', async () => {
      // Arrange
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response from OpenAI'
          }
        }]
      };
      
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: 'Interpretación de Sueño',
        interpretation: 'Invalid JSON response from OpenAI',
        emotion: 'Tristeza'
      });
    });

    it('should handle empty response gracefully', async () => {
      // Arrange
      const mockResponse = {
        choices: [{
          message: {
            content: ''
          }
        }]
      };
      
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: 'Interpretación de Sueño',
        interpretation: 'No se pudo interpretar el sueño.',
        emotion: 'Tristeza'
      });
    });

    it('should handle missing choices in response', async () => {
      // Arrange
      const mockResponse = { choices: [] };
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: 'Interpretación de Sueño',
        interpretation: 'No se pudo interpretar el sueño.',
        emotion: 'Tristeza'
      });
    });

    it('should capitalize emotion correctly', async () => {
      // Arrange
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test Title',
              interpretation: 'Test interpretation',
              emotion: 'miedo'
            })
          }
        }]
      };
      
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result.emotion).toBe('Miedo');
    });

    it('should handle partial JSON response', async () => {
      // Arrange
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Partial Response',
              // Missing interpretation and emotion
            })
          }
        }]
      };
      
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream(dreamText);

      // Assert
      expect(result).toEqual({
        title: 'Partial Response',
        interpretation: 'No se pudo interpretar el sueño.',
        emotion: 'Tristeza'
      });
    });

    it('should throw error when OpenAI API fails', async () => {
      // Arrange
      const apiError = new Error('OpenAI API Error');
      mockChatCompletions.mockRejectedValue(apiError);

      // Act & Assert
      await expect(provider.interpretDream(dreamText)).rejects.toThrow('OpenAI API Error');
    });

    it('should handle OpenAI API error without message', async () => {
      // Arrange
      mockChatCompletions.mockRejectedValue(new Error());

      // Act & Assert
      await expect(provider.interpretDream(dreamText)).rejects.toThrow('Error al interpretar el sueño.');
    });
  });

  describe('reinterpretDream', () => {
    const dreamText = 'Soñé que volaba sobre montañas';
    const previousInterpretation = 'Este sueño representa libertad y éxito.';
    
    it('should reinterpret dream successfully with valid JSON response', async () => {
      // Arrange
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Miedo a las alturas',
              interpretation: 'Este sueño puede reflejar ansiedad y miedo al fracaso.',
              emotion: 'miedo'
            })
          }
        }]
      };
      
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      expect(result).toEqual({
        title: 'Miedo a las alturas',
        interpretation: 'Este sueño puede reflejar ansiedad y miedo al fracaso.',
        emotion: 'Miedo'
      });

      expect(mockChatCompletions).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('RADICALMENTE OPUESTAS')
          },
          {
            role: 'user',
            content: expect.stringContaining('IGNORA COMPLETAMENTE la interpretación anterior')
          }
        ],
        max_tokens: 200,
        temperature: 1.1
      });
    });

    it('should include previous interpretation in prompt', async () => {
      // Arrange
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'New Title',
              interpretation: 'New interpretation',
              emotion: 'tristeza'
            })
          }
        }]
      };
      
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      const callArgs = mockChatCompletions.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');
      
      expect(userMessage.content).toContain(dreamText);
      expect(userMessage.content).toContain(previousInterpretation);
    });

    it('should use high temperature for creative reinterpretation', async () => {
      // Arrange
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Creative Title',
              interpretation: 'Creative interpretation',
              emotion: 'enojo'
            })
          }
        }]
      };
      
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      expect(mockChatCompletions).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 1.1
        })
      );
    });

    it('should handle invalid JSON in reinterpretation', async () => {
      // Arrange
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON for reinterpretation'
          }
        }]
      };
      
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      expect(result).toEqual({
        title: 'Nueva Perspectiva',
        interpretation: 'Invalid JSON for reinterpretation',
        emotion: 'Tristeza'
      });
    });

    it('should throw error when reinterpretation API fails', async () => {
      // Arrange
      const apiError = new Error('Reinterpretation API Error');
      mockChatCompletions.mockRejectedValue(apiError);

      // Act & Assert
      await expect(provider.reinterpretDream(dreamText, previousInterpretation)).rejects.toThrow('Reinterpretation API Error');
    });

    it('should handle reinterpretation error without message', async () => {
      // Arrange
      mockChatCompletions.mockRejectedValue({});

      // Act & Assert
      await expect(provider.reinterpretDream(dreamText, previousInterpretation)).rejects.toThrow('Error al reinterpretar el sueño.');
    });

    it('should capitalize emotion in reinterpretation', async () => {
      // Arrange
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test Title',
              interpretation: 'Test interpretation',
              emotion: 'enojo'
            })
          }
        }]
      };
      
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.reinterpretDream(dreamText, previousInterpretation);

      // Assert
      expect(result.emotion).toBe('Enojo');
    });
  });

  describe('edge cases', () => {
    it('should handle null response content', async () => {
      // Arrange
      const mockResponse = {
        choices: [{
          message: {
            content: null
          }
        }]
      };
      
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream('test dream');

      // Assert
      expect(result).toEqual({
        title: 'Interpretación de Sueño',
        interpretation: 'No se pudo interpretar el sueño.',
        emotion: 'Tristeza'
      });
    });

    it('should handle undefined response content', async () => {
      // Arrange
      const mockResponse = {
        choices: [{
          message: {}
        }]
      };
      
      mockChatCompletions.mockResolvedValue(mockResponse);

      // Act
      const result = await provider.interpretDream('test dream');

      // Assert
      expect(result).toEqual({
        title: 'Interpretación de Sueño',
        interpretation: 'No se pudo interpretar el sueño.',
        emotion: 'Tristeza'
      });
    });
  });
});