import { Room } from '../interfaces/room.interface';

export interface IRoomRepository {
  getUserRooms(userId: string): Promise<Room[]>;
  getDefaultRooms(): Promise<Room[]>;
  findById(roomId: string): Promise<Room | null>;
  create(room: Omit<Room, 'id' | 'createdAt'>): Promise<Room>;
  update(roomId: string, room: Partial<Room>): Promise<Room>;
  delete(roomId: string): Promise<void>;
  addCompatibleSkin(roomId: string, skinId: string): Promise<Room>;
  removeCompatibleSkin(roomId: string, skinId: string): Promise<Room>;
  setOwnershipStatus(roomId: string, userId: string, ownershipStatus: string): Promise<Room>;
}