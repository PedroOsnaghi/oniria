import { Request, Response, NextFunction } from 'express';
import { ContentModerationService } from '../../application/services/content-moderation.service';

const moderationService = new ContentModerationService();
export function contentModerationMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const { description, previousInterpretation, userId } = (req as any).body || {};

    if (typeof description === 'string') {
      const result = moderationService.validateContentInterpretation(description);
      if (!result?.isValid) {
        try {
          moderationService.logInappropriateContent(description, result?.reason || 'Inapropiado', userId);
        } catch {
          /* ignore logging errors */
        }
        return res.status(400).json({ errors: [result?.reason || 'Contenido inapropiado'] });
      }
    }

    if (typeof previousInterpretation === 'string') {
      const result = moderationService.validateContentInterpretation(previousInterpretation);
      if (!result?.isValid) {
        try {
          moderationService.logInappropriateContent(previousInterpretation, result?.reason || 'Inapropiado', userId);
        } catch {
          /* ignore logging errors */
        }
        return res.status(400).json({ errors: [result?.reason || 'Contenido inapropiado'] });
      }
    }

    next();
  } catch (error) {
    console.error('Error in contentModerationMiddleware:', error);
    next();
  }
}

export default contentModerationMiddleware;
