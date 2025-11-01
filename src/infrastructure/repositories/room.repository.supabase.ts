import { supabase } from '../../config/supabase';
import { Room } from '../../domain/interfaces/room.interface';
import { IRoomRepository } from '../../domain/repositories/room.repository';

export class RoomRepositorySupabase implements IRoomRepository {
  async getUserRooms(userId: string): Promise<Room[]> {
    const { data, error } = await supabase
      .from('user_room')
      .select(`
        room:room_id (
          id,
          name,
          description,
          image_url,
          preview_light,
          preview_dark,
          model_url,
          price,
          is_default,
          included_in_plan,
          created_at
        )
      `)
      .eq('profile_id', userId);

    if (error) throw new Error(error.message);

    // Transformamos la estructura para que coincida con Room[]
    const rooms = data?.map((item: any) => {
      const room = item.room;
      return {
        id: room.id,
        name: room.name,
        description: room.description,
        imageUrl: room.image_url,
        previewLight: room.preview_light,
        previewDark: room.preview_dark,
        modelUrl: room.model_url,
        price: room.price,
        isDefault: room.is_default,
        includedInPlan: room.included_in_plan,
        createdAt: room.created_at,
        ownershipStatus: 'owned'
      };
    }) || [];

    return rooms;
  }

  async getDefaultRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('room')
      .select(`
        id,
        name,
        description,
        image_url,
        preview_light,
        preview_dark,
        model_url,
        price,
        is_default,
        included_in_plan,
        created_at
      `)
      .eq('is_default', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const rooms = (data as any)?.map((room: any) => ({
      id: room.id,
      name: room.name,
      description: room.description,
      imageUrl: room.image_url,
      previewLight: room.preview_light,
      previewDark: room.preview_dark,
      modelUrl: room.model_url,
      price: room.price,
      isDefault: room.is_default,
      includedInPlan: room.included_in_plan,
      createdAt: room.created_at,
      ownershipStatus: 'not_owned'
    })) || [];

    return rooms;
  }

  async findById(roomId: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('room')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return data as Room;
  }

  async create(room: Omit<Room, 'id' | 'createdAt'>): Promise<Room> {
    const { data, error } = await supabase
      .from('room')
      .insert([room])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data as Room;
  }

  async update(roomId: string, room: Partial<Room>): Promise<Room> {
    const { data, error } = await supabase
      .from('room')
      .update(room)
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data as Room;
  }

  async delete(roomId: string): Promise<void> {
    const { error } = await supabase
      .from('room')
      .delete()
      .eq('id', roomId);

    if (error) throw new Error(error.message);
  }

  async addCompatibleSkin(roomId: string, skinId: string): Promise<Room> {
    const { error } = await supabase
      .from('rooms_compatible_skins')
      .insert([{ room_id: roomId, skin_id: skinId }]);

    if (error) throw new Error(error.message);

    const room = await this.findById(roomId);
    if (!room) throw new Error('Room not found');
    return room;
  }

  async removeCompatibleSkin(roomId: string, skinId: string): Promise<Room> {
    const { error } = await supabase
      .from('rooms_compatible_skins')
      .delete()
      .eq('room_id', roomId)
      .eq('skin_id', skinId);

    if (error) throw new Error(error.message);

    const room = await this.findById(roomId);
    if (!room) throw new Error('Room not found');
    return room;
  }

  async setOwnershipStatus(roomId: string, userId: string, ownershipStatus: string): Promise<Room> {
    if (ownershipStatus === 'owned') {
      const { error } = await supabase
        .from('user_room')
        .insert([{ profile_id: userId, room_id: roomId }]);

      if (error) throw new Error(error.message);
    } else if (ownershipStatus === 'not_owned') {
      const { error } = await supabase
        .from('user_room')
        .delete()
        .eq('profile_id', userId)
        .eq('room_id', roomId);

      if (error) throw new Error(error.message);
    } else {
      throw new Error('Invalid ownership status');
    }

    const room = await this.findById(roomId);
    if (!room) throw new Error('Room not found');
    return room;
  }
}