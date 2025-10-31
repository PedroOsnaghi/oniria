import { StatisticsService } from '../../../../src/application/services/statistics.service';
import { IDreamNodeRepository } from '../../../../src/domain/repositories/dream-node.repository';
import { DreamContextService } from '../../../../src/application/services/dream-context.service';
import { IDreamNode, Emotion, DreamTypeName, DreamPrivacy, DreamState } from '../../../../src/domain/models/dream-node.model';
import { IDreamContext } from '../../../../src/domain/interfaces/dream-context.interface';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let mockDreamNodeRepository: jest.Mocked<IDreamNodeRepository>;
  let mockDreamContextService: jest.Mocked<DreamContextService>;

  const mockUserId = 'user-123';
  // Set fixed dates for consistent testing
  const now = new Date('2025-10-31T12:00:00.000Z');
  // 5 days ago (within the last week)
  const oneWeekAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  // 10 days ago (more than a week ago)
  const twoWeeksAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const mockNodes: IDreamNode[] = [
    {
      id: '1',
      title: 'Dream 1',
      dream_description: 'Description 1',
      interpretation: 'Interpretation 1',
      emotion: 'Felicidad' as Emotion,
      type: 'Estandar' as DreamTypeName,
      privacy: 'Publico' as DreamPrivacy,
      state: 'Activo' as DreamState,
      creationDate: now,
      imageUrl: 'image1.jpg'
    },
    {
      id: '2',
      title: 'Dream 2',
      dream_description: 'Description 2',
      interpretation: 'Interpretation 2',
      emotion: 'Tristeza' as Emotion,
      type: 'Pesadilla' as DreamTypeName,
      privacy: 'Privado' as DreamPrivacy,
      state: 'Activo' as DreamState,
      creationDate: oneWeekAgo,
      imageUrl: ''
    },
    {
      id: '3',
      title: 'Dream 3',
      dream_description: 'Description 3',
      interpretation: 'Interpretation 3',
      emotion: 'Miedo' as Emotion,
      type: 'Recurrente' as DreamTypeName,
      privacy: 'Publico' as DreamPrivacy,
      state: 'Activo' as DreamState,
      creationDate: twoWeeksAgo,
      imageUrl: 'image3.jpg'
    }
  ];

  const mockDreamContext: IDreamContext = {
    themes: [
      { label: 'Aventura', count: 5 },
      { label: 'Pesadilla', count: 3 },
      { label: 'Volar', count: 2 }
    ],
    people: [
      { label: 'Juan', count: 4 },
      { label: 'María', count: 2 },
      { label: 'Roberto', count: 1 }
    ],
    locations: [
      { label: 'Playa', count: 3 },
      { label: 'Bosque', count: 2 },
      { label: 'Ciudad', count: 1 }
    ],
    emotions_context: [
      { label: 'Felicidad', count: 4 },
      { label: 'Miedo', count: 2 },
      { label: 'Emoción', count: 1 }
    ]
  };

  beforeEach(() => {
    mockDreamNodeRepository = {
      getUserNodes: jest.fn(),
      save: jest.fn(),
      countUserNodes: jest.fn(),
      addDreamContext: jest.fn()
    } as unknown as jest.Mocked<IDreamNodeRepository>;

    mockDreamContextService = {
      getUserDreamContext: jest.fn(),
      updateDreamContext: jest.fn(),
      getContextFromText: jest.fn()
    } as unknown as jest.Mocked<DreamContextService>;

    service = new StatisticsService(
      mockDreamNodeRepository,
      mockDreamContextService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserStatistics', () => {
    it('should return complete user statistics', async () => {
      // Arrange
      mockDreamNodeRepository.getUserNodes.mockResolvedValue(mockNodes);
      mockDreamContextService.getUserDreamContext.mockResolvedValue(mockDreamContext);

      // Act
      const result = await service.getUserStatistics(mockUserId);

      // Assert
      expect(result).toEqual({
        totalInterpretations: 3,
        weeklyInterpretations: 2, // 2 nodes from the last week
        sharedNodes: 2, // 2 public nodes
        contextStats: {
          topPlaces: [
            { name: 'Playa', count: 3 },
            { name: 'Bosque', count: 2 },
            { name: 'Ciudad', count: 1 }
          ],
          topEmotions: [
            { name: 'Felicidad', count: 4 },
            { name: 'Miedo', count: 2 },
            { name: 'Emoción', count: 1 }
          ],
          topPeople: [
            { name: 'Juan', count: 4 },
            { name: 'María', count: 2 },
            { name: 'Roberto', count: 1 }
          ],
          topThemes: [
            { name: 'Aventura', count: 5 },
            { name: 'Pesadilla', count: 3 },
            { name: 'Volar', count: 2 }
          ]
        }
      });
    });

    it('should handle empty nodes array', async () => {
      // Arrange
      mockDreamNodeRepository.getUserNodes.mockResolvedValue([]);
      mockDreamContextService.getUserDreamContext.mockResolvedValue({
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      });

      // Act
      const result = await service.getUserStatistics(mockUserId);

      // Assert
      expect(result).toEqual({
        totalInterpretations: 0,
        weeklyInterpretations: 0,
        sharedNodes: 0,
        contextStats: {
          topPlaces: [],
          topEmotions: [],
          topPeople: [],
          topThemes: []
        }
      });
    });
  });

  describe('getTotalInterpretations', () => {
    it('should return the total number of nodes', () => {
      // Act
      const result = service['getTotalInterpretations'](mockNodes);

      // Assert
      expect(result).toBe(3);
    });
  });

  describe('getWeeklyInterpretations', () => {
    it('should return the number of nodes from the last week', () => {
      // Act
      const result = service['getWeeklyInterpretations'](mockNodes);

      // Assert
      expect(result).toBe(2); // 2 nodes from the last week
    });
  });

  describe('getSharedNodesCount', () => {
    it('should return the number of public nodes', () => {
      // Act
      const result = service['getSharedNodesCount'](mockNodes);

      // Assert
      expect(result).toBe(2); // 2 public nodes
    });
  });


  describe('getContextStatistics', () => {
    it('should return the top items for each context category', () => {
      // Act
      const result = service['getContextStatistics'](mockDreamContext);

      // Assert
      expect(result).toEqual({
        topPlaces: [
          { name: 'Playa', count: 3 },
          { name: 'Bosque', count: 2 },
          { name: 'Ciudad', count: 1 }
        ],
        topEmotions: [
          { name: 'Felicidad', count: 4 },
          { name: 'Miedo', count: 2 },
          { name: 'Emoción', count: 1 }
        ],
        topPeople: [
          { name: 'Juan', count: 4 },
          { name: 'María', count: 2 },
          { name: 'Roberto', count: 1 }
        ],
        topThemes: [
          { name: 'Aventura', count: 5 },
          { name: 'Pesadilla', count: 3 },
          { name: 'Volar', count: 2 }
        ]
      });
    });
  });

  describe('getTopItems', () => {
    it('should return top N items sorted by count in descending order', () => {
      // Arrange
      const items = [
        { label: 'A', count: 1 },
        { label: 'B', count: 3 },
        { label: 'C', count: 2 },
        { label: 'D', count: 5 },
        { label: 'E', count: 4 }
      ];

      // Act
      const result = (service as any)['getTopItems'](items, 3);

      // Assert
      expect(result).toEqual([
        { name: 'D', count: 5 },
        { name: 'E', count: 4 },
        { name: 'B', count: 3 }
      ]);
    });

    it('should return empty array when input is not an array', () => {
      // Act & Assert
      expect((service as any)['getTopItems'](null, 3)).toEqual([]);
      expect((service as any)['getTopItems'](undefined, 3)).toEqual([]);
      expect((service as any)['getTopItems']('not an array', 3)).toEqual([]);
    });
  });

  describe('getUserDreamContext', () => {
    it('should return dream context from the service', async () => {
      // Arrange
      mockDreamContextService.getUserDreamContext.mockResolvedValue(mockDreamContext);

      // Act
      const result = await (service as any)['getUserDreamContext'](mockUserId);

      // Assert
      expect(result).toEqual(mockDreamContext);
      expect(mockDreamContextService.getUserDreamContext).toHaveBeenCalledWith(mockUserId);
    });

    it('should return empty context on error', async () => {
      // Arrange
      mockDreamContextService.getUserDreamContext.mockRejectedValue(new Error('Service error'));

      // Act
      const result = await (service as any)['getUserDreamContext'](mockUserId);

      // Assert
      expect(result).toEqual({
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      });
    });
  });

  describe('getUserNodes', () => {
    it('should return user nodes from the repository', async () => {
      // Arrange
      mockDreamNodeRepository.getUserNodes.mockResolvedValue(mockNodes);

      // Act
      const result = await (service as any)['getUserNodes'](mockUserId);

      // Assert
      expect(result).toEqual(mockNodes);
      expect(mockDreamNodeRepository.getUserNodes).toHaveBeenCalledWith(
        mockUserId,
        { state: 'Activo' },
        { page: 1, limit: 1000 }
      );
    });

    it('should return empty array on error', async () => {
      // Arrange
      mockDreamNodeRepository.getUserNodes.mockRejectedValue(new Error('Repository error'));

      // Act
      const result = await (service as any)['getUserNodes'](mockUserId);

      // Assert
      expect(result).toEqual([]);
    });
  });
});