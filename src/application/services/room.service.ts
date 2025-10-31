import { Room } from '../../domain/interfaces/room.interface';
import { GetUserRoomsResponseDto, RoomResponseDto } from '../../infrastructure/dtos/room/get-user-rooms.dto';
import { IRoomRepository } from '../../domain/repositories/room.repository';
import { supabase } from '../../config/supabase';

export class RoomService {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async getUserRooms(userId: string): Promise<GetUserRoomsResponseDto> {
    if (!userId) {
      return {
        success: false,
        data: [],
        message: 'ID de usuario no proporcionado'
      };
    }

    try {
      const rooms = await this.roomRepository.getUserRooms(userId);
      const mappedRooms = await this.mapToResponseDto(rooms, userId);
      return {
        success: true,
        data: mappedRooms
      };
    } catch (error) {
      console.error('Error al obtener las habitaciones del usuario:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Error al obtener las habitaciones del usuario'
      };
    }
  }

  async getDefaultRooms(): Promise<Room[]> {
    try {
      return await this.roomRepository.getDefaultRooms();
    } catch (error) {
      console.error('Error al obtener las habitaciones por defecto:', error);
      return [];
    }
  }

  async getRoomById(roomId: string): Promise<Room | null> {
    try {
      return await this.roomRepository.findById(roomId);
    } catch (error) {
      console.error('Error al obtener la habitación:', error);
      return null;
    }
  }

  async createRoom(room: Omit<Room, 'id' | 'createdAt'>): Promise<Room> {
    return await this.roomRepository.create(room);
  }

  async updateRoom(roomId: string, room: Partial<Room>): Promise<Room> {
    const existingRoom = await this.getRoomById(roomId);
    if (!existingRoom) {
      throw new Error('Habitación no encontrada');
    }

    if (room.name !== undefined && room.name.trim() === '') {
      throw new Error('El nombre de la room no puede estar vacío');
    }
    if (room.price !== undefined && room.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    return await this.roomRepository.update(roomId, room);
  }

  async deleteRoom(roomId: string): Promise<boolean> {
    try {
      await this.roomRepository.delete(roomId);
      return true;
    } catch (error) {
      console.error('Error al eliminar la habitación:', error);
      return false;
    }
  }

  async addCompatibleSkin(roomId: string, skinId: string): Promise<Room> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('Habitación no encontrada');
    }

    return await this.roomRepository.addCompatibleSkin(roomId, skinId);
  }

  async removeCompatibleSkin(roomId: string, skinId: string): Promise<Room> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('Habitación no encontrada');
    }

    return await this.roomRepository.removeCompatibleSkin(roomId, skinId);
  }

  async setRoomOwnership(roomId: string, userId: string, ownershipStatus: string): Promise<Room> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('Habitación no encontrada');
    }

    const hasAccess = await this.checkRoomAccess(roomId, userId);
    if (!hasAccess) {
      throw new Error('No tienes permiso para modificar esta habitación');
    }

    return await this.roomRepository.setOwnershipStatus(roomId, userId, ownershipStatus);
  }

  async checkRoomAccess(roomId: string, userId: string): Promise<boolean> {
    if (!roomId || !userId?.trim()) {
      return false;
    }

    try {
      const room = await this.getRoomById(roomId);
      if (!room) {
        return false;
      }

      if (room.isDefault || room.price === 0) {
        return true;
      }

      const { data: userRoom } = await supabase
        .from('user_items')
        .select('ownership_type')
        .eq('user_id', userId)
        .eq('item_id', roomId)
        .eq('item_type', 'room')
        .single();

      if (userRoom?.ownership_type === 'owned') {
        return true;
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', userId)
        .single();

      return !!(userProfile?.subscription_plan && room.includedInPlan === userProfile.subscription_plan);
    } catch (error) {
      console.error('Error al verificar acceso a la habitación:', error);
      return false;
    }
  }

  private async mapToResponseDto(rooms: Room[], userId: string): Promise<RoomResponseDto[]> {
    const mappedRooms: RoomResponseDto[] = [];

    for (const room of rooms) {
      const hasAccess = await this.checkRoomAccess(room.id, userId);
      const mappedRoom: RoomResponseDto = {
        ...room,
        hasAccess
      };
      mappedRooms.push(mappedRoom);
    }

    return mappedRooms;
  }
}