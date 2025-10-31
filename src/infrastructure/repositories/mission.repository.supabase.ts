import { supabase } from "../../config/supabase";
import { IMissionRepository } from "../../domain/repositories/mission.repository";
import { Mission, UserMissionProgress } from "../../domain/models/mission.model";

export class MissionRepositorySupabase implements IMissionRepository {
  
  
  async getAllMissions(): Promise<Mission[]> {
    const { data, error } = await supabase
      .from('mission')
      .select('id, code, title, description, type, target');
    if (error) throw new Error(error.message);

    const missions: any[] = (data || []).map((m: any) => ({
      id: m.id,
      code: m.code,
      title: m.title,
      description: m.description || undefined,
      type: m.type,
      target: m.target || undefined,
    }));

    // mapea mision a badge si existe
    if (missions.length > 0) {
      const missionIds = missions.map(m => m.id);
      const { data: badges, error: bErr } = await supabase
        .from('badge')
        .select('id, mission_id')
        .in('mission_id', missionIds as any);
      if (bErr) throw new Error(bErr.message);
      const byMission: Record<number, string> = {};
      //mapea rapido la mision con su badge
      (badges || []).forEach((b: any) => {
        if (b.mission_id) byMission[b.mission_id] = b.id;
      });
      missions.forEach(m => {
        const b = byMission[m.id];
        if (b) m.badgeId = b;
      });
    }

    return missions as Mission[];
  }

  async getUserMissions(profileId: string): Promise<UserMissionProgress[]> {

    const missions = await this.getAllMissions();
    if (missions.length === 0) return [];


    const missionIds = missions.map(m => m.id);
    const { data: progresses, error: pErr } = await supabase
      .from('user_mission')
      .select('mission_id, progress, completed_at')
      .in('mission_id', missionIds as any)
      .eq('profile_id', profileId);
    if (pErr) throw new Error(pErr.message);

    const byMission: Record<number, { progress: number; completed_at: string | null }> = {};
    (progresses || []).forEach((p: any) => {
      byMission[p.mission_id] = { progress: p.progress || 0, completed_at: p.completed_at || null };
    });


    const result: UserMissionProgress[] = missions.map((m) => {
      const prog = byMission[m.id];
      return {
        missionId: m.id,
        code: m.code,
        title: m.title,
        description: m.description,
        type: m.type,
        target: m.target,
        progress: prog ? prog.progress : 0,
        completedAt: prog && prog.completed_at ? new Date(prog.completed_at) : null,
      } as UserMissionProgress;
    });

    return result;
  }

  async getUserMission(profileId: string, missionCode: string): Promise<UserMissionProgress | null> {
    const { data, error } = await supabase
      .from('user_mission')
      .select('progress, completed_at, mission:mission_id ( id, code, title, description, type, target )')
      .eq('profile_id', profileId)
      .eq('mission.code', missionCode)
      .single();

    if (error || !data || !(data as any).mission) return null;
    const m = data as any;
    return {
      missionId: m.mission.id,
      code: m.mission.code,
      title: m.mission.title,
      description: m.mission.description || undefined,
      type: m.mission.type,
      target: m.mission.target || undefined,
      progress: m.progress || 0,
      completedAt: m.completed_at ? new Date(m.completed_at) : null,
    };
  }

  //update o insert de mision
  async upsertUserMission(profileId: string, missionCode: string, progress: number, complete: boolean): Promise<UserMissionProgress> {

    const { data: missionData, error: missionErr } = await supabase
      .from('mission').select('id, code, title, description, type, target').eq('code', missionCode).single();
    if (missionErr || !missionData) throw new Error(missionErr?.message || 'Mission not found');

    const payload: any = {
      profile_id: profileId,
      mission_id: missionData.id,
      progress,
      last_event_at: new Date().toISOString(),
    };
    if (complete) payload.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('user_mission')
      .upsert(payload, { onConflict: 'profile_id,mission_id' });
    if (error) throw new Error(error.message);

    return {
      missionId: missionData.id,
      code: missionData.code,
      title: missionData.title,
      description: missionData.description || undefined,
      type: missionData.type,
      target: missionData.target || undefined,
      progress,
      completedAt: complete ? new Date() : null,
    };
  }
}
