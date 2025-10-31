import { Request, Response } from 'express';
import { IBadgeRepository } from '../../domain/repositories/badge.repository';

export class BadgeController {
  constructor(private readonly badgeRepository: IBadgeRepository) {}

  async myBadges(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) return res.status(401).json({ errors: 'Unauthorized' });

      const badges = await this.badgeRepository.getUserBadges(userId);
      res.json({ badges });
    } catch (e: any) {
      console.error('BadgeController myBadges error:', e);
      res.status(500).json({ errors: 'Error al obtener insignias' });
    }
  }
}
