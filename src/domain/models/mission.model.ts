export type MissionType = 'counter' | 'streak' | 'time-window' | 'set-completion';

export interface Mission {
  id: number;
  code: string; // unique
  title: string;
  description?: string;
  type: MissionType;
  target?: number; // e.g., number of actions required
  badgeId?: string; // badge unlocked when completed
}

export interface UserMissionProgress {
  missionId: number;
  code: string;
  title: string;
  description?: string;
  type: MissionType;
  target?: number;
  progress: number;
  completedAt?: Date | null;
}
