import { supabase } from "../../config/supabase";
import { IBadgeRepository } from "../../domain/repositories/badge.repository";
import { Badge } from "../../domain/models/badge.model";

export class BadgeRepositorySupabase implements IBadgeRepository {
  async getUserBadges(profileId: string): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('user_badge')
      .select('badge:badge_id ( id, badge_description, badge_image )')
      .eq('profile_id', profileId);

    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => ({
      id: row.badge.id,
      description: row.badge.badge_description || undefined,
      imageUrl: row.badge.badge_image || undefined,
    }));
  }

  async awardBadge(profileId: string, badgeId: string): Promise<void> {
    // Insert if not exists
    const { error } = await supabase
      .from('user_badge')
      .upsert({ profile_id: profileId, badge_id: badgeId }, { onConflict: 'profile_id,badge_id' });

    if (error) throw new Error(error.message);
  }
}
