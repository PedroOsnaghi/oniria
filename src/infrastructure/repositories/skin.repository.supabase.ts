import { supabase } from '../../config/supabase';
import { Skin } from '../../domain/interfaces/skin.interface';
import { ISkinRepository } from '../../domain/repositories/skin.repository';

export class SkinRepositorySupabase implements ISkinRepository {
  async getUserSkins(userId: string): Promise<Skin[]> {
    const { data, error } = await supabase
      .from('user_skin')
      .select(`
        skin:skin_id (
          id,
          name,
          description,
          image_url,
          preview_light,
          preview_dark,
          supports_themes,
          objects_light,
          objects_dark,
          walls_light,
          walls_dark,
          price,
          is_default,
          included_in_plan,
          created_at
        )
      `)
      .eq('profile_id', userId);

    if (error) throw new Error(error.message);

    const skins = data?.map((item: any) => {
      const skin = item.skin;
      return {
        id: skin.id,
        name: skin.name,
        description: skin.description,
        imageUrl: skin.image_url,
        previewLight: skin.preview_light,
        previewDark: skin.preview_dark,
        supportsThemes: skin.supports_themes || false,
        objectsLight: skin.objects_light,
        objectsDark: skin.objects_dark,
        wallsLight: skin.walls_light,
        wallsDark: skin.walls_dark,
        price: skin.price,
        isDefault: skin.is_default,
        isActive: true,
        includedInPlan: skin.included_in_plan,
        createdAt: skin.created_at,
        ownershipStatus: 'owned'
      };
    }) || [];

    return skins;
  }

  async getDefaultSkins(): Promise<Skin[]> {
    const { data, error } = await supabase
      .from('skin')
      .select('*')
      .eq('is_default', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const skins = (data as any)?.map((skin: any) => ({
      id: skin.id,
      name: skin.name,
      description: skin.description,
      imageUrl: skin.image_url,
      previewLight: skin.preview_light,
      previewDark: skin.preview_dark,
      supportsThemes: skin.supports_themes || false,
      objectsLight: skin.objects_light,
      objectsDark: skin.objects_dark,
      wallsLight: skin.walls_light,
      wallsDark: skin.walls_dark,
      price: skin.price,
      isDefault: skin.is_default,
      isActive: true,
      includedInPlan: skin.included_in_plan,
      createdAt: skin.created_at,
      ownershipStatus: 'not_owned'
    })) || [];

    return skins;
  }

  async findById(skinId: string): Promise<Skin | null> {
    const { data, error } = await supabase
      .from('skin')
      .select('*')
      .eq('id', skinId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw new Error(error.message);
    }

    return data as Skin;
  }

  async getCompatibleSkins(roomId: string): Promise<Skin[]> {
    const { data, error } = await supabase
      .from('skin')
      .select('*')
      .contains('compatible_rooms', [roomId])
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data as Skin[];
  }

  async create(skin: Omit<Skin, 'id' | 'createdAt'>): Promise<Skin> {
    const { data, error } = await supabase
      .from('skin')
      .insert([skin])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data as Skin;
  }

  async update(skinId: string, skin: Partial<Skin>): Promise<Skin> {
    const { data, error } = await supabase
      .from('skin')
      .update(skin)
      .eq('id', skinId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data as Skin;
  }

  async delete(skinId: string): Promise<void> {
    const { error } = await supabase
      .from('skin')
      .delete()
      .eq('id', skinId);

    if (error) throw new Error(error.message);
  }

  async addCompatibleRoom(skinId: string, roomId: string): Promise<Skin> {
    const { error } = await supabase
      .from('rooms_compatible_skins')
      .insert([{ room_id: roomId, skin_id: skinId }]);

    if (error) throw new Error(error.message);

    const skin = await this.findById(skinId);
    if (!skin) throw new Error('Skin not found');
    return skin;
  }

  async removeCompatibleRoom(skinId: string, roomId: string): Promise<Skin> {
    const { error } = await supabase
      .from('rooms_compatible_skins')
      .delete()
      .eq('room_id', roomId)
      .eq('skin_id', skinId);

    if (error) throw new Error(error.message);

    const skin = await this.findById(skinId);
    if (!skin) throw new Error('Skin not found');
    return skin;
  }

  async setOwnershipStatus(skinId: string, userId: string, ownershipStatus: string): Promise<Skin> {
    if (ownershipStatus === 'owned') {
      const { error } = await supabase
        .from('user_skin')
        .insert([{ profile_id: userId, skin_id: skinId }]);

      if (error) throw new Error(error.message);
    } else if (ownershipStatus === 'not_owned') {
      const { error } = await supabase
        .from('user_skin')
        .delete()
        .eq('profile_id', userId)
        .eq('skin_id', skinId);

      if (error) throw new Error(error.message);
    } else {
      throw new Error('Invalid ownership status');
    }

    const skin = await this.findById(skinId);
    if (!skin) throw new Error('Skin not found');
    return skin;
  }
}