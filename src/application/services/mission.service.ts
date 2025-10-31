import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { IBadgeRepository } from "../../domain/repositories/badge.repository";
import { IMissionRepository } from "../../domain/repositories/mission.repository";
import { Badge } from "../../domain/models/badge.model";

export class MissionService {
  constructor(
    private readonly dreamNodeRepository: IDreamNodeRepository,
    private readonly missionRepository: IMissionRepository,
    private readonly badgeRepository: IBadgeRepository
  ) {}

 
  async onDreamSaved(profileId: string): Promise<Badge[]> {
    const unlockedBadges: Badge[] = [];
    const isDev = process.env.NODE_ENV !== 'production';
    
    const totalDreams = await this.dreamNodeRepository.countUserNodes(
      profileId,
      {} as any
    );
    const previousCount = Math.max(0, totalDreams - 1);
    if (isDev) console.log('[MissionService] onDreamSaved', { totalDreams, previousCount, profileId });

    // Misiones por cantidad de sueños guardados
    const counterMissions = ['first_dream', 'five_dreams', 'dedicated_dreamer', 'dream_explorer', 'dream_master'];
    for (const missionCode of counterMissions) {
      const badge = await this.updateCounterMission(profileId, missionCode, totalDreams, previousCount);
      if (isDev) console.log('[MissionService] counter check', { missionCode, totalDreams, previousCount, unlocked: !!badge });
      if (badge) unlockedBadges.push(badge);
    }

   // Misiones por racha de dias
    const currentStreak = await this.computeCurrentStreak(profileId);
    const previousStreak = await this.estimatePreviousStreak(profileId, currentStreak);
    if (isDev) console.log('[MissionService] streaks', { currentStreak, previousStreak });
    const streakMissions = ['constant_dreamer', 'dream_routine', 'dream_diary'];
    for (const missionCode of streakMissions) {
      const badge = await this.updateStreakMission(profileId, missionCode, currentStreak, previousStreak);
      if (isDev) console.log('[MissionService] streak check', { missionCode, currentStreak, previousStreak, unlocked: !!badge });
      if (badge) unlockedBadges.push(badge);
    }

    return unlockedBadges;
  }

  private async updateCounterMission(profileId: string, missionCode: string, count: number, previousCount: number): Promise<Badge | null> {
    const missions = await this.missionRepository.getAllMissions();
    const mission = missions.find(m => m.code === missionCode);
    if (!mission || !mission.target) return null;

    const progress = Math.min(count, mission.target);
    const completed = progress >= mission.target;
    

    const existing = await this.missionRepository.getUserMission(profileId, missionCode);
    const wasAlreadyCompleted = existing?.completedAt != null;
    const crossedThreshold = previousCount < mission.target && count >= mission.target;
    
    const updated = await this.missionRepository.upsertUserMission(profileId, missionCode, progress, completed);

    if (process.env.NODE_ENV !== 'production') console.log('[MissionService] counter mission', { missionCode, target: mission.target, progress, completed, wasAlreadyCompleted, crossedThreshold });

    if (completed && crossedThreshold && !wasAlreadyCompleted && mission.badgeId) {
      await this.badgeRepository.awardBadge(profileId, mission.badgeId);
      
      const badge = await this.badgeRepository.getBadgeById(mission.badgeId);
      return badge;
    }
    
    return null;
  }


  async onDreamReinterpreted(profileId: string): Promise<Badge[]> {
    const badge = await this.incrementalEventMission(profileId, 'reflective_interpreter', 1);
    return badge ? [badge] : [];
  }


  private async incrementalEventMission(profileId: string, missionCode: string, delta: number): Promise<Badge | null> {
    const missions = await this.missionRepository.getAllMissions();
    const mission = missions.find(m => m.code === missionCode);
    if (!mission || !mission.target) return null;

    const existing = await this.missionRepository.getUserMission(profileId, missionCode);
    const current = existing?.progress ?? 0;
    const wasAlreadyCompleted = existing?.completedAt != null;
    
    const next = Math.min(current + delta, mission.target);
    const completed = next >= mission.target;
    await this.missionRepository.upsertUserMission(profileId, missionCode, next, completed);

    if (process.env.NODE_ENV !== 'production') {
      console.log('[MissionService] incrementalEvent', {
        missionCode,
        missionId: (mission as any).id,
        badgeId: mission.badgeId,
        current,
        delta,
        next,
        completed,
        wasAlreadyCompleted
      });
    }
   
   
    if (completed && !wasAlreadyCompleted && mission.badgeId) {
      await this.badgeRepository.awardBadge(profileId, mission.badgeId);
      
      const badge = await this.badgeRepository.getBadgeById(mission.badgeId);
      return badge;
    }
    
    return null;
  }


  private async updateStreakMission(profileId: string, missionCode: string, currentStreak: number, previousStreak: number): Promise<Badge | null> {
    const missions = await this.missionRepository.getAllMissions();
    const mission = missions.find(m => m.code === missionCode);
    if (!mission || !mission.target) return null;

    const progress = Math.min(currentStreak, mission.target);
    const completed = progress >= mission.target;
    
    const existing = await this.missionRepository.getUserMission(profileId, missionCode);
    const wasAlreadyCompleted = existing?.completedAt != null;
    const crossedThreshold = previousStreak < mission.target && currentStreak >= mission.target;
    
    await this.missionRepository.upsertUserMission(profileId, missionCode, progress, completed);

    if (process.env.NODE_ENV !== 'production') console.log('[MissionService] streak mission', { missionCode, target: mission.target, progress, completed, wasAlreadyCompleted, crossedThreshold });

    if (completed && crossedThreshold && !wasAlreadyCompleted && mission.badgeId) {
      await this.badgeRepository.awardBadge(profileId, mission.badgeId);
      
      const badge = await this.badgeRepository.getBadgeById(mission.badgeId);
      return badge;
    }
    
    return null;
  }

  private async estimatePreviousStreak(profileId: string, currentStreak: number): Promise<number> {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const filters = { from: start.toISOString(), to: end.toISOString() } as any;
    const dreamsToday = await this.dreamNodeRepository.countUserNodes(profileId, filters);
    const isFirstDreamToday = dreamsToday <= 1; // after the save, 1 means first dream of today
    return isFirstDreamToday ? Math.max(0, currentStreak - 1) : currentStreak;
  }


  private async computeCurrentStreak(profileId: string): Promise<number> {

    const today = new Date();
    const lookbackDays = 60;
    const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - lookbackDays));
    const to = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1)); // inclusive of today

    const filters = {
      from: from.toISOString(),
      to: to.toISOString(),
    } as any;

    const dreams = await this.dreamNodeRepository.getUserNodes(profileId, filters, { page: 1, limit: 1000, offset: 0 });

   /* daySet contiene el string con las fechas de creacion de sueños de los ultimos 60 dias y esas fehcas les da un formato especifico,
    recorre todos los sueños y si la fecha se normaliza correctamente, la agrega al set.
   luego se hace un for 60 veces (60 dias), donde se hace una key con la fecha normalizada contando desde hoy hasta 60 dias atras. 
   Si dayset contiene esa fecha en el set, se suma uno a la racha, si no, se corta*/
    const daySet = new Set<string>();
    for (const d of dreams) {
    
      const dt = new Date((d as any).creationDate);
      if (isNaN(dt.getTime())) continue;
      daySet.add(this.toUTCDateKey(dt));
    }

    let streak = 0;
    for (let i = 0; i < lookbackDays + 1; i++) {
      const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
      const key = this.toUTCDateKey(date);
      if (daySet.has(key)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  //normaliza la fecha a formato yyyy-mm-dd en UTC
  private toUTCDateKey(d: Date): string {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
