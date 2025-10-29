import { Mission, UserMissionProgress } from "../models/mission.model";

export interface IMissionRepository {
  getAllMissions(): Promise<Mission[]>;
  getUserMission(profileId: string, missionCode: string): Promise<UserMissionProgress | null>;
  upsertUserMission(profileId: string, missionCode: string, progress: number, complete: boolean): Promise<UserMissionProgress>;
}
