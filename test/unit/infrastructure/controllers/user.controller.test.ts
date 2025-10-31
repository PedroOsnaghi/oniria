jest.mock('../../../../src/config/envs', () => ({
    envs: {
        SUPABASE_URL: 'https://fake.supabase.co',
        SUPABASE_KEY: 'fake-key',
        SUPABASE_JWT_SECRET: 'secret',
        PORT: 3000,
        OPENAI_API_KEY: 'fake-key'
    }
}));

import { Request, Response } from 'express';
import { UserController } from '../../../../src/infrastructure/controllers/user.controller';
import { UserService } from '../../../../src/application/services/user.service';
import { SkinService } from '../../../../src/application/services/skin.service';
import { RoomService } from '../../../../src/application/services/room.service';
import { GetUserSkinsResponseDto } from '../../../../src/infrastructure/dtos/skin/get-user-skins.dto';
import { GetUserRoomsResponseDto } from '../../../../src/infrastructure/dtos/room/get-user-rooms.dto';

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockSkinService: jest.Mocked<SkinService>;
  let mockRoomService: jest.Mocked<RoomService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    mockUserService = {
      register: jest.fn(),
      login: jest.fn()
    } as any;

    mockSkinService = {
      getUserSkins: jest.fn(),
      getDefaultSkins: jest.fn()
    } as any;

    mockRoomService = {
      getUserRooms: jest.fn(),
      getDefaultRooms: jest.fn()
    } as any;

    jsonMock = jest.fn();
    mockResponse = {
      json: jsonMock,
      status: jest.fn().mockReturnThis()
    };

    userController = new UserController(mockUserService, mockSkinService, mockRoomService);
  });

  describe('getUserSkins', () => {
    it('should return skins successfully', async () => {
      const mockSkins: GetUserSkinsResponseDto = {
        success: true,
        data: [{
          id: '1',
          name: 'Test Skin',
          description: 'A test skin',
          imageUrl: 'https://example.com/skin.png',
          previewLight: 'https://example.com/skin-light.png',
          previewDark: 'https://example.com/skin-dark.png',
          price: 0,
          creationDate: '2025-10-30T00:00:00Z',
          userId: 'user1',
          isActive: true,
          isDefault: false,
          ownershipStatus: 'owned',
          compatibleRooms: ['room1'],
          includedInPlan: 'free'
        }]
      };

      mockRequest = {
        userId: 'user1'
      } as any;

      mockSkinService.getUserSkins.mockResolvedValue(mockSkins);

      await userController.getUserSkins(mockRequest as Request, mockResponse as Response);

      expect(mockSkinService.getUserSkins).toHaveBeenCalledWith('user1');
      expect(jsonMock).toHaveBeenCalledWith(mockSkins);
    });

    it('should handle errors when getting skins', async () => {
      const error = new Error('Failed to get skins');
      mockRequest = {
        userId: 'user1'
      } as any;

      mockSkinService.getUserSkins.mockRejectedValue(error);

      await userController.getUserSkins(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener los skins del usuario',
        error: 'Failed to get skins'
      });
    });

    it('should validate userId parameter', async () => {
      mockRequest = {
        userId: ''
      } as any;

      await userController.getUserSkins(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'ID de usuario no proporcionado'
      });
      expect(mockSkinService.getUserSkins).not.toHaveBeenCalled();
    });
  });

  describe('getUserRooms', () => {
    it('should return rooms successfully', async () => {
      const mockRooms: GetUserRoomsResponseDto = {
        success: true,
        data: [{
          id: '1',
          name: 'Test Room',
          description: 'A test room',
          imageUrl: 'https://example.com/room.png',
          previewLight: 'https://example.com/room-light.png',
          previewDark: 'https://example.com/room-dark.png',
          modelUrl: 'https://example.com/room.glb',
          price: 0,
          isDefault: false,
          ownershipStatus: 'owned',
          compatibleSkins: ['skin1', 'skin2'],
          includedInPlan: 'free',
          createdAt: new Date('2025-10-30T00:00:00Z'),
          hasAccess: true
        }]
      };

      mockRequest = {
        userId: 'user1'
      } as any;

      mockRoomService.getUserRooms.mockResolvedValue(mockRooms);

      await userController.getUserRooms(mockRequest as Request, mockResponse as Response);

      expect(mockRoomService.getUserRooms).toHaveBeenCalledWith('user1');
      expect(jsonMock).toHaveBeenCalledWith(mockRooms);
    });

    it('should handle errors when getting rooms', async () => {
      const error = new Error('Failed to get rooms');
      mockRequest = {
        userId: 'user1'
      } as any;

      mockRoomService.getUserRooms.mockRejectedValue(error);

      await userController.getUserRooms(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener las habitaciones del usuario',
        error: 'Failed to get rooms'
      });
    });

    it('should validate userId parameter', async () => {
      mockRequest = {
        userId: ''
      } as any;

      await userController.getUserRooms(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'ID de usuario no proporcionado'
      });
      expect(mockRoomService.getUserRooms).not.toHaveBeenCalled();
    });
  });
});