import { Badge } from "../models/badge.model";

export interface IBadgeRepository {
  getUserBadges(profileId: string): Promise<Badge[]>;
  getBadgeById(badgeId: string): Promise<Badge | null>;
  awardBadge(profileId: string, badgeId: string): Promise<void>;
}
