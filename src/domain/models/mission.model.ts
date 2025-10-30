export type MissionType = 'counter' | 'streak' | 'time-window' | 'set-completion';

export interface Mission {
  id: number;
  code: string; 
  title: string;
  description?: string;
  type: MissionType;
  target?: number; 
  badgeId?: string; 
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
