import { DreamNodeService } from '../../../../src/application/services/dream-node.service';
import { IDreamNodeRepository } from '../../../../src/domain/repositories/dream-node.repository';
import { IDreamNodeFilters } from '../../../../src/domain/interfaces/dream-node-filters.interface';
import { IPaginationOptions } from '../../../../src/domain/interfaces/pagination.interface';
import { IDreamNode} from '../../../../src/domain/models/dream-node.model';
import { dreamNodeMock, dreamNodeMockTwo } from '../../mocks/dream-node.mock';
import { testUser } from '../../mocks/user-mock';
import { v4 as uuidv4 } from "uuid";
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123')
}));

describe('DreamNodeService - getUserNodes Complete Tests', () => {
  let service: DreamNodeService;
  let mockRepository: jest.Mocked<IDreamNodeRepository>;

  const userId = testUser.id;
  const mockDreamNodes: IDreamNode[] = [dreamNodeMock, dreamNodeMockTwo];

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      getUserNodes: jest.fn(),
      countUserNodes: jest.fn(),
    };

    service = new DreamNodeService(mockRepository);
  });

  describe('getUserNodes - Basic functionality', () => {
    it('should return dream nodes with default pagination when no pagination provided', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue(mockDreamNodes);
      mockRepository.countUserNodes.mockResolvedValue(2);
      const filters: IDreamNodeFilters = { state: 'Activo' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(result.data).toEqual(mockDreamNodes);
      expect(result.pagination).toEqual({
        currentPage: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(mockRepository.countUserNodes).toHaveBeenCalledWith(userId, filters);
    });

    it('should handle empty filters', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue([]);
      mockRepository.countUserNodes.mockResolvedValue(0);
      const emptyFilters: IDreamNodeFilters = {};

      // Act
      const result = await service.getUserNodes(userId, emptyFilters);

      // Assert
      expect(result.data).toEqual([]);
      expect(result.pagination).toEqual({
        currentPage: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        emptyFilters,
        { page: 1, limit: 10, offset: 0 }
      );
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      mockRepository.getUserNodes.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getUserNodes(userId, {})).rejects.toThrow(
        'Error obteniendo los nodos de sueño del usuario: Error: Database error'
      );
    });
  });

  describe('getUserNodes - State filters', () => {
    it('should filter by state Activo', async () => {
      // Arrange
      const filteredResult = [dreamNodeMock]; // Solo el sueño activo
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = { state: 'Activo' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by state Archivado', async () => {
      // Arrange
      const filteredResult = [dreamNodeMockTwo]; // Solo el sueño archivado
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = { state: 'Archivado' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getUserNodes - Privacy filters', () => {
    it('should filter by privacy Publico', async () => {
      // Arrange
      const filteredResult = [dreamNodeMock]; // Solo el sueño público
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = { privacy: 'Publico' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by privacy Privado', async () => {
      // Arrange
      const filteredResult = [dreamNodeMockTwo]; // Solo el sueño privado
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = { privacy: 'Privado' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by privacy Anonimo', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue([]);
      mockRepository.countUserNodes.mockResolvedValue(0);
      const filters: IDreamNodeFilters = { privacy: 'Anonimo' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getUserNodes - Emotion filters', () => {
    it('should filter by emotion Felicidad', async () => {
      // Arrange
      const filteredResult = [dreamNodeMock]; // Solo el sueño con Felicidad
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = { emotion: 'Felicidad' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by emotion Tristeza', async () => {
      // Arrange
      const filteredResult = [dreamNodeMockTwo]; // Solo el sueño con Tristeza
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = { emotion: 'Tristeza' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by emotion Miedo', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue([]);
      mockRepository.countUserNodes.mockResolvedValue(0);
      const filters: IDreamNodeFilters = { emotion: 'Miedo' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getUserNodes - Search filters', () => {
    it('should filter by search term in title', async () => {
      // Arrange
      const filteredResult = [dreamNodeMock]; // Contiene "primer" en el título
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = { search: 'primer' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by search term in description', async () => {
      // Arrange
      const filteredResult = [dreamNodeMockTwo]; // Contiene "océano" en la descripción
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = { search: 'océano' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });

    it('should return empty array for search term not found', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue([]);
      mockRepository.countUserNodes.mockResolvedValue(0);
      const filters: IDreamNodeFilters = { search: 'inexistente' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getUserNodes - Date filters', () => {
    it('should filter by from date', async () => {
      // Arrange
      const filteredResult = [dreamNodeMockTwo]; // Solo el sueño después de 2024-01-15
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = { from: '2024-01-15' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by to date', async () => {
      // Arrange
      const filteredResult = [dreamNodeMock]; // Solo el sueño antes de 2024-01-15
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = { to: '2024-01-15' };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by date range (from and to)', async () => {
      // Arrange
      const filteredResult = [dreamNodeMockTwo]; // Solo el primer sueño dentro del rango
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = {
        from: '2024-01-01',
        to: '2024-01-15'
      };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });

    it('should return empty array when no dreams match date range', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue([]);
      mockRepository.countUserNodes.mockResolvedValue(0);
      const filters: IDreamNodeFilters = {
        from: '2025-01-01',
        to: '2025-01-31'
      };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getUserNodes - Combined filters', () => {
    it('should combine state and privacy filters', async () => {
      // Arrange
      const filteredResult = [dreamNodeMock]; // Activo y Público
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = {
        state: 'Activo',
        privacy: 'Publico'
      };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });

    it('should combine emotion and search filters', async () => {
      // Arrange
      const filteredResult = [dreamNodeMockTwo]; // Tristeza y contiene "océano"
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = {
        emotion: 'Tristeza',
        search: 'océano'
      };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });

    it('should return empty when no dreams match combined filters', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue([]);
      mockRepository.countUserNodes.mockResolvedValue(0);
      const filters: IDreamNodeFilters = {
        state: 'Activo',
        emotion: 'Miedo'
      };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should combine all available filters', async () => {
      // Arrange
      const filteredResult = [dreamNodeMock]; // Coincide con todos los filtros
      mockRepository.getUserNodes.mockResolvedValue(filteredResult);
      mockRepository.countUserNodes.mockResolvedValue(1);
      const filters: IDreamNodeFilters = {
        state: 'Activo',
        privacy: 'Publico',
        emotion: 'Felicidad',
        search: 'primer',
        from: '2024-01-01',
        to: '2024-01-15'
      };

      // Act
      const result = await service.getUserNodes(userId, filters);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        { page: 1, limit: 10, offset: 0 }
      );
      expect(result.data).toEqual(filteredResult);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getUserNodes - Pagination calculations', () => {
    it('should calculate correct offset for page 1', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue(mockDreamNodes);
      mockRepository.countUserNodes.mockResolvedValue(2);
      const pagination: IPaginationOptions = { page: 1, limit: 10 };

      // Act
      await service.getUserNodes(userId, {}, pagination);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        {},
        { page: 1, limit: 10, offset: 0 }
      );
    });

    it('should calculate correct offset for page 3 with limit 5', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue([mockDreamNodes[0]!]);
      mockRepository.countUserNodes.mockResolvedValue(15);
      const pagination: IPaginationOptions = { page: 3, limit: 5 };

      // Act
      const result = await service.getUserNodes(userId, {}, pagination);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        {},
        { page: 3, limit: 5, offset: 10 } // (3-1) * 5 = 10
      );
      expect(result.pagination).toEqual({
        currentPage: 3,
        limit: 5,
        total: 15,
        totalPages: 3,
        hasNext: false,
        hasPrev: true
      });
    });

    it('should handle pagination with large dataset', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue(mockDreamNodes);
      mockRepository.countUserNodes.mockResolvedValue(25);
      const pagination: IPaginationOptions = { page: 2, limit: 10 };

      // Act
      const result = await service.getUserNodes(userId, {}, pagination);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        {},
        { page: 2, limit: 10, offset: 10 }
      );
      expect(result.pagination).toEqual({
        currentPage: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true
      });
    });

    it('should handle last page correctly', async () => {
      // Arrange
      const lastPageItems = [mockDreamNodes[0]!]; // Solo 1 elemento en última página
      mockRepository.getUserNodes.mockResolvedValue(lastPageItems);
      mockRepository.countUserNodes.mockResolvedValue(21);
      const pagination: IPaginationOptions = { page: 3, limit: 10 };

      // Act
      const result = await service.getUserNodes(userId, {}, pagination);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        {},
        { page: 3, limit: 10, offset: 20 }
      );
      expect(result.pagination).toEqual({
        currentPage: 3,
        limit: 10,
        total: 21,
        totalPages: 3,
        hasNext: false,
        hasPrev: true
      });
    });

    it('should handle empty page correctly', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue([]);
      mockRepository.countUserNodes.mockResolvedValue(10);
      const pagination: IPaginationOptions = { page: 5, limit: 10 };

      // Act
      const result = await service.getUserNodes(userId, {}, pagination);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        {},
        { page: 5, limit: 10, offset: 40 }
      );
      expect(result.pagination).toEqual({
        currentPage: 5,
        limit: 10,
        total: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: true
      });
    });

    it('should handle single item per page', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue([mockDreamNodes[0]!]);
      mockRepository.countUserNodes.mockResolvedValue(5);
      const pagination: IPaginationOptions = { page: 1, limit: 1 };

      // Act
      const result = await service.getUserNodes(userId, {}, pagination);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        {},
        { page: 1, limit: 1, offset: 0 }
      );
      expect(result.pagination).toEqual({
        currentPage: 1,
        limit: 1,
        total: 5,
        totalPages: 5,
        hasNext: true,
        hasPrev: false
      });
    });
  });

  describe('getUserNodes - Edge cases', () => {
    it('should handle zero total count', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue([]);
      mockRepository.countUserNodes.mockResolvedValue(0);

      // Act
      const result = await service.getUserNodes(userId, {});

      // Assert
      expect(result.pagination).toEqual({
        currentPage: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
    });

    it('should handle count query failure', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue(mockDreamNodes);
      mockRepository.countUserNodes.mockRejectedValue(new Error('Count failed'));

      // Act & Assert
      await expect(service.getUserNodes(userId, {})).rejects.toThrow(
        'Error obteniendo los nodos de sueño del usuario: Error: Count failed'
      );
    });

    it('should use default pagination when pagination is partial', async () => {
      // Arrange
      mockRepository.getUserNodes.mockResolvedValue(mockDreamNodes);
      mockRepository.countUserNodes.mockResolvedValue(2);
      const partialPagination: Partial<IPaginationOptions> = { page: 2 };

      // Act
      await service.getUserNodes(userId, {}, partialPagination as IPaginationOptions);

      // Assert
      expect(mockRepository.getUserNodes).toHaveBeenCalledWith(
        userId,
        {},
        { page: 2, limit: 10, offset: 10 }
      );
    });
  });
});

//save

jest.mock("uuid");

describe("DreamNodeService", () => {
  let service: DreamNodeService;
  let mockRepository: { save: jest.Mock };

  beforeEach(() => {
    mockRepository = {
      save: jest.fn()
    };
    service = new DreamNodeService(mockRepository as any);
    (uuidv4 as jest.Mock).mockReturnValue("uuid-falso");
  });

  it("should save a dreamNode correctly", async () => {
    const userId = "user123";
    const title = "Sueño de prueba";
    const description = "Descripción del sueño";
    const interpretation = "Interpretación del sueño";
    const emotion = "Felicidad";

    await service.saveDreamNode(userId, title, description, interpretation, emotion);

    expect(mockRepository.save).toHaveBeenCalledWith(
      {
        id: "uuid-falso",
        creationDate: expect.any(Date),
        title,
        description,
        interpretation,
        privacy: "Privado",
        state: "Activo",
        emotion: "Felicidad"
      },
      userId
    );
  });

  it("should throw an error if the repository fails", async () => {
    const userId = "user123";
    const title = "Sueño de prueba";
    const description = "Descripción del sueño";
    const interpretation = "Interpretación del sueño";
    const emotion = "Triste";

    mockRepository.save.mockRejectedValue(new Error("Error en DB"));

    await expect(
      service.saveDreamNode(userId, title, description, interpretation, emotion)
    ).rejects.toThrow("Error guardando el nodo de sueño: Error en DB");
  });
});
