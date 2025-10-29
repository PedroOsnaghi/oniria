import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { IBadgeRepository } from "../../domain/repositories/badge.repository";
import { IMissionRepository } from "../../domain/repositories/mission.repository";

/**
 * MissionService
 * - Evaluates and updates mission progress based on domain events
 * - Awards badges when missions complete
 */
export class MissionService {
  constructor(
    private readonly dreamNodeRepository: IDreamNodeRepository,
    private readonly missionRepository: IMissionRepository,
    private readonly badgeRepository: IBadgeRepository
  ) {}

  /**
   * Called after a dream node is saved for a user
   */
  async onDreamSaved(profileId: string): Promise<void> {
    // Evaluate simple counter missions based on total dreams
  const totalDreams = await this.dreamNodeRepository.countUserNodes(profileId, {} as any);

    // First Dream (target 1)
    await this.updateCounterMission(profileId, 'first_dream', totalDreams);

    // Five Dreams (target 5)
    await this.updateCounterMission(profileId, 'five_dreams', totalDreams);
  }

  private async updateCounterMission(profileId: string, missionCode: string, count: number) {
    const missions = await this.missionRepository.getAllMissions();
    const mission = missions.find(m => m.code === missionCode);
    if (!mission || !mission.target) return;

    const progress = Math.min(count, mission.target);
    const completed = progress >= mission.target;
    const updated = await this.missionRepository.upsertUserMission(profileId, missionCode, progress, completed);

    if (completed && mission.badgeId) {
      // Award badge (idempotent in repo layer)
      await this.badgeRepository.awardBadge(profileId, mission.badgeId);
    }
  }
}
