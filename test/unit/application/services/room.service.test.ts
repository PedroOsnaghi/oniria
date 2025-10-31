import { RoomRepositorySupabase } from '../../../../src/infrastructure/repositories/room.repository.supabase';
import { RoomService } from '../../../../src/application/services/room.service';
jest.mock('../../../../src/config/envs', () => ({
    envs: {
        SUPABASE_URL: 'https://fake.supabase.co',
        SUPABASE_KEY: 'fake-key',
        SUPABASE_JWT_SECRET: 'secret',
        PORT: 3000,
        OPENAI_API_KEY: 'fake-key'
    }
}));

jest.mock('../../../../src/config/supabase', () => {
  const mockUserItemsData = {
    ownership_type: 'owned',
    user_id: 'user1',
    item_id: '2',
    item_type: 'room'
  };

  const mockProfilesData = {
    id: 'user1',
    subscription_plan: 'premium'
  };

  return {
    supabase: {
      from: jest.fn().mockImplementation((table: string) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: table === 'user_items' ? mockUserItemsData : mockProfilesData,
          error: null
        })
      }))
    }
  };
});

import { Room } from '../../../../src/domain/interfaces/room.interface';

describe('RoomService', () => {
  let roomService: RoomService;
  let mockRoomRepository: jest.Mocked<RoomRepositorySupabase>;

  const createMockRoom = (override: Partial<Room> = {}): Room => ({
    id: '1',
    name: 'Living Room',
    description: 'A cozy room',
    imageUrl: 'https://example.com/room1.png',
    previewLight: 'https://example.com/room1-light.png',
    previewDark: 'https://example.com/room1-dark.png',
    modelUrl: 'https://example.com/room1.glb',
    isDefault: true,
    ownershipStatus: 'owned',
    compatibleSkins: ['skin1', 'skin2'],
    createdAt: new Date('2025-10-30T00:00:00Z'),
    ...override
  });

  const mockRooms: Room[] = [
    createMockRoom(),
    createMockRoom({
      id: '2',
      name: 'Bedroom',
      description: 'A peaceful room',
      imageUrl: 'https://example.com/room2.png',
      previewLight: 'https://example.com/room2-light.png',
      previewDark: 'https://example.com/room2-dark.png',
      modelUrl: 'https://example.com/room2.glb',
      isDefault: false,
      price: 100,
      includedInPlan: 'premium',
      ownershipStatus: 'available',
      compatibleSkins: ['skin1'],
      createdAt: new Date('2025-10-30T00:00:00Z')
    })
  ];

  beforeEach(() => {
    mockRoomRepository = {
      getUserRooms: jest.fn(),
      getDefaultRooms: jest.fn(),
      findById: jest.fn(),
      getCompatibleSkins: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getDefaultRoomsWithDependencies: jest.fn()
    } as any;

    roomService = new RoomService(mockRoomRepository);
  });

  describe('getUserRooms', () => {
    it('should return rooms successfully', async () => {
      mockRoomRepository.getUserRooms.mockResolvedValue(mockRooms);

      const result = await roomService.getUserRooms('user1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        id: '1',
        name: 'Living Room',
        description: 'A cozy room',
        imageUrl: 'https://example.com/room1.png',
        previewLight: 'https://example.com/room1-light.png',
        previewDark: 'https://example.com/room1-dark.png',
        modelUrl: 'https://example.com/room1.glb',
        isDefault: true,
        ownershipStatus: 'owned',
        compatibleSkins: ['skin1', 'skin2'],
        hasAccess: false,
        createdAt: new Date('2025-10-30T00:00:00Z')
      });
      expect(mockRoomRepository.getUserRooms).toHaveBeenCalledWith('user1');
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockRoomRepository.getUserRooms.mockRejectedValue(error);

      const result = await roomService.getUserRooms('user1');

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.message).toBe('Database error');
      expect(mockRoomRepository.getUserRooms).toHaveBeenCalledWith('user1');
    });

    it('should handle empty userId', async () => {
      const result = await roomService.getUserRooms('');

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.message).toBe('ID de usuario no proporcionado');
      expect(mockRoomRepository.getUserRooms).not.toHaveBeenCalled();
    });
  });

  describe('getDefaultRooms', () => {
    it('should return default rooms successfully', async () => {
      const defaultRooms = mockRooms.filter(room => room.isDefault);
      mockRoomRepository.getDefaultRooms.mockResolvedValue(defaultRooms);

      const result = await roomService.getDefaultRooms();

      expect(result).toEqual(defaultRooms);
      expect(mockRoomRepository.getDefaultRooms).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockRoomRepository.getDefaultRooms.mockRejectedValue(error);

      const result = await roomService.getDefaultRooms();
      expect(result).toEqual([]);
      expect(mockRoomRepository.getDefaultRooms).toHaveBeenCalled();
    });
  });

  describe('checkRoomAccess', () => {
    it('should return true for default rooms', async () => {
      const defaultRoom = createMockRoom({ isDefault: true });
      mockRoomRepository.findById.mockResolvedValue(defaultRoom);

      const result = await roomService.checkRoomAccess('1', 'user1');

      expect(result).toBe(true);
      expect(mockRoomRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should return true for owned rooms', async () => {
      // Setup mock room
      const ownedRoom = createMockRoom({
        id: '2',
        isDefault: false,
        price: 100,
        includedInPlan: 'premium'
      });
      mockRoomRepository.findById.mockResolvedValue(ownedRoom);

      // El mock de Supabase ya está configurado a nivel de módulo

      const result = await roomService.checkRoomAccess('2', 'user1');

      expect(result).toBe(true);
      expect(mockRoomRepository.findById).toHaveBeenCalledWith('2');
    });

    it('should return false for non-existent room', async () => {
      mockRoomRepository.findById.mockResolvedValue(null);

      const result = await roomService.checkRoomAccess('999', 'user1');

      expect(result).toBe(false);
      expect(mockRoomRepository.findById).toHaveBeenCalledWith('999');
    });

    it('should return false when no userId is provided', async () => {
      // Clear any existing mock state
      mockRoomRepository.findById.mockClear();

      const result = await roomService.checkRoomAccess('1', '');

      expect(result).toBe(false);
      expect(mockRoomRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('updateRoom', () => {
    it('should update room successfully', async () => {
      const existingRoom = createMockRoom();
      const updateData: Partial<Room> = { name: 'Updated Room' };
      const updatedRoom = createMockRoom({ ...updateData });

      mockRoomRepository.findById.mockResolvedValue(existingRoom);
      mockRoomRepository.update.mockResolvedValue(updatedRoom);

      const result = await roomService.updateRoom('1', updateData);

      expect(result).toEqual(updatedRoom);
      expect(mockRoomRepository.findById).toHaveBeenCalledWith('1');
      expect(mockRoomRepository.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should throw error when room not found', async () => {
      mockRoomRepository.findById.mockResolvedValue(null);

      await expect(roomService.updateRoom('999', { name: 'New Name' }))
        .rejects.toThrow('Habitación no encontrada');
    });

    it('should validate update data', async () => {
      const existingRoom = createMockRoom();
      mockRoomRepository.findById.mockResolvedValue(existingRoom);

      await expect(roomService.updateRoom('1', { name: '' }))
        .rejects.toThrow('El nombre de la room no puede estar vacío');

      await expect(roomService.updateRoom('1', { price: -100 }))
        .rejects.toThrow('El precio no puede ser negativo');
    });
  });
});