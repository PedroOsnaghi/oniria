import { Badge } from "../models/badge.model";

export interface IBadgeRepository {
  getUserBadges(profileId: string): Promise<Badge[]>;
  awardBadge(profileId: string, badgeId: string): Promise<void>;
}
