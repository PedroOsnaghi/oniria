import { Request, Response } from 'express';
import { IMissionRepository } from '../../domain/repositories/mission.repository';

export class MissionController {
  constructor(private readonly missionRepository: IMissionRepository) {}

  async myMissions(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) return res.status(401).json({ errors: 'Unauthorized' });

      const missions = await this.missionRepository.getUserMissions(userId);
      return res.json({ missions });
    } catch (e: any) {
      console.error('MissionController myMissions error:', e);
      return res.status(500).json({ errors: 'Error al obtener misiones' });
    }
  }
}
