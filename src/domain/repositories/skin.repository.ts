import { Skin } from '../interfaces/skin.interface';

export interface ISkinRepository {
  getUserSkins(userId: string): Promise<Skin[]>;
  getDefaultSkins(): Promise<Skin[]>;
  findById(skinId: string): Promise<Skin | null>;
  create(skin: Omit<Skin, 'id' | 'createdAt'>): Promise<Skin>;
  update(skinId: string, skin: Partial<Skin>): Promise<Skin>;
  delete(skinId: string): Promise<void>;
  addCompatibleRoom(skinId: string, roomId: string): Promise<Skin>;
  removeCompatibleRoom(skinId: string, roomId: string): Promise<Skin>;
  setOwnershipStatus(skinId: string, userId: string, ownershipStatus: string): Promise<Skin>;
  getCompatibleSkins(roomId: string): Promise<Skin[]>;
}