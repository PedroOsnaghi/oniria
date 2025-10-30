import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { IBadgeRepository } from "../../domain/repositories/badge.repository";
import { IMissionRepository } from "../../domain/repositories/mission.repository";

export class MissionService {
  constructor(
    private readonly dreamNodeRepository: IDreamNodeRepository,
    private readonly missionRepository: IMissionRepository,
    private readonly badgeRepository: IBadgeRepository
  ) {}

 
  async onDreamSaved(profileId: string): Promise<void> {
    const totalDreams = await this.dreamNodeRepository.countUserNodes(
      profileId,
      {} as any
    );

    // Misiones por cantidad de sueños guardados
    await this.updateCounterMission(profileId, 'first_dream', totalDreams); // target 1
    await this.updateCounterMission(profileId, 'five_dreams', totalDreams); // target 5
    await this.updateCounterMission(profileId, 'dedicated_dreamer', totalDreams); // target 10
    await this.updateCounterMission(profileId, 'dream_explorer', totalDreams); // target 25
    await this.updateCounterMission(profileId, 'dream_master', totalDreams); // target 50

   // Misiones por racha de dias
    const currentStreak = await this.computeCurrentStreak(profileId);
    await this.updateStreakMission(profileId, 'constant_dreamer', currentStreak); // target 3
    await this.updateStreakMission(profileId, 'dream_routine', currentStreak); // target 7
    await this.updateStreakMission(profileId, 'dream_diary', currentStreak); // target 30
  }

  private async updateCounterMission(profileId: string, missionCode: string, count: number) {
    const missions = await this.missionRepository.getAllMissions();
    const mission = missions.find(m => m.code === missionCode);
    if (!mission || !mission.target) return;

    const progress = Math.min(count, mission.target);
    const completed = progress >= mission.target;
    const updated = await this.missionRepository.upsertUserMission(profileId, missionCode, progress, completed);

    if (completed && mission.badgeId) {

      await this.badgeRepository.awardBadge(profileId, mission.badgeId);
    }
  }


  async onDreamReinterpreted(profileId: string): Promise<void> {
    await this.incrementalEventMission(profileId, 'reflective_interpreter', 1);
  }


  private async incrementalEventMission(profileId: string, missionCode: string, delta: number) {
    const missions = await this.missionRepository.getAllMissions();
    const mission = missions.find(m => m.code === missionCode);
    if (!mission || !mission.target) return;

    const existing = await this.missionRepository.getUserMission(profileId, missionCode);
    const current = existing?.progress ?? 0;
    const next = Math.min(current + delta, mission.target);
    const completed = next >= mission.target;
    await this.missionRepository.upsertUserMission(profileId, missionCode, next, completed);

    if (completed && mission.badgeId) {
      await this.badgeRepository.awardBadge(profileId, mission.badgeId);
    }
  }


  private async updateStreakMission(profileId: string, missionCode: string, currentStreak: number) {
    const missions = await this.missionRepository.getAllMissions();
    const mission = missions.find(m => m.code === missionCode);
    if (!mission || !mission.target) return;

    const progress = Math.min(currentStreak, mission.target);
    const completed = progress >= mission.target;
    await this.missionRepository.upsertUserMission(profileId, missionCode, progress, completed);

    if (completed && mission.badgeId) {
      await this.badgeRepository.awardBadge(profileId, mission.badgeId);
    }
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
